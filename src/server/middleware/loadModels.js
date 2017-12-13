import User from '../models/User';
import Recipient from '../models/Recipient';
import Org from '../models/Org';
import { HttpError } from '../libs/errors';


const models = {
	users: {
		find: User.find,
		key: 'user',
	},
	recipients: {
		find: Recipient.find,
		key: 'rcpt',
	},
};


function getModelsToSearch({ url, session }) {
	const modelsToSearch = [];

	if(session.user && session.user.id) {
		modelsToSearch.push({
			find: () => User.find(session.user, 'full'),
			key: 'self',
		});
	}

	url.replace(/\/(\w+)\/(\d+)/g, (match, category, id) => {
		if(models[category]) {
			modelsToSearch.push({ ...models[category], id });
		}
	});

	return modelsToSearch;
}

// load all required data to 'req' object
export default (req, res, next) => {
	const modelsToSearch = getModelsToSearch(req);
	Promise.all(modelsToSearch.map(({ find, id }) => find({ id })))
		.then((loaded) => {
			// console.log(loaded)
			req.loaded = {};
			// if(loaded.some(instance => !instance)) {
			// 	throw new HttpError(404);
			// }
			loaded.forEach((instance, i) => {
				if(!instance) throw new HttpError(404);
				req.loaded[modelsToSearch[i].key] = instance;
			});
			console.log('LOADED:');
			console.log(req.loaded);
			next();
		})
		.catch(next);
};
