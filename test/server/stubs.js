const req = {
	body: {},
	loaded: {},
	params: {},
};

const res = {
	send(data) {
		// console.log('res.send:', data);
		return this;
	},

	json(data) {
		// console.log('res.json:', data);
		return this;
	},

	status(st) {
		// console.log('res.status:', st);
		return this;
	},
};

const next = (err) => {
	// console.log('next:', err);
};

const request = {
	req,
	res,
	next,
};

const promiseLog = (promise) => {
	promise.then(res => console.log('res:', res))
		.catch(err => console.log('err:', err));
};

export { request, promiseLog };
