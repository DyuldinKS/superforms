CREATE INDEX users_info_idx ON users
USING gin(to_tsvector('russian', info));


CREATE TYPE usr AS (
	id integer,
	email varchar(255),
	info jsonb,
	role varchar(255),
	active boolean,
	"orgId" integer,
	hash varchar(255),
	created timestamp,
	updated timestamp,
	deleted timestamp,
	"authorId" integer
);


CREATE OR REPLACE FUNCTION get_user(
	_id integer,
	mode varchar(255) DEFAULT NULL
)
	RETURNS usr AS
$$
	SELECT usr.id,
		rcpt.email,
		usr.info,
		get_role_name(usr.role_id),
		rcpt.active,
		usr.org_id,
		CASE WHEN mode = 'auth' THEN usr.hash ELSE NULL END,
		rcpt.created,
		rcpt.updated,
		rcpt.deleted,
		rcpt.author_id
	FROM users usr
	JOIN recipients rcpt ON usr.id = _id
		AND usr.id = rcpt.id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_user_by_email(_email varchar(255))
	RETURNS usr AS
$$
	SELECT * FROM get_user(
		(SELECT id FROM recipients WHERE email = _email),
		'auth'
	);
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_user(
	_rcpt_id integer,
	_org_id integer,
	_info jsonb,
	_role varchar(255),
	_hash varchar(255),
	_author_id integer,
	OUT _user usr
) AS
$$
	DECLARE
		_inserted users;
	BEGIN
		INSERT INTO users(id, org_id, info, role_id, hash)
		VALUES (_rcpt_id, _org_id, _info, get_role_id(_role), _hash)
		RETURNING * INTO _inserted;

		-- log changes
		PERFORM log('I', 'user', _rcpt_id, row_to_json(_inserted), _author_id);
		PERFORM update_rcpt(_rcpt_id, json_build_object('type', 'user'), _author_id);

		SELECT * FROM get_user(_rcpt_id) INTO _user;
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_org_id(_user_id integer)
	RETURNS integer AS
$$
	SELECT org_id FROM users WHERE id = _user_id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_users_of_subordinate_orgs(
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS TABLE(entities json, list json) AS
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


CREATE OR REPLACE FUNCTION update_user(
	_id integer,
	_params json,
	_author_id integer,
	OUT _updated usr
) AS
$$
DECLARE
	_new users;
	_changes json;
BEGIN
	SELECT * FROM json_populate_record(null::users, _params) INTO _new;

	_new.role_id = get_role_id(_params->>'role');

	-- update user
	UPDATE users usr
	SET info = coalesce(_new.info, usr.info),
		role_id = coalesce(_new.role_id, usr.role_id),
		hash = coalesce(_new.hash, usr.hash)
	WHERE usr.id = _id;

	-- log user _changes
	_changes := json_strip_nulls(row_to_json(_new));
	IF _changes::text != '{}' THEN
		PERFORM log('U', 'user', _id, _changes, _author_id);
	END IF;
	PERFORM update_rcpt(_id, _params, _author_id);

	SELECT * FROM get_user(_id) INTO _updated;
END;
$$
LANGUAGE plpgsql;
