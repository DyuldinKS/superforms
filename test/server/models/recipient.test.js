import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import AbstractModel from 'Server/models/AbstractModel';
import Recipient from 'Server/models/Recipient';
import db from 'Server/db';

const { expect } = chai;


describe('Recipient model', () => {
	const author = { id: 1 };

	beforeEach(() => sinon.stub(db, 'query').resolves({}));

	afterEach(() => db.query.restore());

	it('should be instance of Recipient and AbstractModel', () => {
		const rcpt = new Recipient({});
		assert(rcpt instanceof Recipient);
		assert(rcpt instanceof AbstractModel);
		assert.deepStrictEqual(rcpt.props, Recipient.prototype.props);
	});


	describe('assign()', () => {
		const initial = { id: 13, email: 'rcpt@mail.com', active: true };
		const unwanted = { invalid: true, info: { some: 'trash' } };

		it('should filter out all unwanted props on creation', () => {
			const rcpt = new Recipient({ ...initial, ...unwanted });
			assert.deepStrictEqual({ ...rcpt }, initial);
		});


		it('should assign only allowable props', () => {
			const rcpt = new Recipient({});
			rcpt.assign(initial);
			rcpt.assign(unwanted);
			assert.deepStrictEqual({ ...rcpt }, initial);
		});
	});


	describe('update()', () => {
		it('should update only writable props', () => {
			const rcpt = new Recipient({ id: 13 });
			// props that can be updated
			const writable = {
				email: 'e@mail',
				active: true,
				deleted: false,
			};
			// props that can not be updated
			const unwritable = {
				id: 14,
				type: 'user',
				authorId: null,
				created: new Date(),
			};

			// pass all props
			const props = { ...writable, ...unwritable };
			rcpt.update({ props, author })
				.then(() => {
					assert(db.query.calledOnce);
					const [query, [id, updated, authorId]] = db.query.firstCall.args;
					assert(query.includes('update_rcpt'));
					assert(id === 13);
					assert(authorId === author.id);
					assert.deepStrictEqual(updated, writable);
				});
		});
	});
});
