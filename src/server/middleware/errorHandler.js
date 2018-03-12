import { HttpError, PgError } from '../libs/errors';
import hbs from '../templates/pages';


function errorHandler(err, req, res, next) {
	let httpError;

	switch (err.constructor) {
	case HttpError: {
		httpError = err;
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


	if(req.get('x-requested-with') === 'XMLHttpRequest') {
		res.status(status).send(message);
	} else {
		if(status === '403') {
			if(message === 'Unathrorized') {
				res.redirect('/signin');
				return;
			}
			if(message === 'Already authorized') {
				res.redirect('/');
				return;
			}
		}
		res.send(hbs.errorPage({ status, message }));
	}

	req.log.error({ res, err });
}

export default errorHandler;
