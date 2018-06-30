class Access {
	/* ---------------------------- STATIC METHODS ---------------------------- */

	static setRoles(roles) {
		Access.roles = roles;
	}

	static defineType(obj) {
		return obj.constructor.name.toLowerCase();
	}


	/* --------------------------- INSTANCE METHODS --------------------------- */

	constructor(user) {
		this.setSubj(user);
	}

	setSubj(user) {
		this.subj = user;
	}

	setAction(action) {
		this.action = action;
	}

	check(obj, props) {
		const { subj, action } = this;
		const type = Access.defineType(obj);
		return Access.roles[subj.role][action][type](subj, obj, props);
	}

	create(obj, params) {
		this.setAction('create');
		return this.check(obj, params);
	}

	read(obj, params) {
		this.setAction('read');
		return this.check(obj, params);
	}

	update(obj, params) {
		this.setAction('update');
		return this.check(obj, params);
	}
}


export default Access;
