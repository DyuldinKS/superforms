import db from './queries';
import { PgError } from '../libs/errors';
import staticTables from './staticTables.json';

const { states, rcptTypes } = staticTables;


const users = {
	table: 'users',
	// columns: ['id', 'org_id', 'info', 'role_id', 'hash', 'author_id'],
	insert(user) {
		return db.query(
			`WITH
				rcpt_u AS (
					UPDATE recipients
					SET type_id = $2,
						status_id = $3
					WHERE email = $1
						AND type_id = ${rcptTypes.ids.unregistered}
						AND status_id = ${states.ids.active}
					RETURNING *
				),
				rcpt_i AS (
					INSERT INTO recipients(email, type_id, status_id)
					SELECT $1, $2, $3
					WHERE NOT EXISTS (SELECT 1 FROM (
						SELECT * FROM recipients WHERE email = $1
					) AS stored)
					RETURNING *
				),
				rcpt AS (
					SELECT * FROM rcpt_i UNION ALL SELECT * FROM rcpt_u
				),
				usr_i AS (
					INSERT INTO users(id, org_id, info, role_id, author_id)
					VALUES((SELECT id FROM rcpt), $4, $5, $6, $7) RETURNING *
				)
			SELECT rcpt.id, usr_i.info, rcpt.email, usr_i.org_id,
				usr_i.role_id, usr_i.author_id, rcpt.status_id
			FROM usr_i JOIN rcpt ON usr_i.id = rcpt.id;`,
			[
				user.email,
				rcptTypes.ids.user,
				states.ids.waiting,
				user.orgId,
				user.info,
				user.roleId,
				user.authorId,
			],
		);
	},


	select({ email, id }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT usr.id, usr.info, rcpt.email,
				usr.org_id, usr.role_id, usr.author_id, rcpt.status_id
			FROM users usr
			JOIN recipients rcpt ON usr.id = rcpt.id
			WHERE rcpt.${column} = $1;`,
			[id || email],
		);
	},


	selectFully({ email, id }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT usr.id, usr.info, usr.author_id, rcpt.email,
				(
					SELECT json_build_object('id', states.id, 'name', states.name)
					FROM states WHERE states.id = rcpt.status_id
				) as status,
				(
					SELECT json_build_object('id', id, 'name', name)
					FROM roles WHERE roles.id = usr.role_id
				) AS role,
				(
					SELECT json_build_object(
						'id', org.id,
						'info', org.info
					) 
					FROM organizations org
					WHERE org.id = usr.org_id
				) AS org
			FROM users usr
			JOIN recipients rcpt ON usr.id = rcpt.id
			WHERE rcpt.${column} = $1;`,
			[id || email],
		);
	},


	selectSecret({ email }) {
		return db.query(
			`SELECT usr.id, rcpt.email, usr.hash
			FROM users usr
			JOIN recipients rcpt ON usr.id = rcpt.id
			WHERE rcpt.email = $1;`,
			[email],
		);
	},


	update({ id }, updated) {
		const columns = Object.entries(updated)
			.map(([col, val]) => ({ col, val }));
		const where = { col: 'id', val: id };
		return columns.length > 0
			? db.update(this.table, columns, { where })
			: Promise.reject(new PgError('invalid user updating'));
	},


	delete({ id }) {
		return db.query(
			'DELETE FROM users WHERE id = $1 RETURNING *;',
			[id],
		);
	},


	setToken({ id, token }) {
		return db.query(
			`INSERT INTO user_tokens(user_id, token)
			VALUES($1, $2)
			ON CONFLICT(user_id) DO UPDATE
			SET token = $2 WHERE user_tokens.user_id = $1
			RETURNING *;`,
			[id, token],
		);
	},


	selectIdByToken(token) {
		return db.query(
			`SELECT rcpt.id, rcpt.email, tokens.token
			FROM user_tokens tokens
			JOIN recipients rcpt ON r.id = tokens.user_id
			WHERE token = $1;`,
			[token],
		);
	},


	deleteToken(token) {
		return db.query('DELETE FROM user_tokens WHERE token = $1;', [token]);
	},
};

export default users;
