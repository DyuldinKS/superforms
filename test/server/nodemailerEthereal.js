// Use at least Nodemailer v4.1.0
import moment from 'moment';
import nodemailer from 'nodemailer';

function transportConstructor(account) {
	return () => (
		nodemailer.createTransport({
			host: account.smtp.host,
			port: account.smtp.port,
			secure: account.smtp.secure,
			auth: {
				user: account.user,
				pass: account.pass,
			},
			pool: true,
			maxConnections: 5,
		})
	);
}

// Generate SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {
	if(err) {
		console.error(`Failed to create a testing account. ${err.message}`);
		return process.exit(1);
	}
	console.log(account);

	console.log('Credentials obtained, sending message...');


	const createTransport = transportConstructor(account);
	const sendAll = (messages) => {
		const transporter = createTransport();
		messages.reverse();
		return new Promise((resolve, reject) => {
			let response;
			const responses = [];
			transporter.on('idle', () => {
				if(!transporter.isIdle()) {
					reject(new Error('broken SMTP-pool'));
					transporter.close();
				}
				// send next message from the pending queue
				while (transporter.isIdle() && messages.length) {
					// console.log('shift:', i, moment());
					response = transporter.sendMail(messages.pop()).catch(err => err);
					responses.push(response);
				}
				if(messages.length === 0) {
					resolve(Promise.all(responses).then((rsps) => {
						transporter.close();
						return rsps;
					}));
				}
			});
		});
	};

	const send = (messages) => {
		const startSending = moment();
		sendAll(messages)
			.then((responses) => {
				console.log('time:', moment().diff(startSending));
				responses.forEach(r => console.log(r.accepted));
				// console.log(responses);
			})
			.catch(err => console.log('ERROR!:', err));
	};

	// Message object
	const message = {
		from: 'Sender Name <sender@example.com>',
		to: 'somebody@mail.com',
		subject: 'Nodemailer is unicode friendly ✔',
		text: 'Hello to myself!',
	};
	const messages = Array.from(Array(400)).map((e, i) => ({ ...message, id: i, to: `test${i}@mail.ru` }));
	const lot1 = messages.slice(0, 237);
	const lot2 = messages.slice(237);

	send(lot1);
	send(lot2);
	// console.log(messages);
	// mailingQueue.push(lot1);
	// transporter.emit('idle');
	// mailingQueue.push(lot2);
	// transporter.emit('idle');

	// transporter.sendMail(message)
	// 	.then((info) => {
	// 		console.log(info)
	// 		// console.log('Message sent: %s', info.messageId);
	// 		// Preview only available when sending through an Ethereal account
	// 		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	// 	})
	// 	.catch((err) => {
	// 		console.log('Error occurred. ' + err.message);
	// 		return process.exit(1);
	// 	});
});
