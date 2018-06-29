import { can } from '../utils/Access';
import { HTTPError } from '../errors';


const accessError = new HTTPError(403, 'No access');
const check = (isAccess, next) => (isAccess ? next() : next(accessError));


const checkAccessToCreate = (req, res, next) => {
	const { body } = req;
	const { instance } = req.loaded;
	check(
		can(req.author).create(instance, { body }),
		next,
	);
};

const checkAccessToRead = (req, res, next) => {
	const { params, query } = req;
	const { path } = req.loaded;
	check(
		can(req.author).read(req.instance, { params, query, path }),
		next,
	);
};

const checkAccessToUpdate = (req, res, next) => {
	const { body } = req;
	check(
		can(req.author).update(req.instance, { body }),
		next,
	);
};


export {
	checkAccessToCreate,
	checkAccessToRead,
	checkAccessToUpdate,
};
