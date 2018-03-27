import User from '../models/User';
import { HTTPError } from '../errors';


const isAuthenticated = (req, res, next) => {
	if(req.loaded.self instanceof User) return next();
	return next(new HTTPError(403, 'Not authenticated'));
};


const isNotAuthenticated = (req, res, next) => {
	if(!req.session.user) return next();
	return next(new HTTPError(403, 'Already authenticated'));
};


export {
	isAuthenticated,
	isNotAuthenticated,
};
