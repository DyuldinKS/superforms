import { isActive } from '../middleware/users';
import {
	loadParams,
	createInstance,
	loadInstance,
	loadDependincies,
} from '../middleware/instances';
import { checkAccess } from '../middleware/access';
import Form from '../models/Form';
import { HTTPError } from '../errors';


export default (app) => {
	app.use(
		[
			/\/api\/v\d{1,2}\/response\/\d{1,16}$/, // api
			/\/response\/\d{1,16}$/, // ssr
		],
		isActive,
		loadParams,
		loadInstance,
		loadDependincies,
		checkAccess,
	);


	app.get(
		'/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const response = req.loaded.instance;
			res.send('awesome stub');
		},
	);


	app.get(
		'/api/v1/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const response = req.loaded.instance;
			res.json(response);
		},
	);


	app.post(
		'/api/v1/response',
		isActive,
		loadParams,
		createInstance,
		loadDependincies,
		checkAccess,
		(req, res, next) => {
			const { author } = req;
			const response = req.loaded.instance;
			response.respondent = { ip: req.connection.remoteAddress };

			const { form } = response;

			if(!form.isShared() || form.collecting.shared !== response.secret) {
				next(new HTTPError(403, 'No access'));
			}

			response.save({ author })
				.then(() => { res.status(200).send(); })
				.catch(next);
		},
	);
};
