import { HTTPError, PgError, SMTPError } from '../errors';
import hbs from '../templates/pages';


function errorHandler(err, req, res, next) {
	let httpError;

	switch (err.constructor) {
	case HTTPError: {
		httpError = err;
		break;
	}
	case SMTPError: // fall through
	case PgError: {
		httpError = err.toHTTPError();
		break;
	}
	case SyntaxError: {
		if(err.body) httpError = new HTTPError(400, err.message);
		break;
	}
	default: {
		httpError = new HTTPError(500);
	}
	}

	const { status, message } = httpError;


	if(req.get('x-requested-with') === 'XMLHttpRequest') {
		res.status(status).send(message);
		req.log.error({ res, err }); // log response and original error
	} else {
		// do not log redirection
		if(status === 403) {
			if(message === 'Not authenticated') {
				res.redirect('/signin');
				return;
			}
			if(message === 'Already authenticated') {
				res.redirect('/');
				return;
			}
		}
		res.send(hbs.errorPage({ status, message }));
		req.log.error({ err }); // log only original error
	}
}

export default errorHandler;
