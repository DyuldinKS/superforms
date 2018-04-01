/**********************************  INDEXES **********************************/


CREATE INDEX users_info_idx ON users
USING gin(to_tsvector('russian', info));



/***********************************  TYPES ***********************************/

-- snake cased
CREATE TYPE user_with_rcpt AS (
	id integer,
	org_id integer,
	info jsonb,
	role_id integer,
	hash varchar(255),
	email varchar(255),
	type rcpt_type,
	active boolean,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	author_id integer
);

-- camel cased
CREATE TYPE user_full AS (
	id integer,
	"orgId" integer,
	info jsonb,
	role varchar(255),
	hash varchar(255),
	email varchar(255),
	active boolean,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE TYPE user_short AS (
	id integer,
	"orgId" integer,
	info jsonb,
	role varchar(255),
	active boolean
);


CREATE OR REPLACE FUNCTION to_users(
	_props json,
	OUT _record users
) AS
$$
	DECLARE
		_usr user_full;
	BEGIN
		_record := json_populate_record(null::users, _props);

		_record.org_id = coalesce(_record.org_id, (_props->>'orgId')::int);
		_record.role_id = coalesce(_record.role_id, get_role_id(_usr.role));
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION to_user_full(_record user_with_rcpt)
	RETURNS user_full AS
$$
	SELECT _record.id,
		_record.org_id,
		_record.info,
		get_role_name(_record.role_id),
		_record.hash,
		_record.email,
		_record.active,
		_record.created,
		_record.updated,
		_record.deleted,
		_record.author_id;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_user_short(_record user_with_rcpt)
	RETURNS user_short AS
$$
	SELECT _record.id,
		_record.org_id,
		_record.info,
		get_role_name(_record.role_id),
		_record.active;
$$
LANGUAGE SQL IMMUTABLE;


CREATE CAST (json AS users)
WITH FUNCTION to_users(json);


CREATE CAST (user_with_rcpt AS user_full)
WITH FUNCTION to_user_full(user_with_rcpt);


CREATE CAST (user_with_rcpt AS user_short)
WITH FUNCTION to_user_short(user_with_rcpt);



/*******************************  CRUD METHODS ********************************/


CREATE OR REPLACE FUNCTION get_user(
	_id integer,
	_mode varchar(255) DEFAULT '',
	OUT _usr user_with_rcpt
) AS
$$
	BEGIN
		SELECT * FROM users
		JOIN recipients USING (id)
		WHERE users.id = _id
		INTO _usr;

		IF _mode != 'auth' THEN _usr.hash := null; END IF;
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION get_user(
	_email varchar(255),
	_mode varchar(255) DEFAULT NULL
) RETURNS user_with_rcpt AS
$$
	SELECT usr.* FROM get_rcpt(_email) rcpt, get_user(rcpt.id, 'auth') usr;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_user(
	_props json,
	_author_id integer,
	OUT _inserted user_with_rcpt
) AS
$$
	DECLARE
		_new users;
	BEGIN
		_new := _props::users;

		INSERT INTO users SELECT _new.*;

		-- log changes
		PERFORM log('I', 'user', _new.id, row_to_json(_new), _author_id);
		PERFORM update_rcpt(_new.id, '{"type":"user"}'::json, _author_id);

		SELECT * FROM get_user(_new.id) INTO _inserted;
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_user(
	_id integer,
	_params json,
	_author_id integer,
	OUT _updated user_with_rcpt
) AS
$$
DECLARE
	_new users;
	_changes json;
BEGIN
	_new := _params::users;

	-- update user
	UPDATE users usr
	SET info = coalesce(_new.info, usr.info),
		org_id = coalesce(_new.org_id, usr.org_id),
		role_id = coalesce(_new.role_id, usr.role_id),
		hash = coalesce(_new.hash, usr.hash)
	WHERE usr.id = _id;

	-- log user _changes
	_changes := jsonb_strip_nulls(row_to_json(_new)::jsonb - 'id');
	IF _changes::text != '{}' THEN
		PERFORM log('U', 'user', _id, _changes::json, _author_id);
	END IF;
	PERFORM update_rcpt(_id, _params, _author_id);

	SELECT * FROM get_user(_id) INTO _updated;
END;
$$
LANGUAGE plpgsql;



/***********************************  SEARCH **********************************/


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
			build_entities_object('users', _users_ids.list, 'user_short'),
			'orgs',
			build_entities_object('orgs', _orgs_ids.list, 'org_short')
		) AS entities,
		build_list_object(_users_ids.list) AS list
	FROM _users_ids, _orgs_ids;
$$
LANGUAGE SQL STABLE;
