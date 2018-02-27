import path from 'path';
import bunyan from 'bunyan';


const NODE_ENV = process.env.NODE_ENV;

const devSerializers = {
	req: req => (
		req && req.connection
			? {
				url: req.url,
				method: req.method,
				body: req.body,
				remoteAddress: req.connection.remoteAddress,
			}
			: req
	),

	res: res => (
		res
			? { statusCode: res.statusCode }
			: res
	),

	err: (err) => ({
		...err,
		name: Object.getPrototypeOf(err).name,
		stack: err.stack,
	}),
};


const prodSerializers = {
	req: (req) => {
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

	res: res => (
		res
			? {
				statusCode: res.statusCode,
				header: res._header,
			}
			: res
	),

	err: err => ({
		...err,
		name: Object.getPrototypeOf(err).name,
	}),
};


const logger = bunyan.createLogger({
	name: 'sf2',
	streams: [
		{
			level: 'debug',
			stream: process.stdout,
		},
	],
	serializers: NODE_ENV === 'production'
		? prodSerializers
		: devSerializers,
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
