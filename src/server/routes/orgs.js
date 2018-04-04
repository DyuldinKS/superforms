import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Org from '../models/Org';
import { HTTPError } from '../errors';


export default (app) => {
	// create organization
	app.post(
		'/api/v1/org',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const org = new Org({ ...req.body });

			if(!org.email) return next(new Error('Missing email'));

			org.email = null;
			return org.save({ author })
				.then(() => res.json(org))
				.catch(next);
		},
	);


	app.use(
		[
			/\/api\/v\d{1,2}\/org\/\d{1,8}(\/\w{1,12})?$/, // api
			/\/org\/\d{1,8}(\/\w{1,12})?$/, // ssr
		],
		isActive,
		loadInstance,
	);

	// get one org
	app.get(
		'/api/v1/org/:id',
		(req, res, next) => {
			const { org } = req.loaded;
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

	// get all orgs
	app.get(
		'/api/v1/org/:id/orgs',
		(req, res, next) => {
			const { org } = req.loaded;
			const options = req.query;

			org.findAllOrgs(options)
				.then(orgs => res.json(orgs))
				.catch(next);
		},
	);

	// get all users
	app.get(
		'/api/v1/org/:id/users',
		(req, res, next) => {
			const { org } = req.loaded;
			const options = req.query;

			org.findAllUsers(options)
				.then(users => res.json(users))
				.catch(next);
		},
	);

	// update org
	app.patch(
		'/api/v1/org/:id',
		(req, res, next) => {
			const { author } = req;
			const { org } = req.loaded;
			const props = req.body;

			org.update({ props, author })
				.then(() => res.json(org))
				.catch(next);
		},
	);
};
