import * as smtpVerifier from 'email-verify';
import db from '../db/index';
import { HttpError } from '../libs/errors';


const recipients = {
	verify(email) {
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
		let stored;
		db.recipients.get(email)
			.then((rcp) => {
				if(rcp) {
					stored = rcp;
					if(rcp.type !== 'unregistered') {
						throw new HttpError(403, `${rcp.email} is already used`);
					}
					if(rcp.status === 'blocked') {
						throw new HttpError(404, `${rcp.email} not available`);
					}
				}
			})
			.then(() => this.verify(email))
			.then((verified) => {
				if(verified) {
					if(stored) {
						// check status
						db.recipients.set({ ...stored, status: 'active' });
					} else {
						const rcp = { email, type: 'unregistered', status: 'active' };
						db.recipients.add(rcp);
					}
				} else {
					if(stored) {
						db.recipients.set({ ...stored, status: 'not available' });
					}
					throw new HttpError(404, `${email} not available`);
				}
			})
			.then(({ id }) => { res.send(id); })
			.catch(next);
	},

};

export default recipients;
