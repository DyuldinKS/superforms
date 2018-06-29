import Recipient from '../models/Recipient';
import Org from '../models/Org';
import User from '../models/User';
import Form from '../models/Form';
import Response from '../models/Response';
import { HTTPError } from '../errors';


const models = {
	recipient: Recipient,
	user: User,
	org: Org,
	form: Form,
	response: Response,
};

const keys = Object.keys(models).join('|');
// generate re for urls like /user/432 and /api/v1/form/1337 ...
const instanceIdRE = new RegExp(`/(${keys})/(\\d{1,8})`);
// generate re for urls like /api/v1/org and /api/v1/response ...
const newInstanceRe = new RegExp(`^/api/v\\d{1,2}/(${keys})$`);


/* ---------------------- LOAD INSTANCE BY TYPE AND ID ---------------------- */

const getModelToSearch = (url) => {
	const match = url.match(instanceIdRE);
	if(!match) throw new Error('Can not define any model type or id to load instance');
	const [, type, id] = match;
	return { Model: models[type], id };
};


// load all required data to 'req' object
const loadInstance = (req, res, next) => {
	let entityName;
	Promise.resolve()
		.then(() => getModelToSearch(req.originalUrl))
		.then(({ Model, id }) => {
			({ entityName } = Model.prototype);
			return Model.findById(id);
		})
		.then((instance) => {
			if(!instance) {
				throw new HTTPError(404, `${entityName} not found`);
			}
			req.loaded = { [entityName]: instance };
		})
		.then(next)
		.catch(next);
};


/* ----------- CREATE NEW INSTANCE BY TYPE AND REQUEST BODY DATA ------------ */

const getModelToCreate = (url) => {
	const match = url.match(newInstanceRe);
	if(!match) throw new Error('Can not define model type to create instance');
	return models[match[1]]; // get model by it's type name
};


const createInstance = (req, res, next) => {
	try {
		if(req.method !== 'POST') {
			throw new Error('generateInstance middleware applies only to POST requests');
		}

		const Model = getModelToCreate(req.originalUrl);
		const { entityName } = Model.prototype;
		const { author } = req;
		req.created = { [entityName]: Model.create({ props: req.body, author }) };
		next();
	} catch (err) {
		return next(err);
	}
};


/* --------------------------- LOAD DEPENDINCIES ---------------------------- */

const loadDependincies = (req, res, next) => {
	if(!req.loaded && !req.instance) {
		return next(new Error('No loaded or created model instance found'));
	}

	const instances = {
		...(req.loaded || {}),
		...(req.created || {}),
	};
	const loading = Object.values(instances)
		.map(instance => instance.loadDependincies());

	Promise.all(loading)
		.then(([deps]) => {
			req.dependincies = deps;
			next();
		})
		.catch(next);
};


export { loadInstance, createInstance, loadDependincies };
