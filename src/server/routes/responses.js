import { isActive } from '../middleware/users';
import {
	loadParams,
	createInstance,
	loadInstance,
	loadDependincies,
} from '../middleware/instances';
import { checkAccess, accessError } from '../middleware/access';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	// create response (save filled form)
	app.post(
		'/api/v1/response',
		loadParams,
		createInstance,
		loadDependincies,
		(req, res, next) => {
			const { author } = req;
			const response = req.loaded.instance;
			response.respondent = { ip: req.connection.remoteAddress };

			const { form } = response;

			Promise.resolve()
				.then(() => {
					if(!form.isShared() || form.collecting.shared !== response.secret) {
						throw accessError;
					}
				})
				.then(() => form.checkAnswers(response.items))
				.then(() => response.save({ author }))
				.then(() => res.send(response))
				.catch(next);
		},
	);


	app.use(
		/\/api\/v\d{1,2}\/response\/\d{1,16}\/?$/, // api
		isActive,
		loadParams,
		loadInstance,
		loadDependincies,
		checkAccess,
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

	app.get(
		'/api/v1/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const response = req.loaded.instance;
			res.json(response);
		},
	);
};
