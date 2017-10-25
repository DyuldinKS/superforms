import moment from 'moment';

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

const transporter = {
	sendMail(message) {
		return new Promise((resolve, reject) => {
			this.pool.connections += 1;
			setTimeout(
				() => {
					this.pool.connections -= 1;
					console.log('connections:', this.pool.connections);
					this.onEmptyConnection();
					getRandomInt(0, 50) === 37 // it's error time
						? reject(new Error('invalid email address'))
						: resolve(message);
				},
				getRandomInt(0, 1000)
			);
		});
	},

	on(mode, cb) {
		this.onEmptyConnection = () => { cb(); };
		if(this.isIdle) {
			this.onEmptyConnection();
		}
	},

	isIdle() {
		return this.pool.connections < this.pool.size;
	},

	pool: {
		size: 5,
		connections: 0,
	},
};

const sendAll = (messages) => {
	messages.reverse();
	return new Promise((resolve, reject) => {
		let response;
		const responses = [];
		transporter.on('idle', () => {
			// send next message from the pending queue
			if(!transporter.isIdle()) reject(new Error('broken SMTP-pool'));
			while (transporter.isIdle() && messages.length) {
				// console.log('shift:', i, moment());
				response = transporter.sendMail(messages.pop()).catch(err => err);
				responses.push(response);
			}
			if(messages.length === 0) resolve(Promise.all(responses));
		});
	});
};

const str = 'If pooling is used then Nodemailer keeps a fixed amount of connections open and sends the next message once a connection becomes available. It is mostly useful when you have a large number of messages that you want';
const messages = str.split(' ').map((e, i) => ({ id: i }));

// console.log(moment());
// sendAll(messages)
// 	.then((responses) => {
// 		console.log(responses);
// 	})
// 	.catch(err => console.log('ERROR!:', err));
