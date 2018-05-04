CREATE TYPE response_full AS (
	id integer,
	"responseId" integer,
	items json,
	"ownerId" integer,
	"recipientId" integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE TYPE response_short AS (
	id integer,
	"ownerId" integer,
	"recipientId" integer,
	created timestamptz
);


CREATE OR REPLACE FUNCTION to_response_full(_response responses)
	RETURNS response_full AS
$$
	SELECT _response.*;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION to_response_short(_response responses)
	RETURNS response_short AS
$$
	SELECT _response.id,
		_response.owner_id,
		_response.recipient_id,
		_response.created;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_response(_id integer)
	RETURNS response AS
$$
	SELECT * FROM responses WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_responses_by_form(_form_id integer)
	RETURNS SETOF responses AS
$$
	SELECT * FROM responses WHERE form_id = _form_id;
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
		_inserted responses;
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
