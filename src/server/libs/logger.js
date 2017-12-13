import path from 'path';
import { createLogger, transports, format } from 'winston';
const { combine, prettyPrint, colorize } = format;


const logger = createLogger({
	format: combine(
		colorize(),
		prettyPrint(),
		format.printf((info) => {
			const { level, message, ...args } = info;

			return `[${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
		}),
	),
	transports: [
		new transports.Console()
		// new transports.File({
		// 	filename: path.join(__dirname, 'errors.log'),
		// 	level: 'error',
		// }),
		// new transports.File({
		// 	filename: path.join(__dirname, 'logs/combined.log'),
		// }),
	],
});


// if(process.env.NODE_ENV === 'production') {
// 	logger.add(new transports.Console());
// }


export default logger;
