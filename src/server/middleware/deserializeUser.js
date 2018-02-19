import User from '../models/User';

export default (req, res, next) => {
	console.log('url:', req.originalUrl);
	req.loaded = {};
	const { user } = req.session;
	if(!user) return next();
	User.findById(user.id)
		.then((user) => {
			console.log('self:', user);
			req.loaded.self = user;
			return next();
		})
		.catch(next);
};
