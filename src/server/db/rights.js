const roles = {
	// constructor(role) {
	// 	if(typeof role !== 'object') throw new Error('invalid role');
	// 	this.label = role.label;
	// 	this.info = role.info;
	// 	this.id = role.id;
	// 	this.authorId = role.authorId || role.author_id;
	// 	this.created = role.created;
	// 	this.tables = ['created', 'updated', 'deleted', 'waiting', 'active', 'blocked', 'notAvailable'];
	// 	if(role.rights !)
	// 	if(typeof role.rights === 'object') {
	// 	}
	// 	// this.rights = (role.rights && role.rights.length > 0)
	// 	// 	? role.rights.map(rights => )
	// }

	isValid(role) {
		if(!role) return false;
		const { label, info, rights: rightsList } = role;
		const shareable = ['organizations', 'users', 'forms', 'responses', 'roles', 'receivers', 'receiver_lists'];
		return label && info && rights
			&& (
				(rightsList.isArray && rightsList.isArray() && role.rights.every(r => rights.isValid(r)))
					|| (typeof rightsList === 'object' && tables.every(t => rights.isValid(rights[t])))
					|| (typeof rightsList === 'string' && rights.split('-').every(rights.isValid))
			);
	},
};

// console.log(new Rights().isEncodedValid(33432));
// console.log(Rights.isDecodedValid(rights.encode(33432)));
// console.log(new Rights().decode(37012));
// console.log(new Rights().encode(['enclosing', 'none', 'none', 'personal', 'local']));

// console.log(Rights.isEncodedValid(34212));
// console.log(Rights.isValid({}));
// console.log(Rights.intScopeOf('read', [ 'enclosing', 'local', 'none', 'personal', 'local' ]));
const role = {
	label: 'hey dude',
	info: { come: 'at me' },
	rights: '32313-32313-32313-32313-32313-32313-32313',
};
// role.rights.split('-').forEach(console.log);

// console.log(roles.isValid(role))

// class Role extends Rights {
// 	constructor() {
// 		super();
// 		this.tables = [
// 			'organizations',
// 			'users',
// 			'forms',
// 			'responses',
// 			'roles',
// 			'receivers',
// 			'receiver_lists',
// 		];
// 	}
// }

// export default rights;
