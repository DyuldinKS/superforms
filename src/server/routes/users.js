import { isNotAuthenticated } from '../middleware/sessions';
import User from '../models/User';
import Org from '../models/Org';
import mailer from '../libs/mailer';
import { HttpError, SmtpError, PgError } from '../libs/errors';
import ssr from '../templates/ssr';


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
				return user.restorePassword();
			})
			.then(user => mailer.sendPasswordRestoreEmail(user))
			.then(() => res.status(200).send())
			.catch(next);
	});


	// send email with new password
	app.get(
		'/user/password',
		isNotAuthenticated,
		(req, res, next) => {
			const { token } = req.query;
			if(!token) {
				return next(new HttpError(404, 'Not Found'));
			}

			User.findByToken(token)
				.then((user) => {
					if(!user) throw new HttpError(404, 'Not Found');
					return user.resetPassword(user.id);
				})
				.then((user) => {
					mailer.sendPasswordResetEmail(user);
					return user;
				})
				.then(user => res.send(ssr.auth({
					location: '/signin',
					alert: {
						type: 'success',
						message: `Новый пароль для доступа в систему выслан вам на почту: ${user.email}`,
					},
				})))
				.catch(next);
		},
	);


	// create user
	app.post(
		'/api/v1/users',
		(req, res, next) => {
			const { self } = req.loaded;
			const user = new User({ ...req.body });

			if(!user.email) return next(new HttpError(400, 'Missing email'));
			if(!user.role) return next(new HttpError(400, 'Missing user role'));

			return user.save(self.id)
				.then(() => user.resetPassword(self.id))
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
		'/api/v1/user/:id',
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
		'/api/v1/user/:id',
		(req, res, next) => {
			const { user, self } = req.loaded;
			const params = req.body;

			user.update(params, self.id)
				.then(() => res.json(user))
				.catch(next);
		},
	);
};
