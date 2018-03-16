INSERT INTO roles(name)
VALUES ('root'), ('admin'), ('user'), ('respondent');

-- create @system as root of organization
-- create @bot as author of first changes
WITH recipients_i AS (
	INSERT INTO recipients(email, type, author_id)
	VALUES ('@bot', 'user', 1), ('@system', 'org', 1)
), org_i AS (
	INSERT INTO organizations(id, info)
	VALUES(2, '{}'::jsonb)
)
INSERT INTO users(id, org_id, info, role_id)
VALUES(1, 2, '{}'::jsonb, (SELECT min(id) FROM roles));
