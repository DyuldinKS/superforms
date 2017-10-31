import bcrypt from 'bcrypt';
import config from '../config';
import db from '../db/index';
import mailer from '../libs/mailer';
import { HttpError, SmtpError } from '../libs/errors';
import hbs from '../templates/pages';
import emailTemplates from '../templates/mail';

const users = {
	sendRegistrationMail({ email, info, token }) {
		const { name, patronymic } = info;
		return mailer.send(emailTemplates.registration({
			email,
			name: `${name} ${patronymic || ''}`,
			link: config.domain,
			passSettingLing: `${config.domain}setpass/${token}`,
		}));
	},

	add(req, res, next) {
		const { user } = req.body;
		const { self } = req.loaded;
		db.users.add(user, self)
			.then(() => db.users.genPassSettingToken(user))
			.then((token) => {
				user.token = token;
				return db.users.setToken(user);
			})
			.then(() => this.sendRegistrationMail(user))
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

	sendPassSettingPage(req, res, next) {
		const { token } = req.params;
		db.users.getByToken(token)
			.then((userToken) => {
				if(userToken) {
					res.send(hbs.passSettingPage({ name: token }));
				}
				throw new HttpError(404);
			})
			.catch(next);
	},

	setPass(req, res, next) {
		const { token } = req.params;
		const { pass } = req.body;
		Promise.all([
			db.users.getByToken(token),
			bcrypt.hash(pass, config.bcrypt.saltRound),
		])
			.then(([userTokenPair, hash]) => {
				if(!userTokenPair) throw new HttpError(404);
				const user = { id: userTokenPair.userId };
				return db.users.set(user, { hash });
			})
			.then(() => db.users.deleteToken(token))
			.then(() => res.status(200).send())
			.catch(next);
	},
};

export default users;
