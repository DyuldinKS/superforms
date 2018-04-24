import roles from './roles';


const buildAccessToAction = (entities) => {
	return Object.entries(entities).reduce(
		(accessToActionOn, [entity, controllers]) => {
			if(typeof contollers === 'function') {
				accessToActionOn[entity] = (instance, user) => (
					Promise.resolve(() => controllers(instance, user))
				);
			} else {
				accessToActionOn[entity] = (instance, user) => (
					Promise.all(controllers.map(check => check(instance, user)))
						.then(checks => checks.includes(true))
				);
			}
			return accessToActionOn;
		},
		{},
	);
};


const buildRoleAccess = (actions) => {
	return Object.entries(actions).reduce(
		(accessTo, [action, entities]) => {
			accessTo[action] = buildAccessToAction(entities);
			return accessTo;
		},
		{},
	);
};


const buildAccess = rolesConfig => (
	Object.entries(rolesConfig).reduce(
		(access, [role, actions]) => {
			access[role] = buildRoleAccess(actions);
			return access;
		},
		{},
	)
);

const result = buildAccess(roles);
console.log(result.root.create.org.toString())
console.log(buildAccess(roles));
export default buildAccess(roles);
