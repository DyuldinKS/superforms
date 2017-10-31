import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import db from '../../src/server/db';
import { PgError } from '../../src/server/libs/errors';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const should = chai.should();
const { expect } = chai;

describe('db-queries', () => {
	it('should update table', () => {
		sinon.stub(db, 'query');
		// db.query.throws(PgError);
		const table = 'users';
		const updated = [
			{ col: 'role_id', val: 2 },
			{ col: 'info', val: { decription: 'my test info' } },
		];
		const search = { where: { col: 'id', val: 13 } };
		db.update(table, updated, search);
		db.query.should.have.been.calledOnce;

		db.query.restore();
	});
});
