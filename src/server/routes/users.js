import db from '../db/index.js';

const users = {

	create(req, res, next) {
		// create receiver. If exists - get its id
		db.receivers.createIfNotExists(req.data)
			.then()
			.then(receiver => {
				req.data.receiver = receiver;
				return db.users.create(req.body);
			})
	}

}

export default users;