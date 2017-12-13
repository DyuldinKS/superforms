import config from '../config';
import db from '../db/index';
import Recipient from './Recipient';
import { ModelError } from '../libs/errors';


class Org extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static find(userData) {
		return db.orgs.select(userData)
			.then((found) => {
				if(!found) return null;
				return new Org(found);
			});
	}


	static findAll(userData) {
		return db.orgs.selectAll(userData);
	}


	save() {
		return Promise.resolve()
			// .then(() => {
			// 	if(!this.email) throw new ModelError(this, 'Missing email');
			// 	if(!this.role) throw new ModelError(this, 'Missing user role');
			// 	if(!this.authorId) throw new ModelError(this, 'Unknown author');
			// })
			.then(() => db.orgs.insert(this))
			.then(saved => this.assign(saved));
	}


	toJSON() {
		return JSON.stringify(this);
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

Org.prototype.props = new Set([
	'id',
	'chiefId',
	'childrenIds',
	'email',
	'info',
	'created',
	'suborgsNum',
	'employeesNum',
	// ids
	'chiefOrgId',
	'statusId',
	'authorId',
	// related objects
	'status',
]);


// Org.prototype._propsConvertion = {
// 	status_id: 'statusId',
// 	org_id: 'orgId',
// 	role_id: 'roleId',
// 	author_id: 'authorId',
// };

Object.freeze(Org);


export default Org;
