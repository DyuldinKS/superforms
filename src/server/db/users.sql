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
	role varchar(255),
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
		_user user_full;
	BEGIN
		_record := json_populate_record(null::users, _props);
		_user := json_populate_record(null::user_full, _props);

		_record.org_id = coalesce(_record.org_id, _user."orgId");
		_record.role_id = coalesce(_record.role_id, get_role_id(_user.role));
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION to_user_full(_record user_with_rcpt)
	RETURNS user_full AS
$$
	SELECT _record.id,
		_record.org_id,
		_record.info,
		_record.role,
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
		_record.role,
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
	OUT _user user_with_rcpt
) AS
$$
	BEGIN
		SELECT * FROM get_users(array[_id]) INTO _user;

		IF _mode != 'auth' THEN _user.hash := null; END IF;
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION get_user(
	_email varchar(255),
	_mode varchar(255) DEFAULT NULL
) RETURNS user_with_rcpt AS
$$
	SELECT usr.* FROM recipients rcpt,
		LATERAL get_user(rcpt.id, _mode) usr
	WHERE rcpt.email = _email;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_users(
	_ids integer[],
	_mode varchar(255) DEFAULT NULL
) RETURNS SETOF user_with_rcpt AS
$$
	SELECT *
	FROM (
		SELECT *, get_role_name(id) AS role
		FROM users
	) usr
	JOIN recipients rcpt USING (id)
	WHERE usr.id = ANY (_ids);
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_user(
	_rcpt_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _inserted user_with_rcpt
) AS
$$
	DECLARE
		_new users;
	BEGIN
		_new := _props::users;
		_new.id := _rcpt_id;

		INSERT INTO users SELECT _new.*;

		-- log changes
		PERFORM log('I', 'user', _rcpt_id, row_to_json(_new), _author_id, _time);
		PERFORM update_rcpt(_rcpt_id, '{"type":"user"}'::json, _author_id, _time);

		SELECT * FROM get_user(_rcpt_id) INTO _inserted;
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_user(
	_id integer,
	_params json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _updated user_with_rcpt
) AS
$$
DECLARE
	_new users;
	_changes json;
BEGIN
	_new := _params::users;
	_new.id := null;

	-- update user
	UPDATE users usr
	SET info = coalesce(_new.info, usr.info),
		org_id = coalesce(_new.org_id, usr.org_id),
		role_id = coalesce(_new.role_id, usr.role_id),
		hash = coalesce(_new.hash, usr.hash)
	WHERE usr.id = _id;

	-- log user changes
	_changes := json_strip_nulls(row_to_json(_new));
	IF _changes::text != '{}' THEN
		PERFORM log('U', 'user', _id, _changes, _author_id, _time);
	END IF;
	PERFORM update_rcpt(_id, _params, _author_id, _time);

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


CREATE OR REPLACE FUNCTION filter_users_in_orgs(
	_orgs integer[],
	_filter jsonb DEFAULT NULL
) RETURNS TABLE (
	user_id integer,
	org_id integer
) AS
$$
	DECLARE
		_info text := _filter->>'info';
		_email text := _filter->>'email';
		_active boolean := (_filter->>'active')::boolean;
		_role_id integer := get_role_id(_filter->>'role');
		_deleted boolean := (_filter->>'deleted')::boolean;
	BEGIN
		RETURN QUERY
			SELECT usr.id, usr.org_id
			FROM users usr JOIN recipients rcpt USING (id),
				to_tsvector('russian', usr.info) document
			WHERE (_orgs IS NULL OR usr.org_id = ANY (_orgs))
				AND (_info IS NULL OR document @@ to_tsquery('russian', _info))
				AND (_email IS NULL OR email ILIKE _email)
				AND (_active IS NULL OR rcpt.active = _active)
				AND (_role_id IS NULL OR usr.role_id = _role_id)
				AND (_deleted IS NULL
					OR (_deleted IS false AND rcpt.deleted IS NULL)
					OR (_deleted IS true AND rcpt.deleted IS NOT NULL))
			ORDER BY usr.id;
	END;
$$
LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION build_users_object(_ids integer[])
	RETURNS json AS
$$
	SELECT json_object_agg(
		usr.id,
		usr.info || (row_to_json(usr)::jsonb - 'info')
	)
	FROM get_users(_ids) usr;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION find_users_in_subtree(
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS TABLE(entities json, list json) AS
$$
	WITH
		_subtree AS (
			SELECT id FROM get_org_subtree(
				_org_id,
				(_filter->>'minDepth')::int,
				(_filter->>'maxDepth')::int
			) id
		),
		_filtered_users AS (
			SELECT * FROM filter_users_in_orgs(
				(SELECT array_agg(id) FROM _subtree),
				_filter
			)
		),
		_arrays AS (
			SELECT array_agg(user_id) AS users, array_agg(DISTINCT org_id) AS orgs
			FROM _filtered_users
		)
	-- build organizations object
	SELECT json_build_object(
			'users', build_users_object(users),
			'orgs', build_orgs_object(orgs)
		) AS entities,
		build_list_object(users) AS list
	FROM _arrays;
$$
LANGUAGE SQL STABLE;
