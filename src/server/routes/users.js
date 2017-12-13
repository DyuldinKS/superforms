import User from '../models/User';
import hbs from '../templates/pages';
import mailer from '../libs/mailer';
import { isAuthenticated } from '../middleware/sessions';
import { HttpError, SmtpError, PgError } from '../libs/errors';


export default (app) => {
	// create user
	app.post(
		'/api/v1/users',
		isAuthenticated,
		(req, res, next) => {
			const user = new User({ ...req.body, authorId: req.loaded.self.id });

			return user.save()
				.then(() => user.recovery())
				.then(() => mailer.sendRegistration(user))
				.then(() => res.status(200).send())
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

	app.get(
		'/api/v1/users/:id',
		isAuthenticated,
		(req, res, next) => {
			res.json(req.loaded.user);
		},
	);

	// password recovery page
	app.get('/recovery/:token', (req, res, next) => {
		const { token } = req.params;

		User.findByToken(token)
			.then((user) => {
				if(!user) throw new HttpError(404, 'Not Found');
				res.send(hbs.passSettingPage());
			})
			.catch(next);
	});

	// create password recovery token
	app.put('/api/v1/recovery', (req, res, next) => {
		const { email, sendBy = 'email' } = req.body;

		return User.find({ email })
			.then((user) => {
				if(!user) throw new HttpError(404, 'Not Found');
				return user.resetPassword();
			})
			.then(user => (
				sendBy === 'http response'
					? user.token
					: mailer.sendPasswordReсovery(user)
			))
			.then(() => res.status(200).send())
			.catch(err => {
				console.log(err);
				next(err);
			});
	});

	// set password
	app.patch(
		'/api/v1/recovery/:token',
		(req, res, next) => {
			const { email, password } = req.body;
			const { token } = req.params;

			User.findByToken(token)
				.then((user) => {
					if(!user) throw new HttpError(404, 'Not Found');
					if(email !== user.email) throw new HttpError(403, 'Incorrect email');
					return user.setPass(password);
				})
				.then(() => res.status(200).send())
				.catch(next);
		},
	);
};
