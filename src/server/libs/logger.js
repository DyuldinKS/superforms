import winston from 'winston';
// import path from 'path';

export default new (winston.Logger)({
	levels: {
		info: 2,
		warn: 1,
		error: 0,
	},
	colors: {
		info: 'green',
		warn: 'yellow',
		error: 'red',
	},
	transports: [
		new (winston.transports.Console)({
			level: 'info',
			colorize: true,
			prettyPrint: JSON.stringify,
		}),
	],
});
