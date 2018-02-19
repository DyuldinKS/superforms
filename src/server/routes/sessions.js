import { isNotAuthenticated } from '../middleware/sessions';
import User from '../models/User';
import hbs from '../templates/pages';
import mailer from '../libs/mailer';
import { HttpError } from '../libs/errors';


export default (app) => {
	// get signin page
	app.get('/signin', (req, res, next) => {
		res.send('There will be sign in page.');
	});

	app.get('/signin', (req, res, next) => {
		res.send('There will be sign in page.');
	});

	// signin development stub
	app.get(
		'/signin/:email',
		(req, res, next) => {
			const { email } = req.params;

			User.findByEmail(email)
				.then((user) => {
					if(!user) throw new HttpError(403, 'Incorrect email or password');
					req.session.user = { id: user.id };
					return res.redirect('/');
				})
				.catch(next);
		},
	);

	// sign in
	app.post(
		'/api/v1/session',
		isNotAuthenticated,
		(req, res, next) => {
			const { email, password } = req.body;

			User.findByEmail(email)
				.then((user) => {
					if(!user) throw new HttpError(403, 'Incorrect email or password');
					return user.login(password);
				})
				.then(user => user.login(password))
				.then((user) => {
					if(user.isAuthenticated) {
						req.session.user = { id: user.id };
						return res.status(200).send();
					}
					throw new HttpError(403, 'Incorrect email or password');
				})
				.catch(next);
		},
	);


	// send password recovery page
	app.get('/recovery/:token', (req, res, next) => {
		const { token } = req.params;
		User.findByToken(token)
			.then((user) => {
				if(!user) throw new HttpError(404, 'Not Found');
				res.send(hbs.passRecoveryPage());
			})
			.catch(next);
	});

	// create password recovery token
	app.post('/api/v1/recovery', (req, res, next) => {
		const { email } = req.body;

		return User.findByEmail({ email })
			.then((user) => {
				if(!user) throw new HttpError(404, 'Not Found');
				return user.recoverPass();
			})
			.then(user => mailer.sendPassReсovery(user))
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
			const { password } = req.body;
			const { token } = req.params;

			User.findByToken(token)
				.then((user) => {
					if(!user) throw new HttpError(404, 'Not Found');
					return user.setPass(password);
				})
				.then(() => res.status(200).send())
				.catch(next);
		},
	);

	// sign out
	app.delete('/api/v1/session', (req, res, next) => {
		if(req.session.user) {
			req.session.destroy((err) => {
				if(err) return next(new HttpError(500));
				return res.status(200).send();
			});
		}
		res.status(200).send();
	});
};
