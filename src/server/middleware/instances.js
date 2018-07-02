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
	// get rid of query part
	const [url] = req.originalUrl.split('?');
	// cut off first and last (if exists) slash and split
	const chunks = url.slice(1, url.slice(-1) === '/' ? -1 : undefined).split('/');
	const [type, id, ...subpath] = chunks[0] === 'api' ? chunks.slice(2) : chunks;
	if(!(type in models)) {
		throw new Error('Can not define model type to load instance');
	}
	req.loaded = {
		type,
		id: Number.parseInt(id, 10),
		subpath: subpath.join('/'),
	};
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
