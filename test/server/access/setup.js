import Org from 'Server/models/Org';
import User from 'Server/models/User';
import Form from 'Server/models/Form';

/* org tree:
		1
	2		3
				4
*/
const orgs = {
	org1: new Org({ id: 1, parentId: null, parentOrgIds: [1] }),
	org2: new Org({ id: 2, parentId: 1, parentOrgIds: [1, 2] }),
	org3: new Org({ id: 3, parentId: 1, parentOrgIds: [1, 3] }),
	org4: new Org({ id: 4, parentId: 3, parentOrgIds: [1, 3, 4] }),
};

const parentsByOrg = {
	1: [],
	2: [1],
	3: [1],
	4: [1, 3],
}

/* users:
	idsByRole: {
		root: 1,
		admin: 2,
		user: 3,
	}
	id: ${org.id}.{role.id}
*/
const users = {
	user11: new User({ id: '1.1', orgId: 1, role: 'root' }),
	user12: new User({ id: '1.2', orgId: 1, role: 'admin' }),
	user13: new User({ id: '1.3', orgId: 1, role: 'user' }),
	user31: new User({ id: '3.1', orgId: 3, role: 'root' }),
	user32: new User({ id: '3.2', orgId: 3, role: 'admin' }),
	user33: new User({ id: '3.3', orgId: 3, role: 'user' }),
	user42: new User({ id: '4.2', orgId: 4, role: 'admin' }),
	user43: new User({ id: '4.3', orgId: 4, role: 'user' }),
};


export { orgs, users, parentsByOrg };