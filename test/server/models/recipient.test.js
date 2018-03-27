import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import AbstractModel from 'Server/models/AbstractModel';
import Recipient from 'Server/models/Recipient';
import db from 'Server/db';

const { expect } = chai;


describe('Recipient model', () => {
	it('should be instance of Recipient and AbstractModel', () => {
		const rcpt = new Recipient();
		assert(rcpt instanceof Recipient);
		assert(rcpt instanceof AbstractModel);
		assert.deepStrictEqual(rcpt.props, Recipient.prototype.props);
	});


	const PROPS = { id: 13, email: 'rcpt@mail.com', active: true };
	const unwanted = { invalid: true, info: { some: 'trash' } };

	it('should filter out all unwanted props on creation', () => {
		const rcpt = new Recipient({ ...PROPS, ...unwanted });
		assert.deepStrictEqual({ ...rcpt }, PROPS);
	});


	it('should assign only allowable props', () => {
		const rcpt = new Recipient();
		rcpt.assign(PROPS);
		rcpt.assign(unwanted);
		assert.deepStrictEqual({ ...rcpt }, PROPS);
	});


	it('should rename snake cased props', () => {
		const rcpt = new Recipient({ author_id: 1, some_info: 'aborted' });
		assert.deepStrictEqual({ ...rcpt }, { authorId: 1 });
	});

	
	it('should update only writable props', () => {
		sinon.stub(db, 'query').resolves({});

		const rcpt = new Recipient({ id: 13 });
		// props that can be updated
		const writable = { email: 'e@mail', active: true, deleted: false };
		// props that can not be updated
		const unwritable = {
			id: 14,
			type: 'user',
			authorId: null,
			created: new Date(),
		};

		// pass all props
		rcpt.update({ ...writable, ...unwritable }, 1);

		assert(db.query.calledOnce);
		const [query, [id, updated, authorId]] = db.query.firstCall.args;
		assert(query.includes('update_rcpt'));
		assert(id === 13);
		assert(authorId === 1);
		assert.deepStrictEqual(updated, writable);

		db.query.restore();
	});


	it('should convert to json only enumerable props', () => {
		const rcpt = new Recipient(PROPS);
		assert.deepStrictEqual(rcpt.toJSON(), PROPS);
	});
});
