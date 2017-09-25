"use strict"
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import pg from 'pg';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db/query';
import config from './config';
import router from './routes';
import logger from './libs/logger';

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const pgSession = connectPgSimple(session);
app.use(session({ 
	...config.session,
	store: new pgSession({
		pool, // Connection pool 
		tableName : 'user_sessions'
	})
}))

app.use(express.static(path.join(__dirname, 'public')));

router(app);

app.use((req, res, next) => {
	let err = new Error('Not Found');
	err.status = 404;
	res.json(err);
});

app.listen(config.port, function () {
	logger.info('Express server is listening on PORT ' + config.port);
});

process.on('unhandledRejection', function(e) {
	console.log(e.message, e.stack)
})