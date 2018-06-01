import buildRoles from './roles';
import rules from './accessRules';
import Org from '../models/Org';
import User from '../models/User';
import Form from '../models/Form';

const roles = buildRoles(rules);

const defineType = obj => obj.constructor.name.toLowerCase();

const can = (user) => {
	if(!user.can) {
		user.can = new Proxy(
			{},
			{
				get: (o, action) => (
					(obj, params) => (
						roles[user.role][action][defineType(obj)](user, obj, params)
					)
				),
			},
		);
	}

	return user.can;
};


export { can };
