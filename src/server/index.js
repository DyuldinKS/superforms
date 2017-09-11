"use strict"
import express from 'express';
import path         from 'path';
// import logger       from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import config from './config';
import router from './routes';

let app = express();

// app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router(app);

// using arrow syntax
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  res.json(err);
});

app.listen(config.port, function () {
  console.log('Express server is listening on PORT ' + config.port);
});