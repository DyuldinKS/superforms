import { isActive } from '../middleware/users';
import preloadReduxStore from '../middleware/preloadReduxStore';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import orgs from './orgs';
import forms from './forms';
import responses from './responses';
import Org from '../models/Org';
import { HTTPError } from '../errors';
import ssr from '../templates/ssr';


const router = (app) => {
	app.get(
		'/',
		isActive,
		preloadReduxStore,
		(req, res, next) => {
			res.send(ssr.app(req.reduxStore));
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
