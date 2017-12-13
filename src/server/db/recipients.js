import db from './queries';
import staticTables from './staticTables.json';


const recipients = {
	insertIfNotExists({ email }) {
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


	insert({ email, status = 'active', type = 'unregistered' }) {
		const { states, rcptTypes } = staticTables;

		return db.query(
			`INSERT INTO recipients(email, status_id, type_id)
			VALUES($1, $2, $3)
			RETURNING *`,
			[email, states.ids[status], rcptTypes.ids[type]],
		);
	},


	select({ id, email }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT rcp.*,
				states.name AS status, types.name 
			FROM recipients rcp
			JOIN states states ON rcp.status_id = states.id
			JOIN recipient_types types ON rcp.type_id = types.id
			WHERE rcp.${column} = $1`,
			[id || email],
		);
	},


	selectAll(searchParams) {
		return db.select('recipients', searchParams);
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
			[email, status, type],
		);
	},


	delete({ id, email }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`DELETE FROM recipients WHERE ${column} = $1`,
			[id || email],
		);
	},
};

export default recipients;
