import User from '../models/User';
import { HTTPError } from '../errors';


const deserializeUser = (req, res, next) => {
	const { user } = req.session;
	if(!user) return next();

	return User.findById(user.id)
		.then((found) => {
			req.author = found;
			return next();
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

	return author.loadOrg()
		.then((org) => {
			if(!org.isActive()) {
				throw new HTTPError(403, 'Your organization has been locked');
			}
			return next();
		})
		.catch(next);
};


export { deserializeUser, isActive };
