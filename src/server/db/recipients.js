import db from './queries';
// import * as a from '../libs/extraMethods'

const recipients = {

	addIfNotStored({ email }) {
		return db.query(
			`WITH s AS (
			    SELECT id, email FROM recipients WHERE email = $1
			), i AS (
			    INSERT INTO recipients(email)
			    SELECT $1
			    WHERE NOT EXISTS (SELECT 1 FROM s)
			    RETURNING *
			)
			SELECT * FROM i UNION ALL SELECT * FROM s;`,
			[email],
		);
	},

	add({ email, status = 'active', type = 'unregistered' }) {
		return db.query(
			`WITH status AS (
				SELECT * FROM states WHERE value = $2
			), type AS (
				SELECT * FROM recipient_types WHERE type = $3
			)
			INSERT INTO recipients(email, status_id, type_id)
			VALUES(
				$1,
				(SELECT status.id FROM status),
				(SELECT type.id FROM type)
			)
			RETURNING *`,
			[email, status, type],
		);
	},

	get(email) {
		return db.query(
			`SELECT r.*, s.value AS status, t.type FROM recipients r
			JOIN states s ON r.status_id = s.id
			JOIN recipient_types t ON r.type_id = t.id
			WHERE r.email = $1;`,
			[email],
		);
	},

	getAll(searchParams) {
		return db.select('recipients', searchParams);
	},

	set({ email, status, type }) {
		return db.query(
			`WITH status AS (
				SELECT * FROM states WHERE value = $2
			), type AS (
				SELECT * FROM recipient_types WHERE type = $3
			)
			INSERT INTO recipients(email, status_id, type_id)
			VALUES(
				$1,
				(SELECT status.id FROM status),
				(SELECT type.id FROM type)
			)
			ON CONFLICT (email) DO UPDATE
			SET status_id = (SELECT id FROM status),
				type_id = (SELECT id FROM type)
			RETURNING *;`,
			[email, status, type],
		);
	},

	remove({ id, email }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`DELETE FROM recipients WHERE ${column} = $1`,
			[id || email],
		);
	},

};

export default recipients;
