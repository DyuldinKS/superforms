CREATE TYPE rcpt AS (
	id INTEGER,
	email VARCHAR(255),
	type VARCHAR(255),
	active BOOLEAN,
	created TIMESTAMP,
	updated TIMESTAMP,
	deleted TIMESTAMP,
	"authorId" INTEGER
);


CREATE OR REPLACE FUNCTION get_rcpt_type_name(
	_type_id integer
) RETURNS varchar(255) AS
$$
	SELECT name FROM recipient_types WHERE id = _type_id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_rcpt_type_id(
	_type varchar(255)
) RETURNS integer AS
$$
	SELECT id FROM recipient_types WHERE name = _type;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_or_create_rcpt(
	_email varchar(255),
	_author_id integer
) RETURNS rcpt AS
$$
	WITH selected AS (
		SELECT * FROM recipients
		WHERE email = _email
	),
	inserted AS (
		INSERT INTO recipients(email, type_id, author_id)
		SELECT _email, get_rcpt_type_id('unregistered'), _author_id
		WHERE NOT EXISTS (
			SELECT 1 FROM selected
		)
		RETURNING *
	)
	SELECT id, email, get_rcpt_type_name(type_id), active,
		created, updated, deleted, author_id
	FROM (
		SELECT * FROM selected UNION ALL SELECT * FROM inserted
	) as rcpt;
$$
LANGUAGE SQL VOLATILE;


CREATE OR REPLACE FUNCTION get_rcpt(_id integer)
	RETURNS rcpt AS
$$
	SELECT id, email, get_rcpt_type_name(type_id), active,
		created, updated, deleted, author_id
	FROM recipients WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION update_rcpt(
	_id integer,
	_params json,
	_author_id integer,
	OUT _updated rcpt
) AS
$$
DECLARE
	_new recipients;
	_changes jsonb;
	_time timestamp;
BEGIN
	SELECT * FROM json_populate_record(null::recipients, _params) INTO _new;

	_new.updated = now();
	_new.author_id = _author_id;
	UPDATE recipients rcpt
	SET email = coalesce(_new.email, rcpt.email),
		active = coalesce(_new.active, rcpt.active),
		updated = _new.updated,
		deleted = coalesce(_new.deleted, rcpt.deleted),
		author_id = _new.author_id
	WHERE rcpt.id = _id;

	SELECT * FROM get_rcpt(_id) INTO _updated;

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
	RAISE NOTICE 'NEW: %', row_to_json(NEW.*)
	PERFORM log('I', 'rcpt', NEW.id, row_to_json(NEW.*), NEW.author_id);
	RETURN NEW;
END;
$$
LANGUAGE plpgsql;


CREATE TRIGGER log_recipients_ai
AFTER INSERT ON recipients
FOR EACH ROW
EXECUTE PROCEDURE log_rcpt_tr();
