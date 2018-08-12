import nodemailer from 'nodemailer';
import hbs from '../templates/mail';
import { SMTPError } from '../errors';

const {
	HOST,
	PORT,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
} = process.env;
const APP_URL = `${HOST}:${PORT}`;
const SYSTEM_NAME = 'РАССИ';
const SIGN = `${SYSTEM_NAME} <${SMTP_USER}>`;

const smtpConnectionConfig = {
	host: SMTP_HOST,
	port: SMTP_PORT,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
	secure: true,
	tls: { rejectUnauthorized: false },
};

const send = (message) => {
	const transporter = nodemailer.createTransport(smtpConnectionConfig);
	return transporter.sendMail({ ...message, from: SIGN })
		.catch((err) => { throw new SMTPError(err); });
};


const sendAll = (messages) => {
	const pool = nodemailer.createTransport({
		...smtpConnectionConfig,
		pool: true,
	});
	const msgStack = [...messages.map(msg => ({ ...msg, form: SIGN }))].reverse();
	return new Promise((resolve, reject) => {
		let response;
		const responsesAsPromises = [];
		pool.on('idle', () => {
			if(!pool.isIdle()) {
				reject(new SMTPError('broken SMTP-pool'));
				pool.close();
			}
			// send next message from the pending queue
			while (pool.isIdle() && msgStack.length) {
				response = pool.sendMail(msgStack.pop()).catch(err => err);
				responsesAsPromises.push(response);
			}
			if(msgStack.length === 0) {
				resolve(Promise.all(responsesAsPromises).then((rsps) => {
					pool.close();
					return rsps;
				}));
			}
		});
	});
};


const sendRegistrationEmail = (user) => {
	const { email, password } = user;

	return send({
		to: email,
		subject: `Регистрация в ИС «${SYSTEM_NAME}»`,
		html: hbs.registration({
			password,
			login: email,
			name: user.getDisplayName(),
			mainURL: APP_URL,
		}),
	});
};


const sendPasswordRestoreEmail = (user) => {
	const { email, token } = user;

	return send({
		to: email,
		subject: `Восстановление пароля в ИС «${SYSTEM_NAME}»`,
		html: hbs.passwordRestore({
			login: email,
			name: user.getDisplayName(),
			mainURL: APP_URL,
			resetLink: `${APP_URL}/user/password?token=${token}`,
		}),
	});
};


const sendPasswordResetEmail = (user) => {
	const { email, password } = user;

	return send({
		to: email,
		subject: `Сброс пароля в ИС «${SYSTEM_NAME}»`,
		html: hbs.passwordReset({
			password,
			login: email,
			name: user.getDisplayName(),
			mainURL: APP_URL,
		}),
	});
};


export default {
	send,
	sendAll,
	sendRegistrationEmail,
	sendPasswordResetEmail,
	sendPasswordRestoreEmail,
};
