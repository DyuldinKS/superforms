/***********************************  TYPES ***********************************/

CREATE TYPE response_full AS (
	id integer,
	"formId" integer,
	items json,
	respondent json,
	"recipientId" integer,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE TYPE response_short AS (
	id integer,
	respondent json,
	"recipientId" integer,
	created timestamptz
);


CREATE OR REPLACE FUNCTION to_responses(
	_props json,
	OUT _record responses
) AS
$$
	DECLARE
		_rspn response_full;
	BEGIN
		_record := json_populate_record(null::responses, _props);
		_rspn := json_populate_record(null::response_full, _props);

		_record.form_id = coalesce(_record.form_id, _rspn."formId");
		_record.recipient_id = coalesce(_record.recipient_id, _rspn."recipientId");
		_record.author_id = coalesce(_record.author_id, _rspn."authorId");
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


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
		_response.respondent,
		_response.recipient_id,
		_response.created;
$$
LANGUAGE SQL STABLE;


-- (!)

-- Avoid to use auto type casting, it's slow.
-- Instead, use the functions above manually

CREATE CAST (json AS responses)
WITH FUNCTION to_responses(json);


CREATE CAST (responses AS response_full)
WITH INOUT;


CREATE CAST (responses AS response_short)
WITH FUNCTION to_response_short(responses);



/*******************************  CRUD METHODS ********************************/


CREATE OR REPLACE FUNCTION get_response(_id integer)
	RETURNS responses AS
$$
	SELECT * FROM responses WHERE id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_responses_by_form(_form_id integer)
	RETURNS SETOF responses AS
$$
	SELECT * FROM responses
	WHERE form_id = _form_id
	ORDER BY created DESC;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION create_response(
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _response responses
) AS
$$
	DECLARE
		_inserted responses;
	BEGIN
		_inserted := to_responses(_props);
		-- set default values
		_author_id := coalesce(_author_id, get_bot_id());
		_inserted.id = nextval('responses_id_seq');
		_inserted.created = coalesce(_inserted.created, _time);
		_inserted.author_id = _author_id;

		INSERT INTO responses
		SELECT _inserted.*
		RETURNING * INTO _inserted;

		-- log changes
		PERFORM log('I', 'rspn', _inserted.id, row_to_json(_inserted), _author_id, _time);

		SELECT * FROM get_response(_inserted.id) INTO _response;
	END;
$$
LANGUAGE plpgsql;
