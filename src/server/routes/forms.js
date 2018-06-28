import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import preloadReduxStore from '../middleware/preloadReduxStore';
import Form from '../models/Form';
import XLSX from '../models/XLSX';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';
import { actions as entitiesActions } from '../../client/shared/entities';
import { actions as formActions } from '../../client/apps/app/shared/redux/forms';


export default (app) => {
	app.use(
		[
			/^\/api\/v\d{1,2}\/form\/\d{1,8}(\/(responses|xlsx))?$/, // api
			/^\/form\/\d{1,8}(\/(edit|preview|distribute|responses))?$/, // ssr
		],
		isActive,
		loadInstance,
	);


	app.get(
		'/form/:id',
		(req, res, next) => {
			const { form } = req.loaded;
			const { s: shared } = req.query;

			if(!shared) {
				if(!form.collecting) {
					return res.redirect(`/form/${form.id}/edit`);
				}
				return res.redirect(`/form/${form.id}/preview`);
			}

			if(form.collecting === null || form.collecting.shared !== shared) {
				return next(new HTTPError(404, 'form not found'));
			}
			res.send(ssr.interview({ form }));
		},
	);


	app.get(
		[
			'/form/:id',
			'/form/:id/edit',
			'/form/:id/preview',
			'/form/:id/distribute',
		],
		preloadReduxStore,
		(req, res, next) => {
			const { form } = req.loaded;
			const { reduxStore } = req;
			const entitiesMap = { forms: form.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			res.send(ssr.app(reduxStore));
		},
	);


	app.get(
		'/form/:id/responses',
		preloadReduxStore,
		(req, res, next) => {
			const { form } = req.loaded;
			const { reduxStore } = req;
			const entitiesMap = { forms: form.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			form.getResponses('short')
				.then((responses) => {
					const action = formActions.fetchResponsesSuccess(form.id, responses);
					reduxStore.dispatch(action);
				})
				.catch((error) => {
					const action = formActions.fetchResponsesFailure(form.id, error);
					reduxStore.dispatch(action);
				})
				.then(() => { res.send(ssr.app(reduxStore)); });
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
			const { type } = req.query;
			const { form } = req.loaded;
			// default value
			let mode = 'short';
			if(type === 'xlsx' || type === 'full') mode = 'full';

			form.getResponses(mode)
				.then((responses) => {
					// send xlsx buffer or responses as JSON
					const body = (type === 'xlsx')
						? new XLSX(form, responses).write()
						: responses;

					res.json(body);
				})
				.catch(next);
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
