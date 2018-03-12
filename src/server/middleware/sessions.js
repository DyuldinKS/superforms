import User from '../models/User';
import { HttpError } from '../libs/errors';


const isAuthenticated = (req, res, next) => {
	if(req.loaded.self instanceof User) return next();
	return next(new HttpError(403, 'Not authenticated'));
};


const isNotAuthenticated = (req, res, next) => {
	if(!req.session.user) return next();
	return next(new HttpError(403, 'Already authenticated'));
};


export {
	isAuthenticated,
	isNotAuthenticated,
};
