import Recipient from '../models/Recipient';
import Org from '../models/Org';
import User from '../models/User';
import Form from '../models/Form';
import Response from '../models/Response';
import { HTTPError } from '../errors';


const models = {
	recipient: {
		model: Recipient,
		key: 'rcpt',
	},
	user: {
		model: User,
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
	response: {
		model: Response,
		key: 'response',
	},
};

const keys = Object.keys(models).join('|');
// generate re for urls like /user/432 and /api/v1/form/1337 ...
const instanceIdRE = new RegExp(`/(${keys})/(\\d{1,8})`);
// generate re for urls like /api/v1/org and /api/v1/response ...
const newInstanceRe = new RegExp(`^/api/v\\d{1,2}/(${keys})$`);


/* ---------------------- LOAD INSTANCE BY TYPE AND ID ---------------------- */

const getModelToSearch = (url) => {
	const match = url.match(instanceIdRE);
	if(!match) throw new Error('Can not define any instance with id.');
	const [, type, id] = match;
	return { ...models[type], id };
};


// load all required data to 'req' object
const loadInstance = (req, res, next) => {
	const { model, key, id } = getModelToSearch(req.originalUrl);
	model.findById(id)
		.then((instance) => {
			if(!instance) {
				throw new HTTPError(404, `${key} not found`);
			}
			req.loaded = { [key]: instance };
		})
		.then(next)
		.catch(next);
};


/* ----------- CREATE NEW INSTANCE BY TYPE AND REQUEST BODY DATA ------------ */

const getModelToCreate = (url) => {
	const match = url.match(newInstanceRe);
	if(!match) throw new Error('Can not define instance to create.');
	return models[match[1]]; // get model by it's type name
};


const createInstance = (req, res, next) => {
	if(req.method !== 'POST') {
		throw new Error('You should apply generateInstance middleware only to POST requests');
	}

	const { model, key } = getModelToCreate(req.originalUrl);
	req.created = { [key]: new model(req.body) };
	next();
};


export { loadInstance, createInstance };
