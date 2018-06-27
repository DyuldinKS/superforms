import { isActive } from '../middleware/users';
import loadInstance from '../middleware/loadInstance';
import Recipient from '../models/Recipient';
import { HTTPError, PgError } from '../errors';


export default (app) => {
	/*----------------------------------------------------------------------------
	---------------------------------- API ---------------------------------------
	----------------------------------------------------------------------------*/

	app.post(
		'/api/v1/recipient/verification',
		isActive,
		(req, res, next) => {
			const { email, mode } = req.body;

			if(typeof email !== 'string') {
				return next(new HTTPError(400, 'Invalid email'));
			}

			return Promise.all([
				Recipient.verifyEmail(email),
				Recipient.find({ email }),
			])
				.then(([verification, rcpt]) => {
					const result = { ...verification };

					if(!rcpt) {
						result.available = true;
					} else {
						result.available = (mode === 'signUp')
							? rcpt.isUnregistered() && rcpt.isActive()
							: rcpt.isActive();
					}

					res.send(result);
				})
				.catch(next);
		},
	);


	// create recipient
	app.post(
		'/api/v1/recipient',
		isActive,
		(req, res, next) => {
			const { author } = req;
			const props = req.body;
			const rcpt = new Recipient(props);

			Promise.resolve()
				.then(() => rcpt.check(props))
				.then(() => rcpt.save({ author }))
				.then(() => res.json(rcpt))
				.catch((err) => {
					if(err instanceof PgError) {
						if(err.code === '23505') {
							return next(new HTTPError(403, 'The recipient already exists'));
						}
					}
					return next(err);
				});
		},
	);


	app.use(
		// all api routes with specified recipient id
		/\/api\/v\d{1,2}\/recipient\/\d{1,8}$/,
		isActive,
		loadInstance,
	);


	app.get(
		'/api/v1/recipient/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { rcpt } = req.loaded;
			res.json(rcpt);
		},
	);


	// update recipient
	app.patch(
		'/api/v1/recipient/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { author } = req;
			const { rcpt } = req.loaded;
			const props = req.body;

			Promise.resolve()
				.then(() => rcpt.check(props))
				.then(() => rcpt.update({ props, author }))
				.then(() => res.json(rcpt))
				.catch(next);
		},
	);
};
