import { isNotAuthenticated } from '../middleware/sessions';
import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import User from '../models/User';
import Org from '../models/Org';
import mailer from '../libs/mailer';
import { HTTPError, SMTPError, PgError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	// send email for password reset
	app.put(
		'/api/v1/user/password',
		isNotAuthenticated,
		(req, res, next) => {
			const { email, reset } = req.body;

			if(!reset) return next(new HTTPError(400));

			User.findByEmail(email)
				.then((user) => {
					if(!user) throw new HTTPError(404, 'Not Found');
					return user.restorePassword();
				})
				.then(user => mailer.sendPasswordRestoreEmail(user))
				.then(() => res.status(200).send())
				.catch(next);
		},
	);


	// send email with new password
	app.get(
		'/user/password',
		isNotAuthenticated,
		(req, res, next) => {
			const { token } = req.query;
			if(!token) {
				return next(new HTTPError(404, 'Not Found'));
			}

			User.findByToken(token)
				.then((user) => {
					if(!user) throw new HTTPError(404, 'Not Found');
					return user.resetPassword({ author: user });
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


	app.use(
		[
			/\/api\/v\d{1,2}\/user\/\d{1,8}$/, // api
			/\/user\/\d{1,8}$/, // ssr
		],
		isActive,
		loadInstance,
	);


	// create user
	app.post(
		'/api/v1/user',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const user = new User({ ...req.body });

			if(!user.email) return next(new HTTPError(400, 'Missing email'));
			if(!user.role) return next(new HTTPError(400, 'Missing user role'));

			return user.save({ author })
				.then(() => user.resetPassword({ author }))
				.then(() => mailer.sendRegistrationEmail(user))
				.then(() => res.json(user))
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
					if(!org) throw new HTTPError(404, 'Organization of the user is not found');
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
			const { author } = req;
			const { user } = req.loaded;
			const props = req.body;

			let updateChain = Promise.resolve();
			const { password } = props;
			if(password) {
				updateChain = updateChain
					.then(() => User.encrypt(password))
					.then((hash) => { props.hash = hash; });
			}

			updateChain
				.then(() => user.update({ props, author }))
				.then(() => res.send(user))
				.catch(next);
		},
	);
};
