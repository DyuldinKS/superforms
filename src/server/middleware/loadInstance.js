import User from '../models/User';
import Recipient from '../models/Recipient';
import Org from '../models/Org';
import { HttpError } from '../libs/errors';


const models = {
	recipients: {
		model: Recipient,
		// find: Recipient.find,
		key: 'rcpt',
	},
	users: {
		model: User,
		// find: User.findById,
		key: 'user',
	},
	orgs: {
		model: Org,
		key: 'org',
	},
};


function getModelsToSearch(url) {
	const modelsToSearch = [];

	url.replace(/\/(\w+)\/(\d+)/, (match, category, id) => {
		if(models[category]) {
			modelsToSearch.push({ ...models[category], id });
		}
	});

	return modelsToSearch;
}

// load all required data to 'req' object
export default (req, res, next) => {
	const modelsToSearch = getModelsToSearch(req.originalUrl);
	Promise.all(modelsToSearch.map(({ model, id }) => model.findById(id)))
		.then((loaded) => {
			loaded.forEach((instance, i) => {
				console.log(instance);
				if(!instance) {
					throw new HttpError(404, `${modelsToSearch[i].key} not found`);
				}
				req.loaded[modelsToSearch[i].key] = instance;
			});
			next();
		})
		.catch(next);
};
