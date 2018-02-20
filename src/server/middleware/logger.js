import uuid from 'uuid';
import logger from '../libs/logger';


const ignoredURLs = new Set([
	'/favicon.ico',
	'/__webpack_hmr',
]);

export default (req, res, next) => {
	if(ignoredURLs.has(req.url)) return;
	req.log = logger.child({ reqId: uuid() });
	req.log.info({ req });
	next();
};
