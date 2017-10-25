import db from '../db/index.js';


const orgs = {

	create(req, res, next) {
		// need to check email

		// create receiver. If exists - get its id
		db.receivers.createIfNotExists(req.data)
			// create organization
			.then((receiver) => {
				req.data.receiver = receiver;
				return db.organizations.create(req.data, req.body);
			})
			// create links if chief organization is specified
			.then((org) => {
				req.data.org = org;
				return req.chiefOrgId
					? db.organizations.createLink({ from: org.id, to: req.chiefOrgId })
					: null;
			})
			.then(() => res.send(req.data.org))
			.catch(next);
	},

	read(req, res, next) {

	},

	update(req, res, next) {
		/*
		parse data
		*/
		const updatedFields = {};
		const searchParams = {};
		db.update(req.data, req.params, req.body);
	},

};


export default orgs;
