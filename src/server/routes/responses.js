import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Form from '../models/Response';
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
	);


	app.get(
		'/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { response } = req.loaded;
			res.send('awesome stub');
		},
	);


	app.get(
		'/api/v1/response/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { response } = req.loaded;
			res.json(response);
		},
	);


	app.post(
		'/api/v1/response',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const props = req.body;
			const response = new Response(props);
			response.respondent = { ip: req.connection.remoteAddress };

			Form.findById(response.formId)
				.then(form => {
					if(form.collecting && (
						form.collecting.shared === response.secret
					)) {
						return response.save({ props, author })
					} else {
						throw new HTTPError(403, 'No access');
					}
				})
				.then(() => {	res.send(response); })
				.catch(next);
		},
	);
};
