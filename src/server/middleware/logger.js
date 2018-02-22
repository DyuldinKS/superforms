import uuidv1 from 'uuid/v1';
import logger from '../libs/logger';


const ignoredURLs = new Set([
	'/favicon.ico',
	'/__webpack_hmr',
]);

export default (req, res, next) => {
	if(ignoredURLs.has(req.url)) return;
	req.log = logger.child({ reqId: uuidv1() });
	req.log.info({ req });
	next();
};
