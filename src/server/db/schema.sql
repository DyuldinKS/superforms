CREATE TABLE IF NOT EXISTS states (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS tables (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL 
);


CREATE TABLE IF NOT EXISTS recipient_types (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS recipients (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	type_id INTEGER NOT NULL REFERENCES recipient_types(id),
	active BOOLEAN DEFAULT true,
	created TIMESTAMP DEFAULT now(),
	updated TIMESTAMP,
	deleted TIMESTAMP,
	author_id INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_lists (
	id SERIAL PRIMARY KEY,
	author_id INTEGER NOT NULL,
	status_id INTEGER NOT NULL REFERENCES states(id),
	created TIMESTAMP DEFAULT now()
);


CREATE TABLE IF NOT EXISTS recipient_in_lists (
	recipient_id INTEGER NOT NULL REFERENCES recipients(id),
	list_id INTEGER NOT NULL REFERENCES recipient_lists(id)
);


CREATE TABLE IF NOT EXISTS tags (
	id SERIAL PRIMARY KEY,
	tag VARCHAR(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_tags (
	recipient_id INTEGER NOT NULL REFERENCES recipients(id),
	tag_id INTEGER NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS organizations (
	id INTEGER PRIMARY KEY REFERENCES recipients(id)
		DEFERRABLE INITIALLY DEFERRED,
	info JSONB NOT NULL
);


CREATE TABLE IF NOT EXISTS org_links (
	org_id INTEGER NOT NULL REFERENCES organizations(id),
	parent_id INTEGER NOT NULL REFERENCES organizations(id),
	distance INTEGER NOT NULL DEFAULT 1
);


CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY REFERENCES recipients(id)
		DEFERRABLE INITIALLY DEFERRED,
	org_id INTEGER NOT NULL REFERENCES organizations(id)
		DEFERRABLE INITIALLY DEFERRED,
	info JSONB NOT NULL,
	role_id INTEGER NOT NULL REFERENCES roles(id),
	hash VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS user_tokens (
	user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token VARCHAR(255) UNIQUE NOT NULL,
	created TIMESTAMP DEFAULT now()
);


CREATE TABLE IF NOT EXISTS user_sessions (
	sid varchar NOT NULL COLLATE "default",
	sess JSONB NOT NULL,
	expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);


CREATE TABLE IF NOT EXISTS forms (
	id SERIAL PRIMARY KEY,
	scheme JSONB NOT NULL,
	options JSONB,
	author_id INTEGER NOT NULL REFERENCES users(id),
	status_id INTEGER NOT NULL REFERENCES states(id),
	modified TIMESTAMP
);


CREATE TABLE IF NOT EXISTS responses (
	id SERIAL PRIMARY KEY,
	form_id INTEGER NOT NULL REFERENCES forms(id),
	list JSONB NOT NULL,
	author_id INTEGER NOT NULL REFERENCES users(id),
	recipient_id INTEGER NOT NULL REFERENCES recipients(id),
	status_id INTEGER NOT NULL,
	modified TIMESTAMP
);


CREATE TABLE IF NOT EXISTS recipient_lists_tags (
	list_id INTEGER NOT NULL REFERENCES recipient_lists(id),
	tag_id INTEGER NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS form_recipient_lists (
	form_id INTEGER NOT NULL REFERENCES forms(id),
	list_id INTEGER NOT NULL REFERENCES recipient_lists(id),
	rights INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS logs(
	id SERIAL PRIMARY KEY,
	operation CHAR(1) NOT NULL,
	entity CHAR(4) NOT NULL,
	entity_id INTEGER NOT NULL,
	changes JSON NOT NULL,
	time TIMESTAMP DEFAULT now(),
	author_id INTEGER NOT NULL,

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