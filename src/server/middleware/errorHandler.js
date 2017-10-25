import { HttpError, PgError } from '../libs/errors';
import logger from '../libs/logger';

function errorHandler(err, req, res, next) {
	let error;
	if(typeof err === 'number') {
		error = new HttpError(err);
	} else if(typeof err === 'object') {
		logger.error(err);
		switch (err.constructor) {
		case HttpError: break;
		case PgError: // fall through
		default: {
			error = new HttpError(500);
		}
		}
	} else {
		logger.log(err);
		error = new HttpError(500);
	}
	const { status, message } = error;
	logger.warn({ status, message });
	res.status(status).send(message);
}

export default errorHandler;
