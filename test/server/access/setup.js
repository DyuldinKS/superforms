import Org from 'Server/models/Org';
import User from 'Server/models/User';
import Form from 'Server/models/Form';

/* org tree:
		1
	2		3
				4
*/
const orgProps = {
	1: { parentId: null },
	2: { parentId: 1 },
	3: { parentId: 1 },
	4: { parentId: 3 },
}

const parentsByOrg = {
	1: [],
	2: [1],
	3: [1],
	4: [3, 1],
}


/* users:
	idsByRole: {
		root: 1,
		admin: 2,
		user: 3,
	}
	id: ${org.id}.{role.id}
*/

class EntityFactory {
	createOrg(key, props) {
		const id = +key;
		if (!isNaN(id)) {
			return new Org({
				id,
				...props,
				parentOrgIds: [id, ...(parentsByOrg[id] || [])],
			})
		}

		const { parentId } = props;
		return new Org({
			...props,
			parentOrgIds: [parentId, ...(parentsByOrg[parentId] || [])],
		});
	}

	createUser(id, props) {
		const { orgId } = props;
		return new User({
			id,
			...props,
			parentOrgIds: [orgId, ...parentsByOrg[orgId]],
		})
	}

	create(name) {
		const method = `create${name && name[0].toUpperCase() + name.slice(1)}`;
		return (props) => (
			Object.entries(props).reduce(
				(acc, [id, values]) => {
					acc[id] = this[method](id, values)
					return acc;
				},
				{},
			)
		)
	}
}

const userProps = {
	'1.1': { orgId: 1, role: 'root' },
	'1.2': { orgId: 1, role: 'admin' },
	'1.3': { orgId: 1, role: 'user' },
	'3.1': { orgId: 3, role: 'root' },
	'3.2': { orgId: 3, role: 'admin' },
	'3.3': { orgId: 3, role: 'user' },
	'4.2': { orgId: 4, role: 'admin' },
	'4.3': { orgId: 4, role: 'user' },
}

const entityFactory = new EntityFactory;
const orgs = entityFactory.create('org')(orgProps);
const users = entityFactory.create('user')(userProps);


export {
	orgs,
	parentsByOrg,
	users,
	entityFactory
};
