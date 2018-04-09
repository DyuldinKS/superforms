/*********************************  SYSTEM  ***********************************/


CREATE OR REPLACE FUNCTION get_bot_id() RETURNS integer AS
$$
	SELECT min(id) FROM users
$$
LANGUAGE SQL IMMUTABLE;



/**********************************  ROLES  ***********************************/


CREATE OR REPLACE FUNCTION get_role_name(_role_id integer)
	RETURNS varchar(255) AS
$$
	SELECT name FROM roles WHERE id = _role_id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_role_id(_role varchar(255))
	RETURNS integer AS
$$
	SELECT id FROM roles WHERE name = _role;
$$
LANGUAGE SQL STABLE;



/*********************************  ENTITIES  *********************************/


CREATE OR REPLACE FUNCTION build_list_object(_ids integer[])
	RETURNS json AS
$$
	SELECT json_build_object(
		'entries',
		(SELECT coalesce(array_to_json(_ids), '[]')),
		'count',
		(SELECT coalesce(array_length(_ids, 1), 0))
	);
$$
LANGUAGE SQL STABLE;



/***********************************  LOGS  ***********************************/


CREATE OR REPLACE FUNCTION log(
	_operation char(1),
	_entity char(4),
	_entity_id integer,
	_changes json,
	_author_id integer,
	_time timestamptz DEFAULT now()
) RETURNS logs AS
$$
	INSERT INTO logs(operation, entity, entity_id, changes, author_id, time)
	VALUES(_operation, _entity, _entity_id, _changes, _author_id, _time)
	RETURNING *;
$$
LANGUAGE SQL;


CREATE OR REPLACE FUNCTION jsonb_object_merge(a jsonb, b jsonb)
	RETURNS jsonb AS
$$
	SELECT a || b;
$$
LANGUAGE SQL IMMUTABLE;


CREATE AGGREGATE jsonb_object_merge_agg(jsonb) (
	sfunc = jsonb_object_merge,
	stype = jsonb,
	initcond = '{}'
);
