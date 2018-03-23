CREATE TABLE IF NOT EXISTS states (
	id serial PRIMARY KEY,
	name varchar(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS roles (
	id serial PRIMARY KEY,
	name varchar(255) UNIQUE NOT NULL
);


CREATE TYPE rcpt_type AS enum('rcpt', 'user', 'org');


CREATE TABLE IF NOT EXISTS recipients (
	id serial PRIMARY KEY,
	email varchar(255) NOT NULL UNIQUE,
	type rcpt_type,
	active boolean DEFAULT true,
	created timestamp DEFAULT now(),
	updated timestamp,
	deleted timestamp,
	author_id integer NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_lists (
	id serial PRIMARY KEY,
	author_id integer NOT NULL,
	status_id integer NOT NULL REFERENCES states(id),
	created timestamp DEFAULT now()
);


CREATE TABLE IF NOT EXISTS recipient_in_lists (
	recipient_id integer NOT NULL REFERENCES recipients(id),
	list_id integer NOT NULL REFERENCES recipient_lists(id)
);


CREATE TABLE IF NOT EXISTS tags (
	id serial PRIMARY KEY,
	tag varchar(255) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS recipient_tags (
	recipient_id integer NOT NULL REFERENCES recipients(id),
	tag_id integer NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS organizations (
	id integer PRIMARY KEY REFERENCES recipients(id),
	info jsonb NOT NULL
);


CREATE TABLE IF NOT EXISTS org_links (
	org_id integer NOT NULL REFERENCES organizations(id),
	parent_id integer NOT NULL REFERENCES organizations(id),
	distance integer NOT NULL DEFAULT 1,
	PRIMARY KEY(org_id, parent_id)
);


CREATE TABLE IF NOT EXISTS users (
	id integer PRIMARY KEY REFERENCES recipients(id),
	org_id integer NOT NULL REFERENCES organizations(id),
	info jsonb NOT NULL,
	role_id integer NOT NULL REFERENCES roles(id),
	hash varchar(255)
);


CREATE TABLE IF NOT EXISTS user_tokens (
	user_id integer UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token varchar(255) UNIQUE NOT NULL,
	created timestamp DEFAULT now()
);


CREATE TABLE IF NOT EXISTS user_sessions (
	sid varchar NOT NULL COLLATE "default",
	sess jsonb NOT NULL,
	expire timestamp(6) NOT NULL
) WITH (OIDS=FALSE);


CREATE TABLE IF NOT EXISTS forms (
	id serial PRIMARY KEY,
	title text NOT NULL,
	description text,
	scheme json NOT NULL,
	sent json,
	owner_id integer NOT NULL REFERENCES users(id),
	created timestamp NOT NULL DEFAULT now(),
	updated timestamp,
	deleted timestamp,
	author_id integer NOT NULL REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS responses (
	id serial PRIMARY KEY,
	form_id integer NOT NULL REFERENCES forms(id),
	list json NOT NULL,
	owner_id integer NOT NULL REFERENCES recipients(id),
	recipient_id integer NOT NULL REFERENCES recipients(id),
	created timestamp DEFAULT now(),
	updated timestamp,
	author_id integer NOT NULL REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS recipient_lists_tags (
	list_id integer NOT NULL REFERENCES recipient_lists(id),
	tag_id integer NOT NULL REFERENCES tags(id)
);


CREATE TABLE IF NOT EXISTS form_recipient_lists (
	form_id integer NOT NULL REFERENCES forms(id),
	list_id integer NOT NULL REFERENCES recipient_lists(id),
	rights integer NOT NULL
);


CREATE TABLE IF NOT EXISTS logs(
	id serial PRIMARY KEY,
	operation char(1) NOT NULL,
	entity char(4) NOT NULL,
	entity_id integer NOT NULL,
	changes json NOT NULL,
	time timestamp DEFAULT now(),
	author_id integer NOT NULL,

	CONSTRAINT logs_author_id_fkey
	FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);


ALTER TABLE recipients ADD CONSTRAINT recipients_author_id_fkey
FOREIGN KEY (author_id) REFERENCES users(id);


ALTER TABLE recipient_lists ADD CONSTRAINT recipient_lists_author_id_fkey
FOREIGN KEY (author_id) REFERENCES users(id);
