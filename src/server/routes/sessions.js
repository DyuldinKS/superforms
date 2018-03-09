import { isNotAuthenticated } from '../middleware/sessions';
import User from '../models/User';
import hbs from '../templates/pages';
import mailer from '../libs/mailer';
import { HttpError } from '../libs/errors';
import ssr from '../templates/renderApp';


export default (app) => {
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
				.then(next)
				.catch(next);
		},
	);


	// page to sign in or enter email and send pass reset link to it
	app.get(
		[
			'/recovery',
			'/signin',
		],
		isNotAuthenticated,
		(req, res, next) => {
			res.send(ssr.auth({ location: req.path }));
		},
	);


	// (!) DEFERRED

	// send password recovery page
	// app.get('/recovery/:token', (req, res, next) => {
	// 	const { token } = req.params;
	// 	User.findByToken(token)
	// 		.then((user) => {
	// 			if(!user) throw new HttpError(404, 'Not Found');
	// 			res.send(hbs.passRecoveryPage());
	// 		})
	// 		.catch(next);
	// });


	// sign in
	app.post(
		'/api/v1/session',
		isNotAuthenticated,
		(req, res, next) => {
			const { email, password } = req.body;

			User.findByEmail(email)
				.then((user) => {
					if(!user) throw new HttpError(403, 'Incorrect email or password');
					return user.authenticate(password);
				})
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

	app.get('/signout', (req, res, next) => {
		if(req.session.user) {
			req.session.destroy((err) => {
				if(err) return next(new HttpError(500));
				return res.status(200).send();
			});
		}

		res.redirect('/signin');
	});
};
