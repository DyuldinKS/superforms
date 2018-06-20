/**********************************  INDEXES **********************************/


CREATE INDEX CONCURRENTLY form_info_tsvector_idx
ON form_info USING gist(tsvector);



/******************************  EXTRA FUNCTIONS ******************************/


CREATE TYPE item AS (
	i integer,
	hash text,
	body json
);


CREATE OR REPLACE FUNCTION get_ordered_items(_scheme json)
	RETURNS SETOF item AS
$$
	SELECT list.i::int, each.*
	FROM json_each(_scheme->'items') each,
		json_array_elements_text(_scheme->'order') WITH ORDINALITY AS list(hash, i)
	WHERE list.hash = each.key
	ORDER BY list.i;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION get_ordered_questions(_scheme json)
	RETURNS SETOF item AS
$$
	SELECT row_number() OVER (ORDER BY i)::int, hash, body
	FROM get_ordered_items(_scheme)
	WHERE body->>'itemType' != 'delimeter';
$$
	LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION count_questions(_scheme json)
	RETURNS integer AS
$$
	SELECT count(*)::int FROM get_ordered_questions(_scheme);
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION count_responses(_form_id integer)
	RETURNS integer AS
$$
	SELECT count(id)::int FROM responses WHERE form_id = _form_id;
$$
LANGUAGE SQL STABLE;



/***********************************  TYPES ***********************************/


CREATE TYPE form_extra AS (
	id integer,
	title text,
	description text,
	scheme json,
	owner_id integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	author_id integer,
	collecting collecting,
	question_count integer,
	response_count integer
);


CREATE TYPE form_full AS (
	id integer,
	title text,
	description text,
	scheme json,
	"ownerId" integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer,
	collecting json,
	"questionCount" integer,
	"responseCount" integer
);


CREATE TYPE form_short AS (
	id integer,
	title text,
	description text,
	"ownerId" integer,
	created timestamptz,
	collecting json,
	"questionCount" integer,
	"responseCount" integer
);


CREATE OR REPLACE FUNCTION to_forms(
	_props json,
	OUT _record forms
) AS
$$
	DECLARE
		_form form_full;
		_collecting collecting;
	BEGIN
		_record := json_populate_record(null::forms, _props);
		_form := json_populate_record(null::form_full, _props);

		_record.owner_id = coalesce(_record.owner_id, _form."ownerId");
		_record.author_id = coalesce(_record.author_id, _form."authorId");
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION to_collecting(_props json)
	RETURNS collecting AS
$$
	SELECT json_populate_record(null::collecting, _props);
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION collecting_to_json(_collecting collecting)
	RETURNS json AS
$$
	SELECT CASE WHEN _collecting IS null
		THEN null
		ELSE json_strip_nulls(row_to_json(_collecting))
	END;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_form_full(_form form_extra)
	RETURNS form_full AS
$$
	SELECT _form.id,
		_form.title,
		_form.description,
		_form.scheme,
		_form.owner_id,
		_form.created,
		_form.updated,
		_form.deleted,
		_form.author_id,
		collecting_to_json(_form.collecting),
		_form.question_count,
		_form.response_count
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION to_form_short(_form form_extra)
	RETURNS form_short AS
$$
	SELECT _form.id,
		_form.title,
		_form.description,
		_form.owner_id,
		_form.created,
		collecting_to_json(_form.collecting),
		_form.question_count,
		_form.response_count
$$
LANGUAGE SQL STABLE;


CREATE CAST (json AS forms)
WITH FUNCTION to_forms(json);


CREATE CAST (form_extra AS form_full)
WITH FUNCTION to_form_full(form_extra);


CREATE CAST (form_extra AS form_short)
WITH FUNCTION to_form_short(form_extra);



/*******************************  CRUD METHODS ********************************/


CREATE OR REPLACE FUNCTION get_form(_id integer)
	RETURNS form_extra AS
$$
	SELECT f.*,
		collecting,
		count_questions(scheme),
		count_responses(id)
		FROM forms f
		LEFT JOIN collecting USING (id)
		WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_forms(_ids integer[])
	RETURNS SETOF form_extra AS
$$
	SELECT forms.*, collecting, questions.count, responses.count
	FROM forms
	LEFT JOIN collecting USING (id)
	LEFT JOIN (
		SELECT form_id AS id, count(id)::int AS count
		FROM responses
		GROUP BY form_id
	) responses USING (id),
	LATERAL (
		SELECT count(*)::int AS count
		FROM json_each(scheme->'items')
		WHERE value->>'itemType' != 'delimeter'
	) questions
	WHERE id = ANY (_ids);
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION set_collecting(
	_form_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _new collecting
) AS
$$
	DECLARE
		_action varchar(4);
		_changes json;
	BEGIN
		IF _props->>'collecting' IS null THEN RETURN; END IF;

		_new := to_collecting(_props->'collecting');
		_new.id := _form_id;

		-- try to update
		UPDATE collecting c
		SET start = coalesce(_new.start, c.start),
			stop = coalesce(_new.stop, c.stop),
			shared = coalesce(_new.shared, c.shared),
			refilling = coalesce(_new.refilling, c.refilling)
		WHERE c.id = _new.id;

		-- if update is successful
		IF found THEN
			_action = 'U';
		ELSE
			-- set default values and insert new record
			_new.start = coalesce(_new.start, _time);
			_new.refilling = coalesce(_new.refilling, false);
			INSERT INTO collecting SELECT _new.*;
			_action = 'I';
		END IF;

		-- log changes
		_changes := json_strip_nulls(row_to_json(_new));
		PERFORM log(_action, 'clct', _new.id, _changes, _author_id, _time);
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form(
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _form form_extra
) AS
$$
	DECLARE
		_new forms;
		_changes json;
	BEGIN
		_new := to_forms(_props);
		_new.id = nextval('forms_id_seq');
		_new.created = coalesce(_new.created, _time);
		_new.author_id = _author_id;

		INSERT INTO forms SELECT _new.*;
		PERFORM set_collecting(_new.id, _props, _author_id, _time);

		-- log changes
		_changes := json_strip_nulls(row_to_json(_new));
		PERFORM log('I', 'form', _new.id, _changes, _author_id, _time);

		_form := get_form(_new.id);
	END;
$$
LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION update_form(
	_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _updated form_extra
) AS
$$
	DECLARE
		_new forms;
		_changes json;
	BEGIN
		_new := _props::forms;
		_new.id := null;
		_new.updated = _time;
		_new.author_id = _author_id;

		UPDATE forms f
		SET title = coalesce(_new.title, f.title),
			description = coalesce(_new.description, f.description),
			scheme = coalesce(_new.scheme, f.scheme),
			owner_id = coalesce(_new.owner_id, f.owner_id),
			created = coalesce(_new.created, f.created),
			updated = _new.updated,
			deleted = coalesce(_new.deleted, f.deleted),
			author_id = _new.author_id
		WHERE f.id = _id;

		PERFORM set_collecting(_id, _props, _author_id, _time);

		_changes := json_strip_nulls(row_to_json(_new));
		PERFORM log('U', 'form', _id, _changes, _author_id, _time);

		SELECT * FROM get_form(_id) INTO _updated;
	END;
$$
LANGUAGE plpgsql;



/***********************************  SEARCH **********************************/


CREATE OR REPLACE FUNCTION filter_user_forms(
	_users integer[],
	_opts jsonb DEFAULT NULL
) RETURNS TABLE (
	row_num bigint,
	form_id integer,
	user_id integer
) AS
$$
	DECLARE
		_query tsquery := to_tsquery('russian', _opts->>'info');
		_deleted boolean := (_opts->>'deleted')::boolean;
	BEGIN
		RETURN QUERY
			SELECT row_number() over(ORDER BY id DESC) AS row_num, id, owner_id
			FROM forms
			JOIN form_info USING (id)
			WHERE owner_id = ANY (_users)
				AND (_query IS NULL OR tsvector @@ _query)
				AND (_deleted IS NULL
					OR (_deleted IS false AND deleted IS NULL)
					OR (_deleted IS true AND deleted IS NOT NULL));
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION build_forms_object(_ids integer[])
	RETURNS json AS
$$
	SELECT json_object_agg(form.id, row_to_json(form_short))
	FROM get_forms(_ids) form, to_form_short(form) form_short;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_user_forms(
	_users integer[],
	_opts jsonb DEFAULT NULL
) RETURNS TABLE (entities json, list json) AS
$$
	WITH _filtered_forms AS (
		SELECT * FROM filter_user_forms(_users, _opts)
	),
	-- get part of forms
	_limited_forms AS (
		SELECT * FROM _filtered_forms
		WHERE _opts->'last' IS NULL OR row_num > (
			SELECT row_num FROM _filtered_forms
			WHERE form_id = (_opts->>'last')::int
		)
		ORDER BY row_num LIMIT (_opts->>'limit')::int
	),
	-- arrays of ids
	_arrays AS (
		-- ids of filtered ordered and limited forms
		SELECT array_agg(form_id ORDER BY row_num) AS limited,
			-- ids of the form owners
			array_agg(DISTINCT user_id) AS users,
			-- ids of all filtered and NOT limited forms
			(SELECT array_agg(form_id) FROM _filtered_forms) AS filtered
		FROM _limited_forms
	)
	SELECT json_build_object(
			'forms', build_forms_object(limited),
			'users', build_users_object(users)
		) AS entities,
		build_entity_id_list_object(filtered, limited) AS list
	FROM _arrays;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_user_forms(
	_user_id integer,
	_opts jsonb DEFAULT NULL
) RETURNS TABLE (entities json, list json) AS
$$
	SELECT * FROM find_user_forms(array[_user_id], _opts);
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_forms_in_org(
	_org_id integer,
	_opts jsonb DEFAULT NULL
) RETURNS TABLE (entities json, list json) AS
$$
	SELECT * FROM find_user_forms(
		(SELECT array_agg(id) FROM users WHERE org_id = _org_id),
		_opts
	);
$$
LANGUAGE SQL STABLE;



/**********************************  TRIGGERS  *********************************/


CREATE OR REPLACE FUNCTION forms_insert()
	RETURNS TRIGGER AS
$$
	BEGIN
		INSERT INTO form_info
		SELECT new.id, build_form_info_tsvector(
			new.title,
			owner.info,
			new.description
		)
		FROM (
			SELECT info FROM users WHERE id = new.owner_id
		) AS owner;
		RETURN new;
	END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION forms_update()
	RETURNS TRIGGER AS
$$
	BEGIN
		IF new.title <> old.title OR new.description <> old.description THEN
			UPDATE form_info
			SET tsvector = build_form_info_tsvector(
				new.title,
				owner.info,
				new.description
			)
			FROM (
				SELECT info FROM users WHERE id = new.owner_id
			) AS owner
			WHERE form_info.id = new.id;
		END IF;
		RETURN new;
	END
$$
LANGUAGE plpgsql;


CREATE TRIGGER forms_ai
	AFTER INSERT ON forms
	FOR EACH ROW
	EXECUTE PROCEDURE forms_insert();


CREATE TRIGGER forms_au
	AFTER UPDATE ON forms
	FOR EACH ROW
	EXECUTE PROCEDURE forms_update();
