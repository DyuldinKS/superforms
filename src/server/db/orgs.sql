CREATE INDEX orgs_info_idx ON organizations
USING gin(to_tsvector('russian', info));


CREATE TYPE org AS (
	id INTEGER,
	email VARCHAR(255),
	info JSONB,
	active BOOLEAN,
	"chiefOrgId" INTEGER,
	created TIMESTAMP,
	updated TIMESTAMP,
	deleted TIMESTAMP,
	"authorId" INTEGER
);


CREATE OR REPLACE FUNCTION create_org(
	_rcpt_id integer,
	_info jsonb,
	_author_id integer
) RETURNS org AS
$$
	WITH rcpt_u AS (
		UPDATE recipients
		SET type_id = get_rcpt_type_id('org'),
			updated = now(),
			author_id = _author_id
		WHERE id = _rcpt_id
		RETURNING *
	),
	org_i AS (
		INSERT INTO organizations(id, info)
		VALUES (_rcpt_id, _info)
		RETURNING *
	)
	SELECT org_i.id,
		rcpt_u.email,
		org_i.info,
		rcpt_u.active,
		null::int,
		rcpt_u.created,
		rcpt_u.updated,
		rcpt_u.deleted,
		rcpt_u.author_id
	FROM org_i, rcpt_u;
$$
LANGUAGE SQL VOLATILE;


CREATE OR REPLACE FUNCTION get_parent_org_id(_org_id integer)
	RETURNS integer AS
$$
	SELECT chief_org_id FROM org_links
	WHERE org_id = _org_id AND distance = 1;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION get_org(_id integer)
	RETURNS SETOF org AS
$$
	SELECT org.id,
		rcpt.email,
		org.info,
		rcpt.active,
		link.chief_org_id,
		rcpt.created,
		rcpt.updated,
		rcpt.deleted,
		rcpt.author_id
	FROM organizations org
	JOIN recipients rcpt ON org.id = rcpt.id
	LEFT JOIN org_links link
	ON org.id = link.org_id AND link.distance = 1
	WHERE org.id = _id
$$
LANGUAGE SQL STABLE;



CREATE OR REPLACE FUNCTION find_subordinate_orgs_with_parents(
	_org_id integer,
	_filter jsonb DEFAULT NULL
) RETURNS TABLE(entities json, list jsonb) AS
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
			build_entities_object('orgs', _orgs_and_parents_ids.list)
		) AS entities,
		build_list_object(_orgs_ids.list) AS list
	FROM _orgs_ids, _orgs_and_parents_ids;
$$
LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION update_org(
	_id integer,
	_params json,
	_author_id integer,
	OUT _updated org
) AS
$$
DECLARE
	_new organizations;
	_changes json;
BEGIN
	SELECT * FROM json_populate_record(null::organizations, _params) INTO _new;

	IF _new.info IS NOT NULL THEN
		UPDATE organizations org
		SET info = _new.info
		WHERE org.id = _id;
	END IF;

	PERFORM update_rcpt(_id, _params, _author_id);

	SELECT * FROM get_org(_id) INTO _updated;

	_changes := json_strip_nulls(row_to_json(_new));
	PERFORM log('U', 'org', _id, _changes, _author_id);
END;
$$
LANGUAGE plpgsql;



/****************************  ORGANIZATIONS TREE  ****************************/


CREATE OR REPLACE FUNCTION org_links_insert_link_to_itself() RETURNS TRIGGER AS $$
	BEGIN
		INSERT INTO org_links (org_id, chief_org_id, distance)
			VALUES (NEW.id, NEW.id, 0);
		RETURN NULL;
	END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION org_links_insert_links() RETURNS TRIGGER AS $$
	DECLARE
		row RECORD;
	BEGIN
		RAISE NOTICE 'NEW: % | % | %', NEW.org_id, NEW.chief_org_id, NEW.distance;
		IF (NEW.distance = 1) THEN
			RAISE NOTICE 'NEW with distance = 1: % | % | %', NEW.org_id, NEW.chief_org_id, NEW.distance;
			FOR row IN
				SELECT down.org_id, up.chief_org_id,
					down.distance + up.distance + 1 AS distance
				FROM org_links up, org_links down
				WHERE up.org_id = NEW.chief_org_id
					AND down.chief_org_id = NEW.org_id
					AND down.distance + up.distance > 0
			LOOP
				INSERT INTO org_links VALUES(row.org_id, row.chief_org_id, row.distance);
				RAISE NOTICE 'new row: % | % | %', row.org_id, row.chief_org_id, row.distance;
			END LOOP;
		END IF;
		RETURN NULL;
	END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION org_links_delete_orgs_subtree() RETURNS TRIGGER AS $org_links_bd$
	DECLARE
		row RECORD;
	BEGIN
		RAISE NOTICE 'OLD: % | % | %', OLD.org_id, OLD.chief_org_id, OLD.distance;
		IF (OLD.distance = 1) THEN
			RAISE NOTICE 'OLD filtered: % | % | %', OLD.org_id, OLD.chief_org_id, OLD.distance;
			FOR row IN
				SELECT down.org_id, up.chief_org_id, down.distance + up.distance AS distance
				FROM org_links down
					JOIN org_links up
					ON up.org_id = OLD.org_id
						AND down.chief_org_id = OLD.org_id
						AND up.distance > 0
						AND up.distance + down.distance > 1
			LOOP
				RAISE NOTICE 'deleted row: % | % | %', row.org_id, row.chief_org_id, row.distance;
				DELETE FROM org_links
				WHERE org_id = row.org_id AND chief_org_id = row.chief_org_id;
			END LOOP;
		END IF;
		RETURN NULL;
	END
$org_links_bd$ LANGUAGE plpgsql;


CREATE TRIGGER link_to_itself_organizations_ai
	AFTER INSERT ON organizations
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_insert_link_to_itself();


CREATE TRIGGER insert_org_links_ai
	AFTER INSERT ON org_links
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_insert_links();


CREATE TRIGGER delete_org_links_ad
	AFTER DELETE ON org_links
	FOR EACH ROW
	EXECUTE PROCEDURE org_links_delete_orgs_subtree();
