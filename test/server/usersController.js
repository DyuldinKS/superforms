import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import users from '../../src/server/routes/users';
import db from '../../src/server/db';
import { PgError } from '../../src/server/libs/errors';

chai.use(chaiAsPromised);
const should = chai.should();
const { expect } = chai;

describe('db-user module', () => {
	describe('#add()', () => {
		it('should add user and send registration email', () => {

		});
	});
});
