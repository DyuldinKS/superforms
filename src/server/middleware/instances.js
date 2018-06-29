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


/* -------------------------- LOAD INSTANCE PARAMS -------------------------- */


const loadParams = (req, res, next) => {
	const { 0: type, 1: id, 3: section } = req.params;
	if(!(type in models)) {
		return next(new HTTPError('Type of instance to load is not defined in url'));
	}
	req.loaded = { type, id, section };
	next();
};


/* ---------------------- LOAD INSTANCE BY TYPE AND ID ---------------------- */

const loadInstance = (req, res, next) => {
	const { type, id } = req.loaded;
	if(!type || !id) {
		return next(new Error('id or type of instance to load is not defined'));
	}

	const Model = models[type];
	Model.findById(id)
		.then((instance) => {
			if(!instance) {
				throw new HTTPError(404, `${type} not found`);
			}
			req.loaded.instance = instance;
		})
		.then(next)
		.catch(next);
};


/* ----------- CREATE NEW INSTANCE BY TYPE AND REQUEST BODY DATA ------------ */

const createInstance = (req, res, next) => {
	try {
		const { type } = req.loaded;
		if(req.method !== 'POST') {
			throw new Error('generateInstance middleware applies only to POST requests');
		}
		if(!type) {
			throw new Error('type of instance to create is not defined');
		}

		const Model = models[type];
		const { author } = req;
		// can throw an error if props are invalid
		req.loaded.instance = Model.create({ author, props: req.body });
		next();
	} catch (err) {
		next(err);
	}
};


/* --------------------------- LOAD DEPENDINCIES ---------------------------- */

const loadDependincies = (req, res, next) => {
	Promise.resolve(req.loaded)
		.then(({ instance }) => {
			if(!instance) {
				throw new Error('No loaded or created model instance found');
			}
			return instance.loadDependincies();
		})
		.then((result) => { req.loaded.dependincies = result; })
		.then(next)
		.catch(next);
};


export { loadParams, loadInstance, createInstance, loadDependincies };
