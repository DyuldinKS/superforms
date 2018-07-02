import root from './root';
import admin from './admin';
import user from './user';
import rules from './rules';


export default Object.entries({ root, admin, user })
	.reduce(
		(roles, [key, config]) => Object.assign(roles, { [key]: config(rules) }),
		{},
	);
