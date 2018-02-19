import winston from 'winston';


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

// if(process.env.NODE_ENV === 'production') {
// 	logger.transports.push(
// 		new (require('winston-daily-rotate-file'))({
// 			level: 'info', 
// 			filename: path.join('logs', 'errors.log'), 
// 			datePattern: 'yy-MM-dd' 
// 		})
// 	)
// }
