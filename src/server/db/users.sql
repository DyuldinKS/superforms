CREATE INDEX users_info_idx ON users
USING gin(to_tsvector('russian', info));


CREATE TYPE usr AS (
	id INTEGER,
	email VARCHAR(255),
	info JSONB,
	role VARCHAR(255),
	active BOOLEAN,
	"orgId" INTEGER,
	created TIMESTAMP
);


CREATE OR REPLACE FUNCTION create_user(
	_rcpt_id integer,
	_org_id integer,
	_info jsonb,
	_role varchar(255),
	_author_id integer
) RETURNS usr AS
$$
	WITH rcpt_u AS (
		UPDATE recipients
		SET type_id = get_rcpt_type_id('user')
		WHERE id = _rcpt_id
		RETURNING *
	),
	usr_i AS (
		INSERT INTO users(id, org_id, info, role_id, author_id)
		VALUES (_rcpt_id, _org_id, _info, get_role_id(_role), _author_id)
		RETURNING *
	)
	SELECT usr_i.id,
		rcpt_u.email,
		usr_i.info,
		_role,
		rcpt_u.active,
		_org_id,
		usr_i.created
	FROM usr_i, rcpt_u;
$$
LANGUAGE SQL VOLATILE;


CREATE OR REPLACE FUNCTION get_user_org_id(_user_id integer)
	RETURNS integer AS
$$
	SELECT org_id FROM users WHERE id = _user_id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_user_info(_id integer)
	RETURNS SETOF usr AS
$$
	SELECT usr.id,
		rcpt.email,
		usr.info,
		get_role_name(usr.role_id),
		rcpt.active,
		usr.org_id,
		usr.created
	FROM users usr
	JOIN recipients rcpt ON usr.id = rcpt.id
	WHERE usr.id = _id
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_users_of_subordinate_orgs(
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS TABLE(entities json, list jsonb) AS
$$
	WITH
		_filtered_users AS (
			SELECT find_subordinate('users', _org_id, _filter) id
		),
		_users_orgs AS (
			SELECT DISTINCT p_id AS id
			FROM _filtered_users org, LATERAL get_user_org_id(org.id) p_id
			WHERE p_id IS NOT NULL
		),
		_users_ids AS (SELECT array_agg(id) AS list FROM _filtered_users),
		_orgs_ids AS (SELECT array_agg(id) AS list FROM _users_orgs)
	-- build organizations object
	SELECT json_build_object(
			'users',
			build_entities_object('users', _users_ids.list),
			'orgs',
			build_entities_object('orgs', _orgs_ids.list)
		) AS entities,
		build_list_object(_users_ids.list) AS list
	FROM _users_ids, _orgs_ids;
$$
LANGUAGE SQL STABLE;
