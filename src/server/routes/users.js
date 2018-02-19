import User from '../models/User';
import Org from '../models/Org';
import hbs from '../templates/pages';
import store from 'Redux/';
import * as routerModule from 'Redux/common/router';
import { entity as entityModule } from 'Redux/common/entities';
import renderApp from '../templates/renderApp';
import mailer from '../libs/mailer';
import { HttpError, SmtpError, PgError } from '../libs/errors';


export default (app) => {
	const { actions: { fetchOneSuccess, fetchOneFailure } } = entityModule;

	app.get('/users/:id', (req, res, next) => {
		store.dispatch(routerModule.actions.init(req.url, req.query));

		const { id } = req.params;
		const { user } = req.loaded;

		if(user) {
			store.dispatch(fetchOneSuccess('users', id, user));
		} else {
			const err = new HttpError(404, 'Пользователь не найден');
			store.dispatch(fetchOneFailure('users', id, err));
		}

		res.send(renderApp(store));
	});

	// create user
	app.post(
		'/api/v1/users',
		(req, res, next) => {
			const user = new User({
				...req.body,
				authorId: req.loaded.self.id,
			});

			if(!user.email) return next(new HttpError(400, 'Missing email'));
			if(!user.role) return next(new HttpError(400, 'Missing user role'));

			return user.save()
				.then(() => user.recoverPass())
				.then(() => mailer.sendRegistrationTo(user))
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
			const { user } = req.loaded;

			user.update(req.body)
				.then(() => res.json(user))
				.catch(next);
		},
	);
};
