CREATE TYPE response AS (
	id integer,
	"formId" integer,
	items json,
	"ownerId" integer,
	"recipientId" integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE OR REPLACE FUNCTION get_response(_id integer)
	RETURNS response AS
$$
	SELECT id, form_id, items, owner_id, recipient_id,
		created, updated, deleted, author_id
	FROM responses
	WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_response(
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _response response
) AS
$$
	DECLARE
		_inserted responses%ROWTYPE;
	BEGIN
		SELECT * FROM json_populate_record(null::responses, _props) INTO _inserted;

		-- set default values
		_inserted.id = nextval('responses_id_seq');
		_inserted.created = coalesce(_inserted.created, _time);
		_inserted.author_id = coalesce(_author_id, get_bot_id());

		INSERT INTO responses
		SELECT _inserted.*
		RETURNING * INTO _inserted;

		-- log changes
		PERFORM log('I', 'rspn', _inserted.id, row_to_json(_inserted), _author_id, _time);

		SELECT * FROM get_response(_inserted.id) INTO _response;
	END;
$$
LANGUAGE plpgsql;
