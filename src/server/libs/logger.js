import path from 'path';
import bunyan from 'bunyan';
import rotatingFileStream from 'rotating-file-stream';


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

	err: err => ({
		...err,
		message: err.message,
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
		message: err.message,
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


const stream = rotatingFileStream(
	'info.log',
	{
		path: path.join(__dirname, 'logs'),
		initialRotation: true,
		interval: '1d',
		rotate: 1,
		compress: 'gzip', // compress rotated files
	},
);


if(NODE_ENV === 'production') {
	logger.addStream({
		type: 'stream',
		level: 'info',
		stream,
	});
}


// here are reported blocking errors
// once this event is emitted, the stream will be closed as well
stream.on('error', (err) => { logger.error('Rotation error:', err); });

// no rotated file is open (emitted after each rotation as well)
// filename: useful if immutable option is true
stream.on('open', (filename) => {	logger.info('Open rotated file:', filename); });

// rotation job removed the specified old rotated file
// number == true, the file was removed to not exceed maxFiles
// number == false, the file was removed to not exceed maxSize
stream.on('removed', (filename, number) => {
	logger.info('Rotated file removed:', filename, number);
});

// rotation job started
stream.on('rotation', () => { logger.info('Rotation started'); });

// rotation job completed with success producing given filename
stream.on('rotated', (filename) => { logger.info('File rotated:', filename); });

// here are reported non blocking errors
stream.on('warning', (err) => { logger.warning(err); });


export default logger;
