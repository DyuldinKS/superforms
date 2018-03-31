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
		IF _props::jsonb ? 'authorId'
		THEN _record := json_populate_record(null::rcpt_full, _props)::recipients;
		ELSE _record := json_populate_record(null::recipients, _props);
		END IF;
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


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



/*********************************  FUNCTIONS *********************************/


CREATE OR REPLACE FUNCTION get_rcpt(_id integer)
	RETURNS recipients AS
$$
	SELECT * FROM recipients WHERE id = _id;
$$
LANGUAGE SQL STABLE;



CREATE OR REPLACE FUNCTION get_rcpt(_email text)
	RETURNS recipients AS
$$
	SELECT * FROM recipients WHERE email = _email;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_rcpt(
	_props json,
	_author_id integer,
	OUT _inserted recipients
) AS
$$
	BEGIN
		_inserted = _props::recipients;

		_inserted.id = nextval('recipients_id_seq');
		_inserted.type = coalesce(_inserted.type, 'rcpt');
		_inserted.active = coalesce(_inserted.active, true);
		_inserted.created = coalesce(_inserted.created, now());
		_inserted.author_id = _author_id;

		INSERT INTO recipients SELECT _inserted.*;
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
	OUT _updated recipients
) AS
$$
	DECLARE
		_new recipients;
		_changes jsonb;
	BEGIN
		_new := _props::recipients;
		_new.updated = now();
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
		PERFORM log('U', 'rcpt', _id, _changes::json, _author_id);
	END;
$$
LANGUAGE plpgsql;



/************************************  LOG  ***********************************/


CREATE OR REPLACE FUNCTION log_rcpt_tr()
	RETURNS TRIGGER AS
$$
BEGIN
	PERFORM log('I', 'rcpt', NEW.id, row_to_json(NEW.*), NEW.author_id);
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;


CREATE TRIGGER log_recipients_ai
AFTER INSERT ON recipients
FOR EACH ROW
EXECUTE PROCEDURE log_rcpt_tr();
