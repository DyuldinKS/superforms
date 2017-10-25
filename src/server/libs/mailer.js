import nodemailer from 'nodemailer';
import config from '../config';


const send = (message) => {
	const transporter = nodemailer.createTransport(config.nodemailer.smtp);
	const { from } = config.nodemailer;
	return transporter.sendMail({ ...message, from });
};

const sendAll = (messages) => {
	const pool = nodemailer.createTransport({ ...config.nodemailer.smtp, pool: true });
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

export {
	send,
	sendAll,
};
