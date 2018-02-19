import checkStatus from '../middleware/checkStatus';
import loadInstance from '../middleware/loadInstance';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import orgs from './orgs';
import hbs from '../templates/pages';
import Org from '../models/Org';
import { HttpError } from '../libs/errors';
import store from 'Redux/';
import * as routerModule from 'Redux/common/router';
import * as sessionModule from 'Redux/common/session';
import * as entitiesModule from 'Redux/common/entities';
import renderApp from '../templates/renderApp';


const router = (app) => {
	// app.use(/, console.log);
	app.use(
		[
			/\/(api\/v\d+\/)?orgs.*/,
			/\/(api\/v\d+\/)?users.*/,
			/\/(api\/v\d+\/)?recipients.*/,
		],
		checkStatus,
		loadInstance,
	);


	app.get('/', (req, res, next) => {
		const user = req.loaded.self;
		// console.log(req.loaded);
		Org.findById(user.orgId)
			.then((org) => {
				if(!org) {
					throw new HttpError(404, 'Organization of the user is not found');
				}
				const session = { userId: user.id, orgId: org.id };

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

				res.send(renderApp(store));
			})
			.catch(next);
	});


	orgs(app);
	users(app);
	sessions(app);
	recipients(app);

	// app.post('/api/emails/check', recipients.checkEmail);
	// app.post('/api/users/register', users.add);
	// app.get('/admin', sendAdminPage())
	// app.post('/api/orgs/create', orgs.create);
	// app.get('/api/orgs/:id', orgs.getOne)
};

export default router;
