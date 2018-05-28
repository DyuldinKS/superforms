import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import 'babel-polyfill'; // For async and generator functions support
import webpackClientConfig from 'Webpack/webpack.client'; // alias for webpack directory
import db from './db';
import config from './config';
import { deserializeUser } from './middleware/users';
import router from './routes';
import log from './libs/logger';
import logger from './middleware/logger';
import errorHandler from './middleware/errorHandler';


const app = express();
app.disable('x-powered-by');

if(process.env.NODE_ENV === 'development') {
	const compiler = webpack(webpackClientConfig);
	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackClientConfig.output.publicPath,
	}));
	app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const PgSession = connectPgSimple(session);
app.use(session({
	...config.session,
	store: new PgSession({
		pool: db.pool, // Connection pool
		tableName: 'user_sessions',
	}),
}));

app.use(deserializeUser);
router(app);
app.use(errorHandler);

app.listen(config.port, () => {
	log.info(`Express server is listening on PORT ${config.port}`);
});

process.on('unhandledRejection', (err) => {
	log.warn(err.message, err.stack);
});
