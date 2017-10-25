import * as smtpVerifier from 'email-verify';
import db from '../db/index';
import { HttpError } from '../libs/errors';


const recipients = {
	verifyEmail(email) {
		return new Promise((resolve, reject) => {
			smtpVerifier.verify(email, (err, info) => (
				err ? reject(err) : resolve({ email, exists: info.success })
			));
		});
	},

	checkEmail(req, res, next) {
		this.verifyEmail(req.body.email)
			.then(res.json)
			.catch(next);
	},

	checkForUnregistered(rcp) {
		if(!rcp) return null;
		if(rcp.type !== 'unregistered') {
			throw new HttpError(403, `${rcp.email} is already used`);
		}
		if(rcp.status === 'blocked') {
			throw new HttpError(404, `${rcp.email} not available`);
		}
		return rcp;
	},

	add(req, res, next) {
		const { email } = req.body;
		db.recipients.get(email)
			.then(this.checkForUnregistered)
			.then(rcp => (
				rcp === null || (rcp && rcp.status === 'notAvailable')
					// not stored or stored unregistered and not available
					? this.verifyEmail(email)
					: rcp
			))
			.then(({ id, exists }) => {
				if(id) return { id };
				if(exists) {
					const rcp = { email, type: 'unregistered', status: 'active' };
					return db.recipients.upsert(rcp);
				}
				throw new HttpError(404, `${email} not available`);
			})
			.then(({ id }) => { res.send(id); })
			.catch(next);
	},

};

export default recipients;
