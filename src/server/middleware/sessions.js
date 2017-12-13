import User from '../models/User';
import { HttpError } from '../libs/errors';


const isAuthenticated = (req, res, next) => {
	if(req.loaded.self instanceof User) return next();
	return req.url.includes('api')
		? next(new HttpError(403, 'Unauthorized'))
		: res.redirect('/signin');
};


const isNotAuthenticated = (req, res, next) => {
	if(!req.session.user) return next();
	return req.url.includes('api')
		? next(new HttpError(403, 'Already authenticated'))
		: res.redirect('/');
};


export {
	isAuthenticated,
	isNotAuthenticated,
};
