/*********************************  SYSTEM  ***********************************/


CREATE OR REPLACE FUNCTION get_bot_id() RETURNS integer AS
$$
	SELECT min(id) FROM users
$$
LANGUAGE SQL IMMUTABLE;



/**********************************  ROLES  ***********************************/


CREATE OR REPLACE FUNCTION get_role_name(
	_role_id integer
) RETURNS varchar(255) AS
$$
	SELECT name FROM roles WHERE id = _role_id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_role_id(
	_role varchar(255)
) RETURNS integer AS
$$
	SELECT id FROM roles WHERE name = _role;
$$
LANGUAGE SQL STABLE;



/*********************************  ENTITIES  *********************************/


CREATE TYPE entity AS (
	id INTEGER,
	email VARCHAR(255),
	info JSONB,
	created TIMESTAMP,
	updated TIMESTAMP,
	deleted TIMESTAMP,
	author_id INTEGER
);


CREATE OR REPLACE FUNCTION get_subordinate_orgs(
	_org_id integer,
	_filter jsonb DEFAULT '{}'
) RETURNS SETOF entity AS
$$
	DECLARE
		_min_depth integer := coalesce((_filter->>'minDepth')::int, 1);
		_max_depth integer := (_filter->>'maxDepth')::int;
		_active boolean := (_filter->>'active')::boolean;
		_deleted boolean := (_filter->>'deleted')::boolean;
	BEGIN
		RETURN QUERY
			SELECT org.id, rcpt.email, org.info, rcpt.created,
				rcpt.updated, rcpt.deleted, rcpt.author_id
			FROM organizations org
			JOIN recipients rcpt ON rcpt.id = org.id
			JOIN org_links links ON links.parent_id = _org_id
				AND links.org_id = org.id
			WHERE links.distance >= _min_depth
				AND (_max_depth IS NULL OR links.distance <= _max_depth)
				AND (_active IS NULL OR rcpt.active = _active)
				AND (_deleted IS NULL
					OR (_deleted IS false AND rcpt.deleted IS NULL)
					OR (_deleted IS true AND rcpt.deleted IS NOT NULL));
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION get_subordinate_users(
	_org_id integer,
	_filter jsonb DEFAULT '{}'
) RETURNS SETOF entity AS
$$
	DECLARE
		_active boolean := (_filter->>'active')::boolean;
		_role_id integer := get_role_id(_filter->>'role');
		_deleted boolean := (_filter->>'deleted')::boolean;
	BEGIN
		IF _filter->'minDepth' IS NULL THEN
			_filter := jsonb_set(_filter, '{minDepth}', '0');
		END IF;

		RETURN QUERY
			SELECT usr.id, rcpt.email, usr.info, rcpt.created,
				rcpt.updated, rcpt.deleted, rcpt.author_id
			FROM users usr
			JOIN recipients rcpt ON rcpt.id = usr.id
			WHERE usr.org_id IN (
				SELECT id FROM get_subordinate_orgs(_org_id, _filter - 'active')
			)
				AND (_active IS NULL OR rcpt.active = _active)
				AND (_role_id IS NULL OR usr.role_id = _role_id)
				AND (_deleted IS NULL
					OR (_deleted IS false AND rcpt.deleted IS NULL)
					OR (_deleted IS true AND rcpt.deleted IS NOT NULL));
	END;
$$
LANGUAGE plpgsql STABLE;


-- find subordinate organizations
CREATE OR REPLACE FUNCTION get_subordinate(
	_table varchar(255),
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS SETOF entity AS
$$
	BEGIN
		CASE _table
		WHEN 'orgs' THEN RETURN QUERY
			SELECT * FROM get_subordinate_orgs(_org_id, _filter);
		WHEN 'users' THEN RETURN QUERY
			SELECT * FROM get_subordinate_users(_org_id, _filter);
		END CASE;
	END;
$$
LANGUAGE plpgsql STABLE;


-- find and filter by text search subordinate organizations
CREATE OR REPLACE FUNCTION find_subordinate(
	_table varchar(255),
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS SETOF integer AS
$$
	DECLARE
		_search_text text := coalesce(_filter->>'email', _filter->>'info');
	BEGIN
		CASE
			WHEN _search_text IS NULL THEN RETURN QUERY
				-- find all subordinate
				SELECT id FROM get_subordinate(_table, _org_id, _filter)
				ORDER BY id;

			WHEN _filter->>'email' IS NOT NULL THEN RETURN QUERY
				-- find by email
				SELECT id FROM get_subordinate(_table, _org_id, _filter)
				WHERE email ILIKE _search_text
				ORDER BY id;

			WHEN _filter->>'info' IS NOT NULL THEN RETURN QUERY
				-- find by full text search on info
				SELECT id FROM (
					SELECT id, to_tsvector('russian', info) AS document
					FROM get_subordinate(_table, _org_id, _filter)
				) AS subordinate_orgs
				WHERE document @@ to_tsquery('russian', _search_text)
				ORDER BY ts_rank(document, to_tsquery('russian', _search_text)) DESC, id;

		END CASE;
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION build_entities_object(
	_table varchar(255),
	_ids integer[],
	OUT entities json
) AS
$$
	DECLARE
		_func_name varchar(255) := CASE _table
			WHEN 'users' THEN 'get_user'
			WHEN 'orgs' THEN 'get_org'
		END;
	BEGIN
		EXECUTE format(
			'SELECT coalesce(
				(
					SELECT json_object_agg(
						entity_id,
						info || (row_to_json(entity_record)::jsonb - ''info'')
					)
					FROM unnest($1) entity_id,
						LATERAL %s(entity_id) entity_record
				),
			''{}''
			);',
			_func_name
		)
		USING _ids
		INTO entities;
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION build_list_object(_ids integer[])
	RETURNS json AS
$$
	SELECT json_build_object(
		'entries',
		(SELECT coalesce(array_to_json(_ids), '[]')),
		-- full length of filtered organizations list
		'count',
		(SELECT coalesce(array_length(_ids, 1), 0))
	);
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION log(
	_operation char(1),
	_entity char(4),
	_entity_id integer,
	_changes json,
	_author_id integer
) RETURNS logs AS
$$
	INSERT INTO logs(operation, entity, entity_id, changes, author_id)
	VALUES(_operation, _entity, _entity_id, _changes, _author_id)
	RETURNING *;
$$
LANGUAGE SQL;
