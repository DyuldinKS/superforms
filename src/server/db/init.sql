INSERT INTO roles(name)
VALUES ('root'), ('admin'), ('user'), ('respondent');

-- create @system as root of organization tree
-- create @bot as first user
WITH
	recipients_i AS (
		INSERT INTO recipients(email, type, author_id)
		VALUES ('@bot', 'user', 1), ('@system', 'org', 1)
	),
	org_i AS (
		INSERT INTO organizations(id, info)
		VALUES(2, '{}'::jsonb)
	)
INSERT INTO users(id, org_id, info, role_id, hash)
VALUES(
	1,
	2,
	'{}'::jsonb,
	(SELECT min(id) FROM roles),
	'$2a$10$k7Px9a/ynquiPs9zpg8aeuGboyvw84T7NFOGNUagH6DbHaepnxDNa' -- justdoit
);

-- show login and password
SELECT '@bot' AS "login", 'justdoit' AS password;
