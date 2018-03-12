import User from '../models/User';
import { HttpError } from '../libs/errors';


const deserializeUser = (req, res, next) => {
	req.loaded = {};
	const { user } = req.session;
	if(!user) return next();
	User.findById(user.id)
		.then((self) => {
			req.loaded.self = self;
			return next();
		})
		.catch(next);
};


const isActive = (req, res, next) => {
	const { self } = req.loaded;
	if(self instanceof User === false) {
		return next(new HttpError(403, 'Not authenticated'));
	}
	if(!self.isActive()) {
		return next(new HttpError(403, 'Your account has been locked'));
	}
	return next();
};


export { deserializeUser, isActive };
