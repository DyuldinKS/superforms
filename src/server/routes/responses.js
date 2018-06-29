import { isActive } from '../middleware/users';
import { loadInstance, createInstance, loadDependincies } from '../middleware/instances';
import Form from '../models/Form';
import Response from '../models/Response';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	app.use(
		[
			/\/api\/v\d{1,2}\/response\/\d{1,16}$/, // api
			/\/response\/\d{1,16}$/, // ssr
		],
		isActive,
		loadInstance,
		loadDependincies,
	);


	app.get(
		'/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const response = req.instance;
			res.send('awesome stub');
		},
	);


	app.get(
		'/api/v1/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const response = req.instance;
			res.json(response);
		},
	);


	app.post(
		'/api/v1/response',
		isActive,
		createInstance,
		loadDependincies,
		(req, res, next) => {
			const { author } = req;
			const response = req.instance;
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
