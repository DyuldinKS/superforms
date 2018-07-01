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
			/\/api\/v\d{1,2}\/(response)\/(\d{1,16})$/, // api
			/\/(response)\/(\d{1,16})$/, // ssr
		],
		isActive,
		loadParams, // high cohesion with the regexps above
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
		/^\/api\/v\d{1,2}\/(response)$/, // must be a regexp to set type of new instance
		isActive,
		loadParams, // high cohesion with the regexp above
		createInstance,
		loadDependincies,
		checkAccess,
		(req, res, next) => {
			const { author } = req;
			const response = req.loaded.instance;
			response.respondent = { ip: req.connection.remoteAddress };

			if(!response.formId) {
				return next(new HTTPError(400, '"formId" is not specified.'));
			}

			Form.findById(response.formId)
				.then((form) => {
					if(!form) throw new HTTPError(404, 'form not found');

					if(form.collecting && (
						form.collecting.shared === response.secret
					)) return response.save({ author });

					throw new HTTPError(403, 'No access');
				})
				.then(() => {	res.send(response); })
				.catch(next);
		},
	);
};
