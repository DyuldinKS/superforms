import {
	isAuthenticated,
	isNotAuthenticated,
} from '../middleware/sessions';
import User from '../models/User';
import Org from '../models/Org';
import mailer from '../libs/mailer';
import { HttpError, SmtpError, PgError } from '../libs/errors';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	// send email for password reset
	app.put('/api/v1/user/password', (req, res, next) => {
		const { email, reset } = req.body;

		if(!reset) return next(new HttpError(400));

		User.findByEmail(email)
			.then((user) => {
				if(!user) throw new HttpError(404, 'Not Found');
				return user.resetPassword();
			})
			.then(user => mailer.sendPasswordResetEmail(user))
			.then(() => res.status(200).send())
			.catch(next);
	});


	// (!) DEFERRED

	// set password
	// app.patch(
	// 	'/api/v1/user/password',
	// 	isNotAuthenticated,
	// 	(req, res, next) => {
	// 		const { email, password, token } = req.body;
	// 		if(!token) {
	// 			return next(new HttpError(404, 'Not Found'));
	// 		}

	// 		User.findByToken(token)
	// 			.then((user) => {
	// 				if(!user) throw new HttpError(404, 'Not Found');
	// 				if(user.email !== email) throw new HttpError(403);
	// 				return user.setPassword(password);
	// 			})
	// 			.then(() => res.status(200).send())
	// 			.catch(next);
	// 	},
	// );


	// create user
	app.post(
		'/api/v1/users',
		isAuthenticated,
		(req, res, next) => {
			const { self } = req.loaded;
			const user = new User({ ...req.body });

			if(!user.email) return next(new HttpError(400, 'Missing email'));
			if(!user.role) return next(new HttpError(400, 'Missing user role'));

			return user.save(self.id)
				.then(() => user.recoverPass())
				.then(() => mailer.sendRegistrationEmail(user))
				.then(() => res.json(user))
				.catch((err) => {
					if(err instanceof PgError) {
						if(err.code === '23502'
							&& err.message.includes('null value in column "id"')) {
							throw new HttpError(202, 'This email is not available');
						}
					}
					if(err instanceof SmtpError) {
						throw new HttpError(202, 'SMTP-server not available');
					}
					throw err;
				})
				.catch(next);
		},
	);


	// get user
	app.get(
		'/api/v1/users/:id',
		isAuthenticated,
		(req, res, next) => {
			const { user } = req.loaded;

			Org.findById(user.orgId)
				.then((org) => {
					if(!org) throw new HttpError(404, 'Organization of the user is not found');
					res.json({
						users: { [user.id]: user },
						orgs: { [org.id]: org },
					});
				})
				.catch(next);
		},
	);


	// update user
	app.patch(
		'/api/v1/users/:id',
		(req, res, next) => {
			const { user, self } = req.loaded;
			const params = req.body;

			user.update(params, self.id)
				.then(() => res.json(user))
				.catch(next);
		},
	);
};
