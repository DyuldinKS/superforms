import db from '../db/index.js';
import * as smtpEmailVerifier from 'email-verify';


const recipients = {

	checkEmail(req, res, end) {
		const email = req.body.email;
		smtpEmailVerifier.verify(email, (err, info) => {
			if(err) {
				return next(err);
			} else {
				res.json({ email, isExists: info.success })
			}
		})
	}

}

export default recipients;
