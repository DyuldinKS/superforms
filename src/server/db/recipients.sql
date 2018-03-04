CREATE OR REPLACE FUNCTION get_rcpt(_id integer)
	RETURNS recipients AS
$$
	SELECT * FROM recipients WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_rcpt(
	_email varchar(255),
	_author_id integer
) RETURNS recipients AS
$$
	INSERT INTO recipients(email, type, author_id)
	SELECT _email, 'rcpt', _author_id
	RETURNING *;
$$
LANGUAGE SQL VOLATILE;


CREATE OR REPLACE FUNCTION get_or_create_rcpt(
	_email varchar(255),
	_author_id integer
) RETURNS recipients AS
$$
	WITH selected AS (
		SELECT * FROM recipients
		WHERE email = _email
	),
	inserted AS (
		INSERT INTO recipients(email, type, author_id)
		SELECT _email, 'rcpt', _author_id
		WHERE NOT EXISTS (
			SELECT 1 FROM selected
		)
		RETURNING *
	)
	SELECT * FROM selected UNION ALL SELECT * FROM inserted;
$$
LANGUAGE SQL VOLATILE;


CREATE OR REPLACE FUNCTION update_rcpt(
	_id integer,
	_params json,
	_author_id integer,
	OUT _updated recipients
) AS
$$
DECLARE
	_new recipients;
	_changes jsonb;
BEGIN
	SELECT * FROM json_populate_record(null::recipients, _params) INTO _new;

	_new.updated = now();
	_new.author_id = _author_id;
	UPDATE recipients rcpt
	SET email = coalesce(_new.email, rcpt.email),
		type = coalesce(_new.type, rcpt.type),
		active = coalesce(_new.active, rcpt.active),
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
