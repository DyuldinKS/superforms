import { HttpError, PgError } from '../libs/errors';
import hbs from '../templates/pages';
import logger from '../libs/logger';


function errorHandler(err, req, res, next) {
	let httpError;
	// console.log(err);
	logger.error(err);

	switch (err.constructor) {
	case HttpError: {
		httpError = err;
		break;
	}
	case Number: {
		httpError = new HttpError(err);
		break;
	}
	case PgError: {
		httpError = err.toHttpError();
		break;
	}
	default: {
		httpError = new HttpError(500);
	}
	}

	const { status, message } = httpError;
	logger.warn({ status, message });

	if(req.url.includes('api')) {
		res.status(status).send(message);
	} else {
		res.send(hbs.errorPage({ status, message }));
	}
}

export default errorHandler;
