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


CREATE OR REPLACE FUNCTION set_rcpt_update_time_tr()
	RETURNS TRIGGER AS
$$
BEGIN
	NEW.updated := now();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_rcpt(
	_id integer,
	_params json,
	_author_id integer
) RETURNS recipients AS
$$
	WITH new AS (
		SELECT * FROM json_populate_record(null::recipients, _params)
	)
	UPDATE recipients rcpt
	SET email = coalesce(new.email, rcpt.email),
		active = coalesce(new.active, rcpt.active),
		updated = now(),
		deleted = coalesce(new.deleted, rcpt.deleted),
		author_id = _author_id
	FROM new
	WHERE rcpt.id = _id
	RETURNING rcpt.*
$$
LANGUAGE SQL;



/************************************  LOG  ***********************************/


CREATE OR REPLACE FUNCTION log_rcpt_tr()
	RETURNS TRIGGER AS
$$
DECLARE
	_entity CHAR(4) := 'rcpt';
BEGIN
	RAISE NOTICE 'NEW: %', row_to_json(NEW.*);
	CASE TG_OP
		WHEN 'INSERT' THEN
			INSERT INTO logs(operation, entity, record, author_id)
			VALUES('I', _entity, row_to_json(NEW.*), NEW.author_id);
			RETURN NEW;
		WHEN 'UPDATE' THEN
			INSERT INTO logs(operation, entity, record, author_id)
			VALUES('U', _entity, row_to_json(NEW.*), NEW.author_id);
			RETURN NEW;
		WHEN 'DELETE' THEN
			INSERT INTO logs(operation, entity, record, authorId)
			VALUES('D', _entity, row_to_json(OLD.*), OLD.author_id);
			RETURN OLD;
	END CASE;
  RETURN NULL;
END;
$$
LANGUAGE plpgsql;


CREATE TRIGGER update_time_recipients_bu
BEFORE UPDATE ON recipients
FOR EACH ROW
EXECUTE PROCEDURE set_rcpt_update_time_tr();


CREATE TRIGGER log_recipients_aiud
AFTER INSERT OR UPDATE OR DELETE ON recipients
FOR EACH ROW
EXECUTE PROCEDURE log_rcpt_tr();
