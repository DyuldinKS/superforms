import crypto from 'crypto';
import db from './queries';
import { PgError } from '../libs/errors';
import constants from './constants';

const users = {
	table: 'users',
	// columns: ['id', 'org_id', 'info', 'role_id', 'hash', 'author_id'],
	add(user, self) {
		const { states, recipientTypes: types } = constants;
		return db.query(
			`WITH
				rcp AS (
					UPDATE recipients
					SET type_id = ${types.getId('user')},
						status_id = ${states.getId(user.status || 'waiting')}
					WHERE id = $1
						AND email = $2 
						AND type_id = ${types.getId('unregistered')}
						AND status_id = ${states.getId('active')}
					RETURNING *
				),
				usr AS (
					INSERT INTO users(id, org_id, info, role_id, author_id)
					VALUES((SELECT id FROM rcp), $3, $4, $5, $6) RETURNING *
				)
			SELECT
				usr.id,
				usr.info,
				usr.org_id AS "orgId",
				usr.role_id as "roleId",
				usr.author_id as "authorId",
				rcp.email,
				rcp.status_id as "statusId"
			FROM usr, rcp;`,
			[
				user.id,
				user.email,
				user.orgId,
				user.info,
				user.roleId,
				self.id,
			],
		);
	},

	get({ email, id }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT
				usr.id,
				usr.info,
				usr.org_id as "orgId",
				usr.role_id as "roleId",
				usr.author_id as "authorId",
				rcp.email,
				rcp.status_id as "statusId"
			FROM users usr
			JOIN recipients rcp ON usr.id = rcp.id
			WHERE rcp.${column} = $1;`,
			[id || email],
		);
	},

	getFully({ email, id }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT usr.id, usr.info, usr.author_id as "authorId", rcp.email,
				(
					SELECT json_build_object(
						'id', states.id,
						'value', states.value
					)
					FROM states
					WHERE states.id = rcp.status_id
				) as status,
				(
					SELECT json_build_object(
						'id', r.id,
						'info', r.info,
						'rights', json_object_agg(st.name, rr.rights)
					) 
					FROM role_rights rr
					JOIN shareable_tables st ON rr.table_id = st.id
					JOIN roles r ON rr.role_id = r.id
					WHERE r.id = usr.role_id
					GROUP by r.id
				) AS role,
				(
					SELECT json_build_object(
						'id', org.id,
						'info', org.info,
						'label', org.label
					) 
					FROM organizations org
					WHERE org.id = usr.id
				) AS organization
			FROM users usr
			JOIN recipients rcp ON usr.id = rcp.id
			WHERE rcp.${column} = $1;`,
			[id || email],
		);
	},

	set({ id }, updated) {
		const columns = Object.entries(updated)
			.map(([col, val]) => ({ col, val }));
		const where = { col: 'id', val: id };
		return columns.length > 0
			? db.update(this.table, columns, { where })
			: Promise.reject(new PgError('invalid user updating'));
	},

	remove({ id }) {
		return db.query(
			'DELETE FROM users WHERE id = $1 RETURNING *;',
			[id],
		);
	},

	genPassSettingToken() {
		return crypto.randomBytes(20).toString('hex');
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

	getByToken(token) {
		return db.query(
			'SELECT user_id AS "userId", token FROM user_tokens WHERE token = $1;',
			[token],
		);
	},

	deleteToken(token) {
		return db.query('DELETE FROM user_tokens WHERE token = $1;', [token]);
	},
};

export default users;
