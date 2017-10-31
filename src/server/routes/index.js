import path from 'path';
import recipients from './recipients';
import users from './users';

const router = (app) => {
	app.get('/test', (req, res, next) => {
		res.sendFile(path.resolve(__dirname, 'public/index.html'));
	});
	app.get('/setpass/:token', users.sendPassSettingPage);
	// app.post('/setpass/:token', users.setPass);

	app.post('/api/emails/check', recipients.checkEmail);
	app.post('/api/users/register', users.add);
	// app.get('/admin', sendAdminPage())
	// app.post('/api/orgs/create', orgs.create);
	// app.get('/api/orgs/:id', orgs.getOne)
};

export default router;
