import { isActive } from '../middleware/users';
import {
	loadParams,
	createInstance,
	loadInstance,
	loadDependincies,
} from '../middleware/instances';
import { checkAccess } from '../middleware/access';
import preloadReduxStore from '../middleware/preloadReduxStore';
import Org from '../models/Org';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';
import { actions as entitiesActions } from '../../client/shared/entities';
import { actions as orgActions } from '../../client/apps/app/shared/redux/orgs';


export default (app) => {
	app.use(
		[
			/^\/api\/v\d{1,2}\/(org)\/(\d{1,8})(\/(info|settings|forms|orgs|parents|users))?$/, // api
			/^\/(org)\/(\d{1,8})(\/(info|settings|forms|orgs|users))?$/, // ssr
			/^\/(org)\/(\d{1,8})\/(orgs|users)\/new$/, // ssr
		],
		isActive,
		loadParams, // high cohesion with the regexps above
		loadInstance,
		loadDependincies,
		checkAccess,
	);

	app.get(
		[
			'/org/:id',
			'/org/:id/info',
			'/org/:id/orgs/new',
			'/org/:id/settings',
			'/org/:id/users/new',
		],
		preloadReduxStore,
		(req, res, next) => {
			const org = req.loaded.instance;
			const { reduxStore } = req;
			const entitiesMap = { orgs: org.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			res.send(ssr.app(reduxStore));
		},
	);

	app.get(
		'/org/:id/forms',
		preloadReduxStore,
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;
			const { reduxStore } = req;
			const entitiesMap = { orgs: org.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			org.findForms(options)
				.then((forms) => {
					const action = orgActions.fetchFormsSuccess(
						org.id,
						forms.list,
						forms.entities,
					);
					reduxStore.dispatch(action);
				})
				.catch((error) => {
					reduxStore.dispatch(orgActions.fetchFormsFailure(org.id, error));
				})
				.then(() => res.send(ssr.app(reduxStore)));
		},
	);

	app.get(
		'/org/:id/orgs',
		preloadReduxStore,
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;
			const { reduxStore } = req;
			const entitiesMap = { orgs: org.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			org.findOrgsInSubtree(options)
				.then((orgs) => {
					const action = orgActions.fetchAffiliatedOrgsSuccess(
						org.id,
						orgs.list,
						orgs.entities,
					);
					reduxStore.dispatch(action);
				})
				.catch((error) => {
					const action = orgActions.fetchAffiliatedOrgsFailure(org.id, error);
					reduxStore.dispatch(action);
				})
				.then(() => res.send(ssr.app(reduxStore)));
		},
	);

	app.get(
		'/org/:id/users',
		preloadReduxStore,
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;
			const { reduxStore } = req;
			const entitiesMap = { orgs: org.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			org.findUsersInSubtree(options)
				.then((users) => {
					const action = orgActions.fetchAffiliatedUsersSuccess(
						org.id,
						users.list,
						users.entities,
					);
					reduxStore.dispatch(action);
				})
				.catch((error) => {
					const action = orgActions.fetchAffiliatedUsersFailure(org.id, error);
					reduxStore.dispatch(action);
				})
				.then(() => res.send(ssr.app(reduxStore)));
		},
	);

	// get one org
	app.get(
		'/api/v1/org/:id',
		(req, res, next) => {
			const org = req.loaded.instance;
			const orgs = { [org.id]: org };

			if(!org.parentId) {
				return res.json({ orgs });
			}

			return Org.findById(org.parentId)
				.then((parent) => {
					if(parent) orgs[parent.id] = parent;
					res.json({ orgs });
				})
				.catch(next);
		},
	);

	// find orgs in organization subtree
	app.get(
		'/api/v1/org/:id/orgs',
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;

			org.findOrgsInSubtree(options)
				.then(orgs => res.json(orgs))
				.catch(next);
		},
	);

	// get parents of the organization
	app.get(
		'/api/v1/org/:id/parents',
		(req, res, next) => {
			const org = req.loaded.instance;
			const opts = {
				...req.query,
				authorOrgId: req.author.orgId,
			};

			org.getParents()
				.then(parents => Org.sliceParents(parents, opts))
				.then(({ orgs, ids }) => res.json({ orgs, entries: ids }))
				.catch(next);
		},
	);

	// find users in organization subtree
	app.get(
		'/api/v1/org/:id/users',
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;

			org.findUsersInSubtree(options)
				.then(users => res.json(users))
				.catch(next);
		},
	);

	// find forms in specified organization
	app.get(
		'/api/v1/org/:id/forms',
		(req, res, next) => {
			const org = req.loaded.instance;
			const options = req.query;

			org.findForms(options)
				.then(forms => res.json(forms))
				.catch(next);
		},
	);

	// create organization
	app.post(
		/^\/api\/v\d{1,2}\/(org)$/, // must be a regexp to set type of new instance
		isActive,
		loadParams, // high cohesion with the regexp above
		createInstance,
		loadDependincies,
		checkAccess,
		(req, res, next) => {
			const { author } = req;
			const org = req.loaded.instance;

			return org.save({ author })
				.then(() => res.json(org))
				.catch(next);
		},
	);

	// update org
	app.patch(
		'/api/v1/org/:id',
		(req, res, next) => {
			const { author } = req;
			const org = req.loaded.instance;
			const props = req.body;

			org.update({ props, author })
				.then(() => res.json(org))
				.catch(next);
		},
	);
};
