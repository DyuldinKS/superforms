import bcrypt from 'bcrypt';
import config from '../config';
import db from '../db/index';
import { send } from '../libs/mailer';
import { HttpError, SmtpError } from '../libs/errors';

const users = {
	sendRegistrationMail({ email, info, token }) {
		const { name, patronymic } = info;
		const link = `${config.domain}setpass/${token}`;
		return send({
			to: email, // list of receivers
			subject: 'Регистрация в ИС «Генератор Форм»', // Subject line
			html: `Здравствуйте${name ? `, ${name} ${patronymic || ''}` : ''}!<br>
				Для Вас была создана учетная запись в информационной системе
					<a href="${config.domain}">«Генератор Форм».</a><br>
				В качестве логина для входа в систему используется
				текущий адрес электронной почты.<br>
				Для создания пароля проследуйте по следующей ссылке:<br>
				<a href="${link}">${link}</a>`,
		});
	},

	add(req, res, next) {
		const { user } = req.body;
		const { self } = req.loaded;
		db.users.add({ user, self })
			.then(() => db.users.getPassSettingToken(user))
			.then(({ token }) => {
				user.token = token;
				this.sendRegistrationMail(user);
			})
			.then(() => { res.status(200).send(); })
			.catch((err) => {
				if(err instanceof SmtpError) {
					return next(new HttpError(202, 'SMTP-server not available'));
				}
				return next(err.code === '23502' // is it not null violation?
					? new HttpError(400, 'invalid user inserting')
					: err);
			});
	},

	setPass(req, res, next) {
		const { token } = req.params;
		const { pass } = req.body;
		Promise.all([
			db.users.getByToken(token),
			bcrypt.hash(pass, config.bcrypt.saltRound),
		])
			.then(([userToken, hash]) => {
				if(!userToken) throw new HttpError(404);
				const user = { id: userToken.user_id };
				return db.users.set(user, { hash });
			})
			.then(() => db.users.deleteToken(token))
			.then(() => res.status(200).send())
			.catch(next);
	},
};

export default users;
