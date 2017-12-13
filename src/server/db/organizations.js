import db from '../db/index';
import staticTables from './staticTables.json';

const { states, rcptTypes } = staticTables;


const orgs = {
	table: 'organizations',


	insert({ email, info, authorId }) {
		return db.query(
			`WITH rcpt_u AS (
				UPDATE recipients
				SET type_id = $2
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
				) as stored_rcpt)
				RETURNING *
			),
			rcpt AS (
				SELECT * FROM rcpt_i UNION ALL SELECT * FROM rcpt_u
			)
			INSERT INTO organizations(id, info, author_id)
			VALUES((SELECT id FROM rcpt), $4, $5)
			RETURNING *;`,
			[
				email,
				rcptTypes.ids.organization,
				states.ids.active,
				info,
				authorId,
			],
		);
	},


	select({ email, id }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT orgs.*, rcpt.email, (
				SELECT json_build_object('id', st.id, 'name', st.name)
				FROM states st WHERE st.id = rcpt.status_id
			) AS status, (
				SELECT up.chief_org_id FROM org_links up
				WHERE up.org_id = orgs.id AND up.distance = 1
			), (
				SELECT COUNT(*) FROM org_links down
				WHERE down.chief_org_id = orgs.id AND down.distance = 1
			)::int AS "suborgsNum",(
				SELECT COUNT(*) FROM users WHERE users.org_id = orgs.id
			)::int AS "employeesNum"
			FROM organizations orgs
			JOIN org_links up ON orgs.id = up.org_id
			JOIN recipients rcpt ON orgs.id = rcpt.id
			WHERE rcpt.${column} = $1;`,
			[id || email],
		);
	},


	selectAll({ id }, level = 1) {
		const params = [id];
		if(level) params.push(level);

		return db.queryAll(
			`SELECT orgs.id, orgs.info, up.chief_org_id AS "chiefOrgId",
				rcpt.email, rcpt.status_id AS "statusId"
			FROM organizations orgs
			JOIN org_links up ON orgs.id = up.org_id AND up.distance > 0
			JOIN recipients rcpt ON orgs.id = rcpt.id
			WHERE orgs.id IN (
				SELECT org_id FROM org_links down
				WHERE down.chief_org_id = $1
				AND down.distance > 0 
				${level ? 'AND down.distance <= $2' : ''} 
			);`,
			params,
		);
	},
};


export default orgs;
