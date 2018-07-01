import { can } from '../libs/Access';
import { HTTPError } from '../errors';


const accessError = new HTTPError(403, 'No access');
const check = (isAccess, next) => (isAccess ? next() : next(accessError));


const checkAccess = (req, res, next) => {
	const { method, body, query, params } = req;
	const { subpath, instance } = req.loaded;
	let action;
	console.log({ method, body, query, params });


	if(method === 'GET') {
		action = 'read';
	} else if(method === 'PATCH' || method === 'PUT') {
		action = 'update';
	} else if(method === 'POST') {
		action = 'create';
	}	else {
		return next(new Error('No access check for this request method.'));
	}

	console.log(action);
	console.log(instance);
	console.log(subpath);
	check(
		can(req.author)[action](instance, { body, query, params, subpath }),
		next,
	);
};


export { checkAccess, accessError };
