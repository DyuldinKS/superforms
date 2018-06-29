import { isActive } from '../middleware/users';
import {
	loadParams,
	createInstance,
	loadInstance,
	loadDependincies,
} from '../middleware/instances';
import Recipient from '../models/Recipient';
import { HTTPError, PgError } from '../errors';


export default (app) => {
	app.post(
		'/api/v1/recipient/verification',
		isActive,
		(req, res, next) => {
			const { email, mode } = req.body;

			if(typeof email !== 'string') {
				return next(new HTTPError(400, 'Invalid email'));
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
		isActive,
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
					if(!result) throw new HTTPError(404);
					res.json(result);
				})
				.catch(next);
		},
	);


	app.use(
		[
			/\/api\/v\d{1,2}\/(recipient)\/(\d{1,8})$/, // api
			/\/(recipient)\/(\d{1,8})$/, // ssr
		],
		isActive,
		loadParams, // high cohesion with the regexps above
		loadInstance,
		loadDependincies,
	);


	app.get(
		'/api/v1/recipient/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const rcpt = req.loaded.instance;
			res.json(rcpt);
		},
	);


	app.post(
		/^\/api\/v\d{1,2}\/(recipient)$/, // must be a regexp to set type of new instance
		isActive,
		loadParams, // high cohesion with the regexp above
		createInstance,
		loadDependincies,
		(req, res, next) => {
			const { author } = req;
			const rcpt = req.loaded.instance;

			rcpt.save({ author })
				.then(() => res.json(rcpt))
				.catch((err) => {
					if(err instanceof PgError) {
						if(err.code === '23502') {
							return next(new HTTPError(400, 'Invalid email address'));
						}
						if(err.code === '23505') {
							return next(new HTTPError(403, 'The recipient already exists'));
						}
					}
					return next(err);
				});
		},
	);

	// update recipients
	app.patch(
		'/api/v1/recipient/:id',
		isActive,
		loadInstance,
		(req, res, next) => {
			const { author } = req;
			const rcpt = req.loaded.instance;
			const props = req.body;

			rcpt.update({ props, author })
				.then(() => res.json(rcpt))
				.catch(next);
		},
	);
};
