import path from 'path';
import bunyan from 'bunyan';
import rotatingFileStream from 'rotating-file-stream';


const NODE_ENV = process.env.NODE_ENV;

const excludedBodyProps = ['password'];
const EXCLUDED = '[excluded]';


const excludeProps = (body) => {
	const cleaned = { ...body };
	excludedBodyProps.forEach((prop) => {
		if(cleaned[prop]) cleaned[prop] = EXCLUDED;
	});
	return cleaned;
};


const devSerializers = {
	req: (req) => {
		if(!req || !req.connection) return req;
		let author;
		if(req.author) {
			const { id, orgId, role, active } = req.author;
			author = { id, orgId, role, active };
		} else {
			author = null;
		}
		return {
			url: req.url,
			method: req.method,
			author,
			body: req.body,
			remoteAddress: req.connection.remoteAddress,
		};
	},

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
		return {
			url: req.url,
			method: req.method,
			headers: req.headers,
			author: req.session.user,
			body: excludeProps(req.body),
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
		body: excludeProps(err.body),
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


if(NODE_ENV === 'production') {
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

	stream.on('error', (err) => { logger.error('Rotation error:', err); });
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

	logger.addStream({
		type: 'stream',
		level: 'info',
		stream,
	});
}


export default logger;
