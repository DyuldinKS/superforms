import db from './queries';
import Role from '../libs/role';
// import { shareableTables } from './initialValues';

const roles = {
	add({ role, self }) {
		return role instanceof Role && role.isValid()
			? db.query(
				`WITH role_i AS (
					INSERT INTO roles(label, info, author_id)
					VALUES($1, $2, $3)
					RETURNING *
				), 
				role_rights_i AS (
					INSERT INTO role_rights(table_id, role_id, rights)
					SELECT
						st.id as table_id,
						(SELECT id FROM role_i) as role_id,
						rights.value::int as rights
					FROM shareable_tables st
					JOIN (
						SELECT * FROM json_each_text('${JSON.stringify(role.rights)}')
					) AS rights
					ON rights.key = st.name
				)
				SELECT * FROM role_i;`,
				[
					role.label,
					role.info,
					self.id,
				],
			)
			: Promise.reject(new Error('invalid role inserting'));
	},

	get({ id }) {
		return db.query(
			`SELECT json_build_object(
				'id', r.id,
				'info', r.info,
				'rights', json_object_agg(st.name, rr.rights)
			) 
			FROM role_rights rr
			JOIN shareable_tables st ON rr.table_id = st.id
			JOIN roles r ON rr.role_id = r.id
			WHERE r.id = $1
			GROUP by r.id;`,
			[id],
		);
	},

	getAll() {
		return db.queryAll('SELECT * FROM roles;');
	},

	update({ role }) {
		return role instanceof Role && role.isValid()
			? db.queryAll(
				`WITH role_u AS (
					UPDATE roles
					SET label = $2, info = $3 WHERE id = $1
					RETURNING *
				),
				old_rights_s AS (SELECT * FROM role_rights WHERE role_id = $1),
				new_rights_s AS (
					SELECT
						st.id as table_id,
						$1 as role_id,
						rights.value::int as rights
					FROM shareable_tables st
					JOIN (
						SELECT * FROM json_each_text('${JSON.stringify(role.rights)}')
					) AS rights
					ON rights.key = st.name
				),
				rights_d AS (
					DELETE FROM role_rights WHERE role_id = $1
						AND table_id NOT IN (SELECT table_id FROM new_rights_s)
					RETURNING *
				),
				rights_u AS (
					UPDATE role_rights rr
					SET rights = new.rights
					FROM new_rights_s new
					WHERE rr.role_id = new.role_id
						AND rr.table_id = new.table_id
						AND rr.rights != new.rights
					RETURNING *
				),
				rights_i AS (
					INSERT INTO role_rights(table_id, role_id, rights)
					SELECT * FROM new_rights_s 
					WHERE new_rights_s.table_id NOT IN (
						SELECT table_id FROM old_rights_s
					)
					RETURNING *
				)
				SELECT * FROM rights_i`,
				[
					role.id,
					role.label,
					role.info,
				],
			)
			: Promise.reject(new Error('invalid role updating'));
	},
};

export default roles;
