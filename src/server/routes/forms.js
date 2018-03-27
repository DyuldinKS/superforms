import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Form from '../models/Form';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	app.use(
		[
			/\/api\/v\d{1,2}\/form\/\d{1,8}$/, // api
			/\/form\/\d{1,8}$/, // ssr
		],
		isActive,
		loadInstance,
	);

	app.get(
		'/form/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { form } = req.loaded;
			res.send(ssr.interview({ form }));
		},
	);

	app.get(
		'/api/v1/form/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { form } = req.loaded;
			res.json(form);
		},
	);


	app.post(
		'/api/v1/form',
		isActive,
		(req, res, next) => {
			const { self } = req.loaded;
			const props = req.body;
			const form = new Form(props);

			form.save(self.id)
				.then(() => {	res.send(form); })
				.catch(next);
		},
	);
};
