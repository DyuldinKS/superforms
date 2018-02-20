import path from 'path';
import bunyan from 'bunyan';


function reqSerializer(req) {
	if(!req || !req.connection) return req;
	const censored = { ...req.body };
	if('password' in req.body) {
		censored.password = 'censored';
	}
	return {
		method: req.method,
		url: req.url,
		body: censored,
		headers: req.headers,
		remoteAddress: req.connection.remoteAddress,
		remotePort: req.connection.remotePort,
	};
}


function errSerializer(err) {
	const { name } = Object.getPrototypeOf(err);
	return { ...err, name };
}


const logger = bunyan.createLogger({
	name: 'sf2',
	streams: [
		{
			level: 'debug',
			stream: process.stdout,
		},
	],
	serializers: {
		req: reqSerializer,
		res: bunyan.stdSerializers.res,
		err: errSerializer,
	},
});


if(process.env.NODE_ENV === 'production') {
	logger.addStream({
		type: 'rotating-file',
		level: 'info',
		path: path.join(__dirname, 'logs/webapi.log'),
		period: '1d',
		count: 10,
	});
}


export default logger;
