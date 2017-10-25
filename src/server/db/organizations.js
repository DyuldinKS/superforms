import * as db from './queries';

const organizations = {

	create({ self, receiver }, org) {
		return db.query(
			`INSERT INTO organizations(
				receiver_id,
				info, 
				status_id, 
				author_id
			)
			VALUES($1, $2, $3, $4) RETURNING *`,
			[
				receiver.id,
				org.info,
				// constTables.states[org.status || 'active'],
				self.id,
			]
		);
	},

	getByReceiver({ email, id }) {
		const column = email ? 'email' : 'id';
		return db.query(
			`SELECT organizations.*, receivers.email 
			FROM organizations orgs JOIN receivers
			ON orgs.receiver_id = receivers.id 
			WHERE receivers.${column} = $1;`,
			[email || id]
		);
	},

	readAll({ self }, { orgId }) {
		return db.queryAll(
			`SELECT organizations.*, org_links.chief_org_id 
			FROM organizations orgs JOIN org_links 
			ON orgs.id = org_links.id AND org_links.chief_org_id = $1
			WHERE org_links.distance = 1;`,
			orgId
		);
	},

	update({ self }, searchParams, updatedFields) {
		return db.update(
			'organizations',
			updatedFields,
			searchParams
		);
	},
};

export default organizations;
