import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Form from '../models/Form';
import Response from '../models/Response';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------- SERVER SIDE RENDERING ---------------------------
	----------------------------------------------------------------------------*/

	app.use(
		// all ssr routes with specified response id
		/\/response\/\d{1,16}$/,
		isActive,
		loadInstance,
	);


	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	// create response (save filled form)
	app.post(
		'/api/v1/response',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const props = {
				...req.body,
				respondent: { ip: req.connection.remoteAddress },
			};
			const response = new Response(props);
			if(!response.formId) {
				return next(new HTTPError(400, 'formId is not specified.'));
			}

			Form.findById(response.formId)
				.then((form) => {
					if(!form) throw new HTTPError(404, 'form not found');

					if(!form.collecting
							|| (form.collecting.shared !== response.secret)) {
						throw new HTTPError(403, 'No access');
					}

					return form.checkAnswers(response.items);
				})
				.then(() => response.save({ author }))
				.then(() => {	res.send(response); })
				.catch(next);
		},
	);


	app.use(
		// all api routes with specified response id
		/\/api\/v\d{1,2}\/response\/\d{1,16}$/,
		isActive,
		loadInstance,
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
};
