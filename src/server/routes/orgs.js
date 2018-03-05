import Org from '../models/Org';
import { HttpError, SmtpError, PgError } from '../libs/errors';


export default (app) => {
	// create rog
	app.post(
		'/api/v1/orgs',
		(req, res, next) => {
			const { self } = req.loaded;
			const org = new Org({ ...req.body });

			if(!org.email) return next(new HttpError(400, 'Missing email'));
			const { chiefOrgId } = org;

			return org.save(self.id)
				.then(() => org.setParentOrg(chiefOrgId))
				// .then(() => mailer.sendRegistrationTo(org))
				.then(() => res.json(org))
				.catch((err) => {
					if(err instanceof PgError) {
						if(err.code === '23502'
							&& err.message.includes('null value in column "id"')) {
							throw new HttpError(202, 'This email is not available');
						}
					}
					// if(err instanceof SmtpError) {
					// 	throw new HttpError(202, 'SMTP-server not available');
					// }
					throw err;
				})
				.catch(next);
		},
	);

	// get one org
	app.get(
		'/api/v1/orgs/:id',
		(req, res, next) => {
			const { org } = req.loaded;
			const orgs = { [org.id]: org };

			if(!org.chiefOrgId) {
				return res.json({ orgs });
			}

			Org.findById(org.chiefOrgId)
				.then((chiefOrg) => {
					Object.assign(orgs, { [chiefOrg.id]: chiefOrg });
					res.json({ orgs });
				})
				.catch(next);
		},
	);

	// get all orgs
	app.get(
		'/api/v1/orgs/:id/orgs',
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
		'/api/v1/orgs/:id/users',
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
		'/api/v1/orgs/:id',
		(req, res, next) => {
			const { org, self } = req.loaded;
			const params = req.body;

			org.update(params, self.id)
				.then(() => res.json(org))
				.catch(next);
		},
	);
};
