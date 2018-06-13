import { isActive } from '../middleware/users';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import orgs from './orgs';
import forms from './forms';
import responses from './responses';
import Org from '../models/Org';
import { HTTPError } from '../errors';
import createStore from '../../client/apps/app/boot/createStore';
import { actions as routerActions } from '../../client/shared/router/redux';
import { actions as sessionActions } from '../../client/apps/app/shared/redux/session';
import ssr from '../templates/ssr';


const router = (app) => {
	app.get(
		'/',
		isActive,
		(req, res, next) => {
			const user = req.author;
			const store = createStore();

			store.dispatch(routerActions.init(req.url));
			store.dispatch(sessionActions.init(
				`${user.id}`,
				`${user.org.id}`,
				user.toStore(),
				user.org.toStore(),
			));

			res.send(ssr.app(store));
		},
	);

	// ordered by the probable frequency of requests
	forms(app);
	responses(app);
	recipients(app);
	users(app);
	orgs(app);
	sessions(app);
};

export default router;
