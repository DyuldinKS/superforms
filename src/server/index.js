import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './db/pool';
import config from './config';
import router from './routes';
import errorHandler from './middleware/errorHandler';
import logger from './libs/logger';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const PgSession = connectPgSimple(session);
app.use(session({
	...config.session,
	store: new PgSession({
		pool, // Connection pool
		tableName: 'user_sessions',
	}),
}));

app.use(express.static(path.join(__dirname, 'public')));

router(app);

app.use(errorHandler);

app.listen(config.port, () => {
	logger.info(`Express server is listening on PORT ${config.port}`);
});

process.on('unhandledRejection', (e) => {
	logger.error(e.message, e.stack);
});
