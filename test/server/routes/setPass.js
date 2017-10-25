import { req, res, next, promiseLog } from './stubs';
import users from '../../../src/server/routes/users';

req.params.token = 'f08fd1093df211f9dcb2559af825c3d18f2700b7';
req.body.pass = 'realityDistortion&Ignorance';

users.setPass(req, res, next);
