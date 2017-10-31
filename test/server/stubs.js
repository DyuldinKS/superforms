const req = {
	body: {},
	loaded: {},
	params: {},
};

const res = {
	init(done) {
		this.done = done;
	},
	
	send(data) {
		console.log('send:', data);
		this.done(data);
		return this;
	},

	json(data) {
		console.log('json:', data);
		this.done(data);
		return this;
	},

	status(st) {
		console.log('status:', st);
		this.done(data);
		return this;
	},
};

const next = (err) => { console.log('next:', err); };

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
