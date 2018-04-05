CREATE TYPE usr AS (
	id integer,
	email text,
	active boolean,
	role text,
	info json,
	created timestamptz
);


CREATE OR REPLACE FUNCTION rebuild_user(_id integer)
	RETURNS usr AS
$$
	SELECT users.id,
		users.email,
		(
			SELECT status_id != 3
			FROM user_status_logs
			WHERE changed IN (
				SELECT max(changed)
				FROM user_status_logs
				WHERE user_id = _id
				GROUP BY user_id
			)
		) AS active,
		CASE role.name WHEN 'employee' THEN 'user' ELSE role.name END AS role,
		json_build_object(
			'firstName', users.name,
			'lastName', users.surname,
			'patronymic', users.patronymic
		) AS info,
		(
			SELECT min(changed)
			FROM user_status_logs
			WHERE status_id = 2 AND user_id = _id
			GROUP BY user_id
		) AS created
	FROM users
	JOIN user_roles ur ON ur.user_id = users.id
	JOIN roles role ON ur.role_id = role.id
	WHERE users.id = _id;
$$
LANGUAGE SQL STABLE;


DROP TABLE new_forms CASCADE;
DROP TABLE new_responses CASCADE;


CREATE TABLE new_forms (
	id integer PRIMARY KEY,
	title text NOT NULL,
	description text,
	scheme json NOT NULL,
	sent json,
	owner_id integer NOT NULL REFERENCES users(id),
	created timestamptz NOT NULL DEFAULT now(),
	updated timestamptz,
	deleted timestamptz,
	author_id integer NOT NULL REFERENCES users(id)
);


CREATE TABLE new_responses (
	id integer,
	form_id integer NOT NULL REFERENCES new_forms(id),
	items json NOT NULL,
	owner_id integer,
	recipient_id integer,
	created timestamptz DEFAULT now(),
	updated timestamptz,
	deleted timestamptz,
	author_id integer REFERENCES users(id)
);


CREATE OR REPLACE FUNCTION rebuild_item_body(_item json)
	RETURNS jsonb AS
$$
	SELECT jsonb_strip_nulls(
		_item::jsonb - '_type'
			|| jsonb_build_object(
				'itemType', (
					CASE _item->>'_type'
					WHEN 'delimeter' THEN 'delimeter'
					ELSE 'input'
					END
				),
				'type', (
					CASE _item->>'type'
					WHEN 'integer' THEN 'number'
					WHEN 'float' THEN 'number'
					WHEN 'financial' THEN 'number'
					ELSE _item->>'type'
					END
				),
				'integer', (
					CASE _item->>'type'
					WHEN 'integer' THEN true
					ELSE null
					END
				),
				'required', (_item->>'required')::boolean,
				'multiple', (_item->>'multiple')::boolean,
				'max', nullif(_item->>'selectmax', '')::integer,
				'description', nullif(_item->>'description', '')
			)
	);
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION rebuild_items(_items json)
	RETURNS json AS
$$
	SELECT json_build_object(
		'order', json_agg(id ORDER BY index),
		'items', json_object_agg(id, item)
	)
	FROM (
		SELECT
		index,
		left(md5(index::text || item::text), 4) AS id,
		rebuild_item_body(item) AS item
		FROM json_array_elements(_items)
			WITH ORDINALITY AS ordered(item, index)
	) AS modified;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION rebuild_form(_id integer)
	RETURNS new_forms AS
$$
	SELECT id,
		template->>'title',
		template->>'description',
		rebuild_items(template->'items') AS scheme,
		json_strip_nulls(
			json_build_object(
				'time', sent,
				'expires', expires,
				'refilling', allowrefill
			)
		) AS sent,
		user_id AS owner_id,
		created,
		edited AS updated,
		null::timestamptz AS deleted,
		user_id AS author_id
	FROM forms
	WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_ordered_items(_form_id integer)
	RETURNS TABLE (i integer, hash text, body json) AS
$$
	SELECT list.i::int, each.*
	FROM new_forms form,
		json_array_elements_text(form.scheme->'order')
			WITH ORDINALITY AS list(hash, i),
		json_each(form.scheme->'items') each
	WHERE form.id = _form_id AND list.hash = each.key
	ORDER BY list.i;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_ordered_questions(_form_id integer)
	RETURNS TABLE (i integer, hash text, body json) AS
$$
	SELECT row_number() OVER (ORDER BY i)::int, hash, body
	FROM get_ordered_items(_form_id)
	WHERE body->>'itemType' != 'delimeter'
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION rebuild_select_answer(
	answer json,
	options json,
	multiple boolean,
	OUT res json
) AS
$$
	DECLARE
		answer_as_text text;
		json_array json;
	BEGIN
		IF multiple = true THEN
			answer_as_text := answer::text;
			IF regexp_matches(answer_as_text, '\A\[.*\]\Z') IS NOT NULL THEN
				json_array := answer; -- already json array
			ELSIF regexp_matches(answer_as_text, '\A".*"\Z') IS NOT NULL THEN
				-- json string
				json_array := to_json( -- convert array to json
					regexp_split_to_array(
						trim(both '"' from answer_as_text), -- trim double quotes
						E',\\s+' -- split string
					)
				);
			ELSE
				json_array := null; -- unexpected value
			END IF;
		ELSE json_array = json_build_array(answer);
		END IF;

		SELECT json_object_agg(i - 1, true)
		FROM json_array_elements_text(json_array) selected_opt,
			json_array_elements_text(options)
				WITH ORDINALITY AS opts(value, i)
		WHERE opts.value = selected_opt
		INTO res;
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION rebuild_answer(
	answer json,
	options json,
	multiple boolean
) RETURNS json AS
$$
	SELECT CASE
		WHEN options IS NULL THEN
			-- convert empty strings to null
			CASE WHEN answer#>>'{}' = '' THEN null ELSE answer END
		-- the question type is 'select'
		ELSE rebuild_select_answer(answer, options, multiple)
	END;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION rebuild_responses_by_form(_form_id integer)
	RETURNS SETOF new_responses AS
$$
	SELECT resp.id,
		_form_id,
		json_strip_nulls(
			json_object_agg(
				question.hash,
				rebuild_answer(
					answer.body,
					question.body->'options',
					(question.body->>'multiple')::boolean
				)
			)
		) AS items,
		null::int,
		null::int,
		resp.received AS created,
		null::timestamptz,
		null::timestamptz,
		null::int
	FROM responses resp, json_array_elements(resp.list)
	WITH ORDINALITY answer(body, i)
	JOIN LATERAL get_ordered_questions(resp.form_id) question
	USING (i)
	WHERE resp.form_id = _form_id AND resp.list::text != '{}'
	GROUP BY resp.id;
$$
LANGUAGE SQL STABLE;


INSERT INTO new_forms
SELECT form.* FROM forms, rebuild_form(id) form;


INSERT INTO new_responses
SELECT resp.* FROM forms,
LATERAL rebuild_responses_by_form(id) resp;


\copy (SELECT row_to_json(rebuild_user(id)) FROM users ORDER BY id) to 'test/server/data/imc-users.tmp'
\copy (SELECT row_to_json(form) FROM new_forms form ORDER BY id) to 'test/server/data/imc-forms.tmp'
\copy (SELECT row_to_json(resp) FROM new_responses resp ORDER BY id) to 'test/server/data/imc-responses.tmp'
