import User from '../models/User';
import { HTTPError } from '../errors';


const isAuthenticated = (req, res, next) => {
	if(req.author instanceof User) return next();
	return next(new HTTPError(403, 'Not authenticated'));
};


const isNotAuthenticated = (req, res, next) => {
	if(!req.author) return next();
	return next(new HTTPError(403, 'Already authenticated'));
};


export {
	isAuthenticated,
	isNotAuthenticated,
};
