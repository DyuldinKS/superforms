import { isNotAuthenticated } from '../middleware/sessions';
import User from '../models/User';
import hbs from '../templates/pages';
import mailer from '../libs/mailer';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


export default (app) => {
	// page to sign in or reset password
	app.get(
		['/recovery', '/signin'],
		isNotAuthenticated,
		(req, res, next) => {
			res.send(ssr.auth({ location: req.path }));
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
					if(!user) throw new HTTPError(403, 'Incorrect email or password');
					if(!user.hash) throw new HTTPError(403, 'Please reset your password');
					if(!user.active) throw new HTTPError(403, 'Your account has been locked');
					return user.authenticate(password);
				})
				.then((user) => {
					if(user.isAuthenticated) {
						req.session.user = { id: user.id };
						return res.status(200).send();
					}
					throw new HTTPError(403, 'Incorrect email or password');
				})
				.catch(next);
		},
	);

	// sign out
	app.delete('/api/v1/session', (req, res, next) => {
		if(req.session.user) {
			req.session.destroy((err) => {
				if(err) return next(new HTTPError(500));
				return res.status(200).send();
			});
		}
		res.status(200).send();
	});
};
