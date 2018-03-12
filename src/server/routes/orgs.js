import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Org from '../models/Org';
import { HttpError, SmtpError, PgError } from '../libs/errors';


export default (app) => {
	// create organization
	app.post(
		'/api/v1/org',
		isActive,
		(req, res, next) => {
			const { self } = req.loaded;
			const org = new Org({ ...req.body });

			if(!org.email) return next(new HttpError(400, 'Missing email'));
			const { parentId } = org;

			return org.save(self.id)
				.then(() => org.setParentOrg(parentId))
				// .then(() => mailer.sendRegistrationTo(org))
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

			Org.findById(org.parentId)
				.then((chiefOrg) => {
					Object.assign(orgs, { [chiefOrg.id]: chiefOrg });
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
				.then((result) => {
					res.json(result);
				})
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
				.then((result) => {
					res.json(result);
				})
				.catch(next);
		},
	);

	// update org
	app.patch(
		'/api/v1/org/:id',
		(req, res, next) => {
			const { org, self } = req.loaded;
			const params = req.body;

			org.update(params, self.id)
				.then(() => res.json(org))
				.catch(next);
		},
	);
};
