import User from '../models/User';
import Org from '../models/Org';
import { HTTPError } from '../errors';


const deserializeUser = (req, res, next) => {
	const { user } = req.session;
	if(!user) return next();

	return User.findById(user.id)
		.then((found) => {
			req.author = found;
		})
		.then(() => Org.findById(req.author.orgId))
		.then((found) => {
			req.author.org = found;
			next();
		})
		.catch(next);
};


const isActive = (req, res, next) => {
	const { author } = req;
	if(author instanceof User === false) {
		return next(new HTTPError(403, 'Not authenticated'));
	}

	if(!author.isActive()) {
		return next(new HTTPError(403, 'Your account has been locked'));
	}

	if(!author.orgId) {
		return next(new HTTPError(500, 'orgId is not specified'));
	}

	if(!author.org.isActive()) {
		return next(new HTTPError(403, 'Your organization has been locked'));
	}

	return next();
};


export { deserializeUser, isActive };
