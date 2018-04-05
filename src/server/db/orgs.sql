/**********************************  INDEXES **********************************/


CREATE INDEX orgs_info_idx ON organizations
USING gin(to_tsvector('russian', info));



/***********************************  TYPES ***********************************/

-- snake cased
CREATE TYPE org_with_rcpt AS (
	id integer,
	info jsonb,
	parent_id integer,
	email varchar(255),
	type rcpt_type,
	active boolean,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	author_id integer
);


-- camel cased
CREATE TYPE org_full AS (
	id integer,
	info jsonb,
	"parentId" integer,
	email varchar(255),
	active boolean,
	created timestamptz,
	updated timestamptz,
	deleted timestamptz,
	"authorId" integer
);


CREATE TYPE org_short AS (
	id integer,
	info jsonb,
	"parentId" integer,
	active boolean
);


CREATE OR REPLACE FUNCTION to_organizations(_props json)
	RETURNS organizations AS
$$
	SELECT * FROM json_populate_record(null::organizations, _props);
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_org_links(
	_props json,
	OUT links org_links
) AS
$$
	BEGIN
		links := json_populate_record(null::org_links, _props);
		links.org_id := coalesce(links.org_id, (_props->>'id')::int);
		links.parent_id := coalesce(links.parent_id, (_props->>'parentId')::int);
	END;
$$
LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION to_org_full(_record org_with_rcpt)
	RETURNS org_full AS
$$
	SELECT _record.id,
		_record.info,
		_record.parent_id,
		_record.email,
		_record.active,
		_record.created,
		_record.updated,
		_record.deleted,
		_record.author_id;
$$
LANGUAGE SQL IMMUTABLE;


CREATE OR REPLACE FUNCTION to_org_short(_record org_with_rcpt)
	RETURNS org_short AS
$$
	SELECT _record.id,
		_record.info,
		_record.parent_id,
		_record.active;
$$
LANGUAGE SQL IMMUTABLE;


CREATE CAST (json AS organizations)
WITH FUNCTION to_organizations(json);


CREATE CAST (json AS org_links)
WITH FUNCTION to_org_links(json);


CREATE CAST (org_with_rcpt AS org_full)
WITH FUNCTION to_org_full(org_with_rcpt);


CREATE CAST (org_with_rcpt AS org_short)
WITH FUNCTION to_org_short(org_with_rcpt);



/*******************************  CRUD METHODS ********************************/


CREATE OR REPLACE FUNCTION get_org(_id integer)
	RETURNS org_with_rcpt AS
$$
	SELECT * FROM (
		SELECT org.*, links.parent_id
		FROM organizations org
		LEFT JOIN org_links links ON org.id = links.org_id
			AND links.distance = 1
	) AS org
	JOIN recipients USING (id)
	WHERE org.id = _id;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION set_org_parent(
	_org_id integer,
	_parent_id integer,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _link org_links
) AS
$$
	BEGIN
		-- unlink org subtree (runs trigger)
		DELETE FROM org_links
		WHERE org_id = _org_id AND distance = 1;

		-- link subtree to new parent (runs trigger)
		INSERT INTO org_links(org_id, parent_id)
		VALUES (_org_id, _parent_id)
		RETURNING * INTO _link;

		-- log last changes
		PERFORM log('I', 'link', _org_id, row_to_json(_link), _author_id, _time);
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_org(
	_rcpt_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _inserted org_with_rcpt
) AS
$$
	DECLARE
		_new organizations;
		_links org_links;
	BEGIN
		_new := _props::organizations;
		_new.id := _rcpt_id;

		INSERT INTO organizations SELECT _new.*;

		-- log changes
		PERFORM log('I', 'org', _rcpt_id, row_to_json(_new), _author_id, _time);
		PERFORM update_rcpt(_rcpt_id, '{"type":"org"}'::json, _author_id, _time);

		_links := _props::org_links;
		PERFORM set_org_parent(_rcpt_id, _links.parent_id, _author_id);

		SELECT * FROM get_org(_rcpt_id) INTO _inserted;
	END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_org(
	_id integer,
	_props json,
	_author_id integer,
	_time timestamptz DEFAULT now(),
	OUT _updated org_with_rcpt
) AS
$$
DECLARE
	_new organizations;
	_changes json;
	_links org_links;
BEGIN
	_new := _props::organizations;
	_new.id := null;

	-- udpate org
	IF _new.info IS NOT NULL THEN
		UPDATE organizations org SET info = _new.info WHERE org.id = _id;
		-- log org changes
		_changes := json_build_object('info', _new.info);
		PERFORM log('U', 'org', _id, _changes, _author_id, _time);
	END IF;

	-- update parent org and log
	_links := _props::org_links;
	IF _links.parent_id IS NOT NULL
	THEN PERFORM set_org_parent(_id, _links.parent_id, _author_id, _time);
	END IF;

	-- update rcpt and log
	PERFORM update_rcpt(_id, _props, _author_id, _time);

	SELECT * FROM get_org(_id) INTO _updated;
END;
$$
LANGUAGE plpgsql;



/***********************************  SEARCH **********************************/


CREATE OR REPLACE FUNCTION get_parent_org_id(_org_id integer)
	RETURNS integer AS
$$
	SELECT parent_id FROM org_links
	WHERE org_id = _org_id AND distance = 1;
$$
LANGUAGE SQL STABLE;



CREATE OR REPLACE FUNCTION find_subordinate_orgs_with_parents(
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS TABLE(entities json, list json) AS
$$
	WITH
		_filtered_orgs AS (
			SELECT find_subordinate('orgs', _org_id, _filter) id
		),
		_parent_orgs AS (
			SELECT p_id
			FROM _filtered_orgs org, LATERAL get_parent_org_id(org.id) p_id
			WHERE p_id IS NOT NULL
		),
		_orgs_ids AS (SELECT array_agg(id) AS list FROM _filtered_orgs),
		_orgs_and_parents_ids AS (
			SELECT array_agg(id) AS list FROM (
				SELECT id from _filtered_orgs
				UNION
				SELECT p_id from _parent_orgs
			) AS orgs_and_parents
		)
	-- build organizations object
	SELECT json_build_object(
			'orgs',
			build_entities_object('orgs', _orgs_and_parents_ids.list, 'org_short')
		) AS entities,
		build_list_object(_orgs_ids.list) AS list
	FROM _orgs_ids, _orgs_and_parents_ids;
$$
LANGUAGE SQL STABLE;



/**********************************  TRIGGERS  *********************************/


CREATE OR REPLACE FUNCTION org_links_insert_link_to_itself()
	RETURNS TRIGGER AS
$$
	BEGIN
		INSERT INTO org_links (org_id, parent_id, distance)
			VALUES (NEW.id, NEW.id, 0);
		RETURN NULL;
	END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION org_links_insert_links()
	RETURNS TRIGGER AS
$$
	DECLARE
		row RECORD;
	BEGIN
		IF (NEW.distance = 1) THEN
			RAISE NOTICE 'root: % | % | %', NEW.org_id, NEW.parent_id, NEW.distance;
			FOR row IN
				SELECT down.org_id, up.parent_id,
					down.distance + up.distance + 1 AS distance
				FROM org_links up, org_links down
				WHERE up.org_id = NEW.parent_id
					AND down.parent_id = NEW.org_id
					AND down.distance + up.distance > 0
			LOOP
				INSERT INTO org_links VALUES(row.org_id, row.parent_id, row.distance);
				RAISE NOTICE 'new: % | % | %', row.org_id, row.parent_id, row.distance;
			END LOOP;
		END IF;
		RETURN NULL;
	END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION org_links_delete_orgs_subtree()
	RETURNS TRIGGER AS
$org_links_bd$
	DECLARE
		row RECORD;
	BEGIN
		IF (OLD.distance = 1) THEN
			RAISE NOTICE 'root: % | % | %', OLD.org_id, OLD.parent_id, OLD.distance;
			FOR row IN
				SELECT * FROM org_links
				WHERE parent_id = OLD.org_id
			LOOP
				RAISE NOTICE 'delete % with distance > %', row.org_id, row.distance;
				DELETE FROM org_links
				WHERE org_id = row.org_id AND distance > row.distance;
			END LOOP;
		END IF;
		RETURN NULL;
	END
$org_links_bd$
LANGUAGE plpgsql;


CREATE TRIGGER link_to_itself_organizations_ai
	AFTER INSERT ON organizations
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_insert_link_to_itself();


CREATE TRIGGER org_links_ai
	AFTER INSERT ON org_links
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_insert_links();


CREATE TRIGGER org_links_ad
	AFTER DELETE ON org_links
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_delete_orgs_subtree();
