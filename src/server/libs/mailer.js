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


const sendRegistrationTo = (user) => {
	const { email, token } = user;

	return send({
		to: email,
		subject: 'Регистрация в ИС «РАСККО»',
		html: hbs.registration({
			name: user.getDisplayName(),
			mainLink: domain,
			passSettingLink: `${domain}/password/${token}`,
		}),
	});
};


const sendPassReсovery = (user) => {
	const { email, token } = user;

	return send({
		to: email,
		subject: 'Смена пароля в ИС «РАСККО»',
		html: hbs.passwordReсovery({
			name: user.getDisplayName(),
			mainLink: domain,
			passSettingLink: `${domain}/password/${token}`,
		}),
	});
};


export default {
	send,
	sendAll,
	sendRegistrationTo,
	sendPassReсovery,
};
