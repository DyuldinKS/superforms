export default (checkPermissions) => (
	(req, res, next) => {

		const { self, user } = req.loaded;

		checkPermissions(self)
		if(self.can[action].users(user.id))
		const scope = self.role.getScope('users', action, 'full');

		if(!scope) return next(accessError);

		switch (scope) {
		case 'global': return next();
		case 'enclosing': {
			return self.org.findChild(user.orgId)
				.then(found => (found ? next() : next(accessError)))
				.catch(next);
		}
		case 'local': return self.org.id === user.orgId;
		default: return next(accessError);
		}
	}
)