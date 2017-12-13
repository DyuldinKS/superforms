import { isNotAuthenticated } from '../middleware/sessions';
import User from '../models/User';
import hbs from '../templates/pages';
import mailer from '../libs/mailer';
import { HttpError } from '../libs/errors';


export default (app) => {
	// get signin page
	app.get('/signin', (req, res, next) => {
		// res.send()
	});

	// sign in
	app.post(
		'/api/v1/session',
		isNotAuthenticated,
		(req, res, next) => {
			const { email, password } = req.body;

			User.find({ email }, 'secret')
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


	app.delete('/api/v1/session', (req, res, next) => {
		if(req.session.user) {
			delete req.session.user;
		}
		res.status(200).send();
	});
};
