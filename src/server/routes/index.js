import { isActive } from '../middleware/users';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import orgs from './orgs';
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
			// console.log(req.loaded);
			Org.findById(user.orgId)
				.then((org) => {
					if(!org) {
						throw new HTTPError(404, 'Organization of the user is not found');
					}
					const session = { userId: String(user.id), orgId: String(org.id) };

					store.dispatch(routerModule.actions.init(req.url, req.query));
					store.dispatch(sessionModule.actions.init(session));
					store.dispatch(entitiesModule.actions.add({
						users: {
							[user.id]: {
								...user,
								...user.info,
							},
						},
						orgs: {
							[org.id]: org,
						},
					}));

					res.send(ssr.app(store));
				})
				.catch(next);
		},
	);


	users(app);
	orgs(app);
	sessions(app);
	recipients(app);
};

export default router;
