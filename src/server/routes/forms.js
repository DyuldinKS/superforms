import { isActive } from '../middleware/users';
import {
	loadParams,
	createInstance,
	loadInstance,
	loadDependincies,
} from '../middleware/instances';
import { checkAccess } from '../middleware/access';
import preloadReduxStore from '../middleware/preloadReduxStore';
import XLSX from '../models/XLSX';
import ssr from '../templates/ssr';
import { actions as entitiesActions } from '../../client/shared/entities';
import { actions as formActions } from '../../client/apps/app/shared/redux/forms';
import { HTTPError } from '../errors';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------- SERVER SIDE RENDERING ---------------------------
	----------------------------------------------------------------------------*/

	app.use(
		// all static routes with specified form id
		// excluding /form/:id (interview page)
		/^\/form\/\d{1,12}\/(edit|preview|distribute|responses)\/?$/,
		isActive,
		loadParams,
		loadInstance,
		loadDependincies,
		checkAccess,
		preloadReduxStore,
	);


	app.get(
		'/form/:id',
		loadParams,
		loadInstance,
		(req, res, next) => {
			const form = req.loaded.instance;
			const { s: secret } = req.query;

			if(!secret) {
				const { author } = req;
				let subpath = form.isActive() ? 'responses' : 'edit';
				if(author && author.isSimpleUser() && form.ownerId !== author.id) {
					subpath = 'preview';
				}
				return res.redirect(`/form/${form.id}/${subpath}`);
			}

			if(form.isShared() && form.collecting.shared === secret) {
				return res.send(ssr.interview({ form }));
			}

			next(new HTTPError(404, 'form not found'));
		},
	);


	app.get(
		[
			'/form/:id/edit',
			'/form/:id/preview',
			'/form/:id/distribute',
		],
		(req, res, next) => {
			const form = req.loaded.instance;
			const { reduxStore } = req;
			const entitiesMap = { forms: form.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			res.send(ssr.app(reduxStore));
		},
	);


	app.get(
		'/form/:id/responses',
		(req, res, next) => {
			const form = req.loaded.instance;
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


	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	// create new form
	app.post(
		'/api/v1/form',
		isActive,
		loadParams,
		createInstance,
		loadDependincies,
		checkAccess,
		(req, res, next) => {
			const { author } = req;
			const form = req.loaded.instance;

			form.save({ author })
				.then(() => {	res.send(form); })
				.catch(next);
		},
	);


	app.use(
		// all api routes with specified form id
		/^\/api\/v\d{1,2}\/form\/\d{1,12}(\/(responses|xlsx))?\/?$/, // api
		isActive,
		loadParams,
		loadInstance,
		loadDependincies,
		checkAccess,
	);


	app.get(
		'/api/v1/form/:id',
		(req, res, next) => {
			const form = req.loaded.instance;
			res.json(form);
		},
	);


	// update form
	app.patch(
		'/api/v1/form/:id',
		(req, res, next) => {
			const { author } = req;
			const form = req.loaded.instance;
			const props = req.body;

			form.update({ props, author })
				.then(() => res.json(form))
				.catch(next);
		},
	);


	app.get(
		'/api/v1/form/:id/responses',
		(req, res, next) => {
			const { type } = req.query;
			const form = req.loaded.instance;
			let mode = 'short'; // default value
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
};
