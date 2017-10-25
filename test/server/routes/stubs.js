const req = {
	body: {},
	loaded: {},
	params: {},
};

const res = {
	send(data) {
		console.log('send:', data);
		return this;
	},

	json(data) {
		console.log('json:', data);
		return this;
	},

	status(st) {
		console.log('status:', st);
		return this;
	},
};

const promiseLog = (promise) => {
	promise.then(res => console.log('res:', res))
		.catch(err => console.log('err:', err));
};

const next = (err) => { console.log('next:', err); };

export { req, res, next, promiseLog };
