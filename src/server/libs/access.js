import Rights from './rights';
import Role from './role';
import Org from '../models/org';


class Access {
	constructor(user) {
		this.subj = user;
	}

	setAction(action) {
		this.action = action;
		return this;
	}

	setCategory(category) {
		this.category = category;
		return this;
	}

	setObject(obj) {
		this.obj = obj;
		return this.check();
	}

	in(orgId) {
		this.orgId = orgId;
		return this.check();
	}


	check() {
		if(!this.action) throw new Error('Access check: undefined action');
		if(!this.category) throw new Error('Access check: undefined category');
		if(!(this.obj || this.orgId)) {
			throw new Error('Access check: undefined organization or object');
		}

		if(this.obj) {
			// access to a specific obj
			return this.checkAccessToObject();
		}
		// access for a set of objs within an organization
		return this.checkAccessWithinOrg();
	}


	checkAccessToObject() {
		const {
			subj,
			category,
			action,
			obj,
		} = this;
		const scope = subj.role.getScope(category, action, 'full');

		return Promise.resolve()
			.then(() => {
				if(!scope) return false;

				switch (scope) {
				case 'local': return subj.orgId === obj.orgId;
				case 'enclosing': {
					return subj.org.hasChild(subj.orgId)
						.then(found => (found !== undefined));
				}
				case 'global': return true;
				default: return false;
				}
			});
	}


	checkAccessWithinOrg() {
		const {
			subj,
			category,
			action,
			orgId,
		} = this;
		const scope = subj.role.getScope(category, action, 'full');

		return Promise.resolve()
			.then(() => {
				if(!scope) return false;

				switch (scope) {
				case 'local': return subj.orgId === orgId;
				case 'enclosing': {
					return subj.org.hasChild(orgId)
						.then(found => (found !== undefined));
				}
				case 'global': return true;
				default: return false;
				}
			});
	}
}


// ***************** PROPERTIES ***************** //

Rights.actions.forEach((i, action) => {
	Object.defineProperty(
		Access.prototype,
		action,
		{ get: function () { return this.setAction(action); } },
	);
});


Role.categories.forEach((category) => {
	Object.defineProperties(
		Access.prototype,
		{
			[category]: {
				get: function setCategory() {
					return this.setCategory(category);
				},
			},
			[category.slice(0, -1)]: {
				value: function (obj) {
					return this.setCategory(category).setObject(obj);
				},
			},
		},
	);
});


export default Access;


// const subj = {
// 	orgId: 89,
// 	role: new Role({
// 		label: 'imc-methodist',
// 		info: { description: 'this is methodist test role' },
// 		rights: {
// 			organizations: 'nlnnl',
// 			users: 3002,
// 			forms: 'lpppp',
// 			responses: 'ppppn',
// 		},
// 	}),
// };

// const can = new Access(subj);
// const obj = { orgId: 89 };

// console.log(Access.prototype)
// const can1 = new Access('go fuck yourself bitch!')
// can.forms
// console.log(can)
// can1.update
// console.log(can)
// can.create.users.in(obj.orgId)
// can.read.user(obj)
// 	.then(console.log)
// 	.catch(console.log)
// console.log(proxy.read)
