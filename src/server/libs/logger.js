import path from 'path';
import bunyan from 'bunyan';


const NODE_ENV = process.env.NODE_ENV;

const reqSerializer = {
	dev: req => (
		req && req.connection
			? {
				url: req.url,
				method: req.method,
				body: req.body,
				remoteAddress: req.connection.remoteAddress,
			}
			: req
	),

	prod: (req) => {
		if(!req || !req.connection) return req;
		const censored = { ...req.body };
		if('password' in req.body) {
			censored.password = 'censored';
		}
		return {
			url: req.url,
			method: req.method,
			headers: req.headers,
			body: censored,
			remoteAddress: req.connection.remoteAddress,
			remotePort: req.connection.remotePort,
		};
	},
};


const resSerializer = {
	dev: res => (
		res
			? { statusCode: res.statusCode }
			: res
	),

	prod: res => (
		res
			? {
				statusCode: res.statusCode,
				header: res._header,
			}
			: res
	),
};


const errSerializer = {
	dev: (err) => {
		const { name } = Object.getPrototypeOf(err);
		return {
			...err,
			name,
			stack: err.stack,
		};
	},

	prod: (err) => {
		const { name } = Object.getPrototypeOf(err);
		return { ...err, name };
	},

};


const mode = NODE_ENV === 'production' ? 'prod' : 'dev';

const logger = bunyan.createLogger({
	name: 'sf2',
	streams: [
		{
			level: 'debug',
			stream: process.stdout,
		},
	],
	serializers: {
		req: reqSerializer[mode],
		res: resSerializer[mode],
		err: errSerializer[mode],
	},
});


if(NODE_ENV === 'production') {
	logger.addStream({
		type: 'rotating-file',
		level: 'info',
		path: path.join(__dirname, 'logs/info.log'),
		period: '1d',
		count: 10,
	});
}


export default logger;
