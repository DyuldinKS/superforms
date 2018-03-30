INSERT INTO roles(name)
VALUES ('root'), ('admin'), ('user'), ('respondent');


-- create @system as root of organization tree
-- create @bot as first user
WITH
	ids AS (
		SELECT nextval('recipients_id_seq') AS user_id,
			nextval('recipients_id_seq') AS org_id
	),
	recipients_i AS (
		INSERT INTO recipients(id, email, type, author_id)
		SELECT * FROM (
			SELECT user_id, '@bot', 'user'::rcpt_type, user_id FROM ids
			UNION ALL
			SELECT org_id, '@system', 'org'::rcpt_type, user_id FROM ids
		) AS user_and_org
	),
	org_i AS (
		INSERT INTO organizations(id, info)
		SELECT org_id, '{}'::jsonb FROM ids
	)
INSERT INTO users(id, org_id, info, role_id, hash)
SELECT
	user_id,
	org_id,
	'{}'::jsonb,
	(SELECT min(id) FROM roles),
	'$2a$10$k7Px9a/ynquiPs9zpg8aeuGboyvw84T7NFOGNUagH6DbHaepnxDNa' -- justdoit
FROM ids;

-- show login and password
SELECT '@bot' AS "login", 'justdoit' AS password;
