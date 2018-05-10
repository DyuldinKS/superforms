import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Form from '../models/Form';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	app.use(
		[
			/\/api\/v\d{1,2}\/form\/\d{1,8}(\/(responses|xlsx))?$/, // api
			/\/form\/\d{1,8}$/, // ssr
		],
		isActive,
		loadInstance,
	);


	app.get(
		'/form/:id',
		(req, res, next) => {
			const { form } = req.loaded;
			const { s: shared } = req.query;

			if(!shared) return res.redirect('/form/:id/edit');

			if(form.collecting === null || form.collecting.shared !== shared) {
				return next(new HTTPError(404, 'form not found'));
			}
			res.send(ssr.interview({ form }));
		},
	);


	app.get(
		'/api/v1/form/:id',
		(req, res, next) => {
			const { form } = req.loaded;
			res.json(form);
		},
	);


	app.get(
		'/api/v1/form/:id/responses',
		(req, res, next) => {
			const { form } = req.loaded;
			form.getResponses()
				.then(responses => res.json(responses))
				.catch(next);
		},
	);


	app.get(
		'/api/v1/form/:id/xlsx',
		(req, res, next) => {
			const { form } = req.loaded;
			form.getResponses('full')
				.then(() => {
					const xlsxBuffer = form.generateXLSX();
					res.json(xlsxBuffer);
				});
		},
	);


	app.post(
		'/api/v1/form',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const props = req.body;
			const form = new Form(props);

			form.save({ props, author })
				.then(() => {	res.send(form); })
				.catch(next);
		},
	);


	// update form
	app.patch(
		'/api/v1/form/:id',
		(req, res, next) => {
			const { author } = req;
			const { form } = req.loaded;
			const props = req.body;

			form.update({ props, author })
				.then(() => res.json(form))
				.catch(next);
		},
	);
};
