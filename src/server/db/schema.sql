CREATE TABLE IF NOT EXISTS states (
	id serial PRIMARY KEY,
	name varchar(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS roles (
	id serial PRIMARY KEY,
	name varchar(255) UNIQUE NOT NULL
);


CREATE TYPE rcpt_type AS enum('rcpt', 'user', 'org');


CREATE TABLE IF NOT EXISTS recipients (
	id serial PRIMARY KEY,
	email varchar(255) NOT NULL UNIQUE,
	type rcpt_type,
	active boolean DEFAULT true,
	created timestamp DEFAULT now(),
	updated timestamp,
	deleted timestamp,
	author_id integer NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_lists (
	id serial PRIMARY KEY,
	author_id integer NOT NULL,
	status_id integer NOT NULL REFERENCES states(id),
	created timestamp DEFAULT now()
);


CREATE TABLE IF NOT EXISTS recipient_in_lists (
	recipient_id integer NOT NULL REFERENCES recipients(id),
	list_id integer NOT NULL REFERENCES recipient_lists(id)
);


CREATE TABLE IF NOT EXISTS tags (
	id serial PRIMARY KEY,
	tag varchar(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_tags (
	recipient_id integer NOT NULL REFERENCES recipients(id),
	tag_id integer NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS organizations (
	id integer PRIMARY KEY REFERENCES recipients(id)
		DEFERRABLE INITIALLY DEFERRED,
	info jsonb NOT NULL
);


CREATE TABLE IF NOT EXISTS org_links (
	org_id integer NOT NULL REFERENCES organizations(id),
	parent_id integer NOT NULL REFERENCES organizations(id),
	distance integer NOT NULL DEFAULT 1
);


CREATE TABLE IF NOT EXISTS users (
	id integer PRIMARY KEY REFERENCES recipients(id)
		DEFERRABLE INITIALLY DEFERRED,
	org_id integer NOT NULL REFERENCES organizations(id)
		DEFERRABLE INITIALLY DEFERRED,
	info jsonb NOT NULL,
	role_id integer NOT NULL REFERENCES roles(id),
	hash varchar(255)
);


CREATE TABLE IF NOT EXISTS user_tokens (
	user_id integer UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token varchar(255) UNIQUE NOT NULL,
	created timestamp DEFAULT now()
);


CREATE TABLE IF NOT EXISTS user_sessions (
	sid varchar NOT NULL COLLATE "default",
	sess jsonb NOT NULL,
	expire timestamp(6) NOT NULL
) WITH (OIDS=FALSE);


CREATE TABLE IF NOT EXISTS forms (
	id serial PRIMARY KEY,
	scheme jsonb NOT NULL,
	options jsonb,
	author_id integer NOT NULL REFERENCES users(id),
	status_id integer NOT NULL REFERENCES states(id),
	modified timestamp
);


CREATE TABLE IF NOT EXISTS responses (
	id serial PRIMARY KEY,
	form_id integer NOT NULL REFERENCES forms(id),
	list jsonb NOT NULL,
	author_id integer NOT NULL REFERENCES users(id),
	recipient_id integer NOT NULL REFERENCES recipients(id),
	status_id integer NOT NULL,
	modified timestamp
);


CREATE TABLE IF NOT EXISTS recipient_lists_tags (
	list_id integer NOT NULL REFERENCES recipient_lists(id),
	tag_id integer NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS form_recipient_lists (
	form_id integer NOT NULL REFERENCES forms(id),
	list_id integer NOT NULL REFERENCES recipient_lists(id),
	rights integer NOT NULL
);


CREATE TABLE IF NOT EXISTS logs(
	id serial PRIMARY KEY,
	operation char(1) NOT NULL,
	entity char(4) NOT NULL,
	entity_id integer NOT NULL,
	changes json NOT NULL,
	time timestamp DEFAULT now(),
	author_id integer NOT NULL,

	CONSTRAINT logs_author_id_fkey
	FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
	DEFERRABLE INITIALLY DEFERRED
);


ALTER TABLE recipients ADD CONSTRAINT recipients_author_id_fkey
FOREIGN KEY (author_id) REFERENCES users(id)
DEFERRABLE INITIALLY DEFERRED;


ALTER TABLE recipient_lists ADD CONSTRAINT recipient_lists_author_id_fkey
FOREIGN KEY (author_id) REFERENCES users(id);


-------------------------------- FOR TESTS -------------------------------------
--------------------------------------------------------------------------------

-- select * from get_subordinate('users', 2);
-- select * from get_subordinate('users', 3);
-- select * from get_subordinate('users', 4);
-- select * from get_subordinate('orgs', 15);
-- select * from get_subordinate('orgs', 2, '{"minDepth": 0}')



-- CREATE OR REPLACE FUNCTION my_test_func(
-- 	_org_id integer,
-- 	_filter jsonb DEFAULT NULL
-- ) RETURNS SETOF entity AS
-- $$
-- 	DECLARE
-- 		a entity[];
-- 	BEGIN
-- 		a := array_agg(org) FROM get_subordinate('organizations', _org_id, _filter) org;
-- 		RETURN QUERY SELECT * FROM unnest(a);
-- 	END
-- $$
-- LANGUAGE plpgsql STABLE;


-- WITH
-- 	_filtered_orgs AS (
-- 		SELECT find_subordinate('organizations', 2, '{ "minDepth": 0, "maxDepth": 2 }') id
-- 	),
-- 	_parent_orgs AS (
-- 		SELECT p_id
-- 		FROM _filtered_orgs org, LATERAL get_parent_org_id(org.id) p_id
-- 		WHERE p_id IS NOT NULL
-- 	),
-- 	_filtered_with_parents AS (
-- 		SELECT id from _filtered_orgs
-- 		UNION
-- 		SELECT p_id from _parent_orgs
-- 	)
-- SELECT array(_filtered_orgs) FROM _filtered_orgs;
-- SELECT json_object_agg(
-- 	org_info.id,
-- 	info || (row_to_json(org_info)::jsonb - 'info')
-- )
-- FROM _filtered_with_parents org, LATERAL get_org_info(org.id) org_info;



--------------------- BASED ON FUNCTION ARRAYS OUTPUT --------------------------
--------------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION find_subordinate_orgs_with_parents(
-- 	_org_id integer,
-- 	_filter jsonb DEFAULT NULL
-- ) RETURNS TABLE(entities json, list json) AS
-- $$
-- 	DECLARE
-- 		_filtered_orgs integer[] := find_subordinate('organizations', _org_id, _filter);
-- 		_orgs_with_parents integer[] := union_with_parent_orgs(_filtered_orgs);
-- 	BEGIN
-- 		RETURN QUERY
-- 			-- build organizations object
-- 			SELECT json_build_object(
-- 				'orgs', coalesce(
-- 					(
-- 						SELECT json_object_agg(
-- 							org_info.id,
-- 							info || (row_to_json(org_info)::jsonb - 'info')
-- 						)
-- 						FROM unnest(_orgs_with_parents) id,
-- 							LATERAL get_org_info(id) org_info
-- 					),
-- 					'{}'
-- 				)
-- 			) AS entities,
-- 			json_build_object(
-- 			-- the actual part of filtered organizations ids list
-- 				'entries',
-- 				(SELECT coalesce(array_to_json(_filtered_orgs), '[]')),
-- 				-- full length of filtered organizations list
-- 				'count',
-- 				(SELECT coalesce(array_length(_filtered_orgs, 1), 0))
-- 			) AS list;
-- 	END
-- $$
-- LANGUAGE plpgsql STABLE;