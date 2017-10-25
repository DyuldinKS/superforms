import db from './queries';
// import * as a from '../libs/extraMethods'

const recipients = {

	createIfNotExists({ email }) {
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

	get(email) {
		return db.query(
			`SELECT r.*, s.value AS status, t.type FROM recipients r
			JOIN states s ON r.status_id = s.id
			JOIN recipient_types t ON r.type_id = t.id
			WHERE r.email = $1;`,
			[email]
		);
	},

	insert({ email, status, type }) {
		return db.query(
			`INSERT INTO recipients(email, status_id, type_id)
			VALUES($1, $2, $3)`,
			[email, status, type]
		);
	},

	upsert({ email, status, type }) {
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
			[email, status, type]
		);
	},

	getAll(searchParams) {
		return db.select('recipients', searchParams);
	},

	delete(id) {
		const column = typeof id === 'string' ? 'email' : 'id';
		return db.query(
			`DELETE FROM recipients WHERE ${column} = $1`,
			[id]
		);
	},

};

export default recipients;
