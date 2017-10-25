import { req, res, next, promiseLog } from './stubs';
import users from '../../../src/server/routes/users';
import rcps from '../../../src/server/routes/recipients';
import db from '../../../src/server/db';

const email = 'dyuldin_kirill@mail.ru';
req.loaded.self = { id: 1 };

rcps.req = { body: { email } };
rcps.res = {
	send: (id) => {
		console.log('rcp id:', id);
		req.body.user = {
			id,
			email,
			info: { name: 'Кирилл', surname: 'Дюльдин', patronymic: 'Сергеевич' },
			roleId: 2,
		};
		users.add(req, res, next);
	},
};
// rcps.add(rcps.req, rcps.res, next);

promiseLog(db.users.get({ id: 8 }));
// promiseLog(db.users.getLinkForPassChanging({ id: 3 }));
