import Recipient from '../models/Recipient';
import Org from '../models/Org';
import User from '../models/User';
import Form from '../models/Form';
import { HTTPError } from '../errors';


const models = {
	recipient: {
		model: Recipient,
		// find: Recipient.find,
		key: 'rcpt',
	},
	user: {
		model: User,
		// find: User.findById,
		key: 'user',
	},
	org: {
		model: Org,
		key: 'org',
	},
	form: {
		model: Form,
		key: 'form',
	},
};

// generate re for urls like /user/432 and /api/v1/form/1337 ...
const instanceIdRE = new RegExp(`/(${Object.keys(models).join('|')})/(\\d{1,8})`);


function getModelToSearch(url) {
	const match = url.match(instanceIdRE);
	if(!match) throw new Error('There is no any instance.');
	const [, category, id] = match;
	return { ...models[category], id };
}

// load all required data to 'req' object
export default (req, res, next) => {
	const { model, key, id } = getModelToSearch(req.originalUrl);
	model.findById(id)
		.then((instance) => {
			if(!instance) {
				throw new HTTPError(404, `${key} not found`);
			}
			req.loaded = { [key]: instance };
			next();
		})
		.catch(next);
};
