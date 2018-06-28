import { isNotAuthenticated } from '../middleware/sessions';
import { isActive } from '../middleware/users';
import { loadInstance, createInstance } from '../middleware/instances';
import preloadReduxStore from '../middleware/preloadReduxStore';
import User from '../models/User';
import Org from '../models/Org';
import mailer from '../libs/mailer';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';
import { actions as entitiesActions } from '../../client/shared/entities';
import { actions as userActions } from '../../client/apps/app/shared/redux/users';


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


	// create user
	app.post(
		'/api/v1/user',
		isActive,
		createInstance,
		(req, res, next) => {
			const { author } = req;
			const { user } = req.created;

			user.save({ author })
				.then(() => user.resetPassword({ author }))
				.then(() => mailer.sendRegistrationEmail(user))
				.then(() => res.json(user))
				.catch(next);
		},
	);


	app.use(
		[
			/^\/api\/v\d{1,2}\/user\/\d{1,8}(\/\w{1,12})?$/, // api
			/^\/user\/\d{1,8}(\/(info|settings|forms))?$/, // ssr
		],
		isActive,
		loadInstance,
	);

	app.get(
		/^\/user\/\d{1,8}(\/(info|settings))?$/,
		preloadReduxStore,
		(req, res, next) => {
			const { user } = req.loaded;
			const { reduxStore } = req;
			const entitiesMap = { users: user.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			res.send(ssr.app(reduxStore));
		},
	);

	app.get(
		'/user/:id/forms',
		preloadReduxStore,
		(req, res, next) => {
			const { user } = req.loaded;
			const options = req.query;
			const { reduxStore } = req;
			const entitiesMap = { users: user.toStore() };
			reduxStore.dispatch(entitiesActions.add(entitiesMap));

			user.findForms(options)
				.then((forms) => {
					const action = userActions.fetchFormsSuccess(
						user.id,
						forms.list,
						forms.entities,
					);
					reduxStore.dispatch(action);
				})
				.catch((error) => {
					reduxStore.dispatch(userActions.fetchFormsFailure(user.id, error));
				})
				.then(() => res.send(ssr.app(reduxStore)));
		},
	);

	// get user
	app.get(
		'/api/v1/user/:id',
		(req, res, next) => {
			const { user } = req.loaded;

			Org.findById(user.orgId)
				.then((org) => {
					res.json({
						users: user.toStore(),
						orgs: org.toStore(),
					});
				})
				.catch(next);
		},
	);


	// find forms of specified user
	app.get(
		'/api/v1/user/:id/forms',
		(req, res, next) => {
			const { user } = req.loaded;
			const options = req.query;

			user.findForms(options)
				.then(forms => res.json(forms))
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
