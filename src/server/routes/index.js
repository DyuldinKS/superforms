import loadModels from '../middleware/loadModels';
import sessions from './sessions';
import recipients from './recipients';
import users from './users';
import hbs from '../templates/pages';

const router = (app) => {
	app.get('/', (req, res, next) => {
		res.send(hbs.mainPage());
	});

	sessions(app);
	recipients(app);
	users(app);

	// app.post('/api/emails/check', recipients.checkEmail);
	// app.post('/api/users/register', users.add);
	// app.get('/admin', sendAdminPage())
	// app.post('/api/orgs/create', orgs.create);
	// app.get('/api/orgs/:id', orgs.getOne)
};

export default router;
