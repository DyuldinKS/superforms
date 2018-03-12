import { isAuthenticated } from '../middleware/sessions';
import Recipient from '../models/Recipient';
import { HttpError, PgError } from '../libs/errors';


export default (app) => {
	app.post(
		'/api/v1/recipient/verification',
		(req, res, next) => {
			const { email, mode } = req.body;

			if(typeof email !== 'string') {
				return next(new HttpError(400, 'Invalid email'));
			}

			Promise.all([
				Recipient.verifyEmail(email),
				Recipient.find({ email }),
			])
				.then(([verification, rcpt]) => {
					const result = { ...verification };
					result.available = (mode === 'signUp')
						? rcpt === null || (rcpt && rcpt.isUnregistered() && rcpt.isActive())
						: rcpt === null || (rcpt && rcpt.isActive());
					res.send(result);
				})
				.catch((err) => {
					next(err);
				});
		},
	);


	app.post(
		'/api/v1/recipient/search',
		(req, res, next) => {
			let promiseToFind;
			if(Array.isArray(req.body)) {
				const emails = req.body;
				promiseToFind = Recipient.findAll(emails);
			} else {
				const { email } = req.body;
				promiseToFind = Recipient.find({ email });
			}
			promiseToFind
				.then((result) => {
					if(!result) throw new HttpError(404);
					res.json(result);
				})
				.catch(next);
		},
	);


	app.get(
		'/api/v1/recipient/:id',
		(req, res, next) => {
			const { rcpt } = req.loaded;
			res.json(rcpt);
		},
	);


	app.post(
		'/api/v1/recipients',
		(req, res, next) => {
			const { self } = req.loaded;
			const { email } = req.body;
			const rcpt = new Recipient({ email });

			rcpt.save(self.id)
				.then(() => res.json(rcpt))
				.catch((err) => {
					if(err instanceof PgError) {
						if(err.code === '23502') {
							return next(new HttpError(400, 'Invalid email address'));
						}
						if(err.code === '23505') {
							return next(new HttpError(403, 'The recipient already exists'));
						}
					}
					return next(err);
				});
		},
	);

	// update recipients
	app.patch(
		'/api/v1/recipient/:id',
		(req, res, next) => {
			const { rcpt, self } = req.loaded;
			const params = req.body;

			rcpt.update(params, self.id)
				.then(() => res.json(rcpt))
				.catch(next);
		},
	);
};
