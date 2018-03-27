CREATE INDEX forms_content_idx ON forms
USING gin((setweight(to_tsvector('russian', title),'A')
	|| setweight(to_tsvector('russian', description), 'B')));


CREATE TYPE form AS (
	id integer,
	title text,
	description text,
	scheme json,
	sent json,
	"ownerId" integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE OR REPLACE FUNCTION get_form(_id integer)
	RETURNS form AS
$$
	SELECT id, title, description, scheme, sent,
		owner_id, created, updated, deleted, author_id
	FROM forms
	WHERE id = _id;
$$
LANGUAGE SQL STABLE;



CREATE OR REPLACE FUNCTION create_form(
	_props json,
	_author_id integer,
	OUT _form form
) AS
$$
	DECLARE
		_inserted forms%ROWTYPE;
	BEGIN
		SELECT * FROM json_populate_record(null::forms, _props) INTO _inserted;
		_inserted.id = nextval('forms_id_seq');
		_inserted.created = coalesce(_inserted.created, now());
		_inserted.author_id = _author_id;

		INSERT INTO forms
		SELECT _inserted.*
		RETURNING * INTO _inserted;

		-- log changes
		PERFORM log('I', 'form', _inserted.id, row_to_json(_inserted), _author_id);

		SELECT * FROM get_form(_inserted.id) INTO _form;
	END;
$$
LANGUAGE plpgsql;
