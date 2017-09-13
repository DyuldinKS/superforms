import path from 'path';
import receivers from './receivers';
import orgs from './organizations';
import users from './users';
import { send } from '../libs/mailer';

const router = app => {

	app.get('/', (req, res, next) => {
		res.send( path.resolve(__dirname, 'public/index.html') );
	})

	app.post('/api/emails/check', receivers.checkEmail);
	app.post('/api/users/register', users.create);
	// app.get('/admin', sendAdminPage())
	app.post('/api/orgs/create', orgs.create)
	// app.get('/api/orgs/:id', orgs.getOne)

}

export default router;