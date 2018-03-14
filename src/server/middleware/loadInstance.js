import User from '../models/User';
import Recipient from '../models/Recipient';
import Org from '../models/Org';
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
};


function getModelToSearch(url) {
	const match = url.match(/\/(user|org|recipient)\/(\d{1,8})/);
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
			req.loaded[key] = instance;
			next();
		})
		.catch(next);
};
