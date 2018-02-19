CREATE TYPE rcpt AS (
	id INTEGER,
	email VARCHAR(255),
	type VARCHAR(255),
	active BOOLEAN,
	updated TIMESTAMP WITH TIME ZONE
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


CREATE OR REPLACE FUNCTION get_or_create_rcpt(_email varchar(255))
	RETURNS rcpt AS
$$
	WITH selected AS (
		SELECT * FROM recipients
		WHERE email = _email
	),
	inserted AS (
		INSERT INTO recipients(email, type_id)
		SELECT _email, get_rcpt_type_id('unregistered')
		WHERE NOT EXISTS (
			SELECT 1 FROM selected
		)
		RETURNING *
	)
	SELECT id, email, get_rcpt_type_name(type_id), active, updated
	FROM (
		SELECT * FROM selected UNION ALL SELECT * FROM inserted
	) as rcpt;
$$
LANGUAGE SQL VOLATILE;
