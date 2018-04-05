import { isActive } from '../middleware/users';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import orgs from './orgs';
import forms from './forms';
import Org from '../models/Org';
import { HTTPError } from '../errors';
import store from '../../client/apps/app/boot/store';
import * as routerModule from '../../client/shared/router/redux';
import * as sessionModule from '../../client/apps/app/shared/redux/session';
import * as entitiesModule from '../../client/shared/entities';
import ssr from '../templates/ssr';


const router = (app) => {
	app.get(
		'/',
		isActive,
		(req, res, next) => {
			const user = req.author;

			const session = {
				userId: `${user.id}`,
				orgId: `${user.org.id}`,
			};

			store.dispatch(routerModule.actions.init(req.url, req.query));
			store.dispatch(sessionModule.actions.init(session));
			store.dispatch(entitiesModule.actions.add({
				users: user.toStore,
				orgs: user.org.toStore,
			}));

			res.send(ssr.app(store));
		},
	);

	forms(app);
	recipients(app);
	users(app);
	orgs(app);
	sessions(app);
};

export default router;
