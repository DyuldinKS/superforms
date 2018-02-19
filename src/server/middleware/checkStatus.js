import { HttpError } from '../libs/errors';

export default (req, res, next) => {
	const { self } = req.loaded;
	if(!self || !self.active) {
		return next(new HttpError(403, 'No access'));
	}
	// if(self.status === 'waiting' || self.status === 'notAvailable') {
	// 	return next(new HttpError(403, 'You have to confirm your email address.'));
	// }
	return next();
};
