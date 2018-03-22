CREATE TYPE usr AS (
	id integer,
	email text,
	active boolean,
	role text,
	info json
);


CREATE OR REPLACE FUNCTION rebuild_user(_id integer)
	RETURNS usr AS
$$
	SELECT usr.id, usr.email,
		CASE st.name WHEN 'active' THEN true ELSE false END AS active,
		CASE role.name WHEN 'employee' THEN 'user' ELSE role.name END AS role,
		json_build_object(
			'firstName', usr.name,
			'lastName', usr.surname,
			'patronomyc', usr.patronymic
		) AS info
	FROM users usr
	JOIN user_status_logs usl ON usl.user_id = usr.id
		AND usl.changed IN (
			SELECT max(changed)
			FROM user_status_logs
			GROUP BY user_id
		)
	JOIN status st ON usl.status_id = st.id
	JOIN user_roles ur ON ur.user_id = usr.id
	JOIN roles role ON ur.role_id = role.id
	WHERE usr.id = _id;
$$
LANGUAGE SQL STABLE;


\copy (SELECT row_to_json(rebuild_user(id)) FROM users ORDER BY id) to 'test/server/data/imc-users.tmp'


CREATE TYPE form AS (
	id integer,
	title text,
	description text,
	scheme json,
	sent json,
	owner_id integer,
	created timestamptz,
	updated timestamptz,
	author_id integer
);


CREATE OR REPLACE FUNCTION rebuild_items(_items json)
	RETURNS json AS
$$
	SELECT json_build_object(
		'order', json_agg(id ORDER BY id),
		'items', json_object_agg(id, item)
	)
	FROM (
		SELECT
		left(md5(index::text || item::text), 6) AS id,
		(item - '_type') || json_build_object(
			'itemType', CASE WHEN item->>'_type' = 'delimeter' THEN 'delimeter' ELSE 'input' END
		)::jsonb AS item
		FROM (
			SELECT json_array_elements(_items)::jsonb AS item,
				generate_series(0, json_array_length(_items) - 1) AS index
			FROM forms WHERE id = 230
		) AS unnested
	) AS modified;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION rebuild_form(_id integer)
	RETURNS form AS
$$
	SELECT id, template->>'title', template->>'description',
		rebuild_items(template->'items') AS scheme,
		json_build_object(
			'time', sent,
			'expires', expires,
			'refilling', allowrefill
		) AS sent,
		user_id AS owner_id,
		created,
		edited AS updated,
		user_id AS author_id
	FROM forms
	WHERE id = _id;
$$
LANGUAGE SQL STABLE;


\copy (SELECT row_to_json(rebuild_form(id)) FROM forms ORDER BY id) to 'test/server/data/imc-forms.tmp'
