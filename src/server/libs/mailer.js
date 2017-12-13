import nodemailer from 'nodemailer';
import config from '../config';
import hbs from '../templates/mail';

const { domain, nodemailer: { smtp } } = config;

const send = (message) => {
	console.log(message);
	// const transporter = nodemailer.createTransport(smtp);
	// const { from } = config.nodemailer;
	// return transporter.sendMail({ ...message, from });
};

const sendAll = (messages) => {
	const pool = nodemailer.createTransport({ ...smtp, pool: true });
	messages.reverse();
	return new Promise((resolve, reject) => {
		let response;
		const responsesAsPromises = [];
		pool.on('idle', () => {
			if(!pool.isIdle()) {
				reject(new Error('broken SMTP-pool'));
				pool.close();
			}
			// send next message from the pending queue
			while (pool.isIdle() && messages.length) {
				// console.log('shift:', i, moment());
				response = pool.sendMail(messages.pop()).catch(err => err);
				responsesAsPromises.push(response);
			}
			if(messages.length === 0) {
				resolve(Promise.all(responsesAsPromises).then((rsps) => {
					pool.close();
					return rsps;
				}));
			}
		});
	});
};

const getNameString = ({ name, patronymic }) => {
	if(name) {
		return patronymic ? `${name} ${patronymic}` : `${name}`;
	}
	return '';
};

const sendRegistration = ({ email, info, token }) => (
	send({
		to: email,
		subject: 'Регистрация в ИС «Генератор Форм»',
		html: hbs.registration({
			name: getNameString(info),
			mainLink: domain,
			passSettingLing: `${domain}/password/${token}`,
		}),
	})
);

const sendPasswordReсovery = ({ email, info, token }) => (
	send({
		to: email,
		subject: 'Смена пароля в ИС «Генератор Форм»',
		html: hbs.passwordReсovery({
			name: getNameString(info),
			mainLink: domain,
			passSettingLing: `${domain}/password/${token}`,
		}),
	})
);

export default {
	send,
	sendAll,
	sendRegistration,
	sendPasswordReсovery,
};
