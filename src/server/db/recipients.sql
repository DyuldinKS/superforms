/***********************************  TYPES ***********************************/


CREATE TYPE rcpt_full AS (
	id integer,
	email varchar(255),
	type rcpt_type,
	active boolean,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE TYPE rcpt_short AS (
	id integer,
	email varchar(255),
	type rcpt_type,
	active boolean
);


CREATE OR REPLACE FUNCTION to_recipients(
	_props json,
	OUT _record recipients
) AS
$$
	BEGIN
		_record := json_populate_record(null::recipients, _props);
		_record.author_id = coalesce(_record.author_id, (_props->>'authorId')::int);
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION to_rcpt_full(_record recipients)
	RETURNS rcpt_full AS
$$
	SELECT _record.*;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_rcpt_short(_record recipients)
	RETURNS rcpt_short AS
$$
	SELECT _record.id, _record.email, _record.type, _record.active;
$$
LANGUAGE SQL IMMUTABLE;


CREATE CAST (json AS recipients)
WITH FUNCTION to_recipients(json);


CREATE CAST (rcpt_full AS recipients)
WITH INOUT;


CREATE CAST (recipients AS rcpt_full)
WITH INOUT;


CREATE CAST (recipients AS rcpt_short)
WITH FUNCTION to_rcpt_short(recipients);



/*******************************  CRUD METHODS ********************************/

-- find by id
CREATE OR REPLACE FUNCTION get_rcpt(_id integer)
	RETURNS recipients AS
$$
	SELECT * FROM recipients WHERE id = _id;
$$
LANGUAGE SQL STABLE;


-- find by email
CREATE OR REPLACE FUNCTION get_rcpt(_email text)
	RETURNS recipients AS
$$
	SELECT * FROM recipients WHERE email = _email;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_rcpt(
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _inserted recipients
) AS
$$
	BEGIN
		_inserted = _props::recipients;

		_inserted.id = nextval('recipients_id_seq');
		_inserted.type = coalesce(_inserted.type, 'rcpt');
		_inserted.active = coalesce(_inserted.active, true);
		_inserted.created = coalesce(_inserted.created, _time);
		_inserted.author_id = _author_id;

		INSERT INTO recipients SELECT _inserted.*;

		PERFORM log('I', 'rcpt', _inserted.id, row_to_json(_inserted), _author_id, _time);
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_or_create_rcpt(
	_props json,
	_author_id integer
) RETURNS recipients AS
$$
	SELECT * FROM coalesce(
		get_rcpt(_props->>'email'),
		create_rcpt(_props, _author_id)
	);
$$
LANGUAGE SQL;


CREATE OR REPLACE FUNCTION update_rcpt(
	_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _updated recipients
) AS
$$
	DECLARE
		_new recipients;
		_changes json;
	BEGIN
		_new := _props::recipients;
		_new.id := null;
		_new.updated = _time;
		_new.author_id = _author_id;

		UPDATE recipients rcpt
		SET email = coalesce(_new.email, rcpt.email),
			type = coalesce(_new.type, rcpt.type),
			active = coalesce(_new.active, rcpt.active),
			created = coalesce(_new.created, rcpt.created),
			updated = _new.updated,
			deleted = coalesce(_new.deleted, rcpt.deleted),
			author_id = _new.author_id
		WHERE rcpt.id = _id
		RETURNING * INTO _updated;

		_changes := json_strip_nulls(row_to_json(_new));
		PERFORM log('U', 'rcpt', _id, _changes, _author_id, _time);
	END;
$$
LANGUAGE plpgsql;
