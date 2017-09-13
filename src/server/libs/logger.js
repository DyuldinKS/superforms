import winston from 'winston';
import path from 'path';

const logger = new (winston.Logger)({
	levels: {
		'info': 2,
		'warn': 1,
		'error': 0
	},
	colors: { 
		'info': 'green',
		'warn': 'yellow',
		'error': 'red' 
	},
	transports: [
		new (winston.transports.Console)({
			level:'info', 
			colorize: true, 
		}),
	]
});

if(process.env.NODE_ENV === 'production') {
	logger.transports.push(
		new (require('winston-daily-rotate-file'))({
			level: 'info', 
			filename: path.join('logs', 'errors.log'), 
			datePattern: 'yy-MM-dd' 
		})
	)
}

export default logger;