import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import AbstractModel from 'Server/models/AbstractModel';
import Recipient from 'Server/models/Recipient';
import User from 'Server/models/User';
import db from 'Server/db';

const { expect } = chai;


describe('User model', () => {
	const author = { id: 1 };

	before(() => sinon.stub(db, 'query').resolves({}));

	after(() => db.query.restore());


	it('should be instance of User, Recipient and AbstractModel', () => {
		const user = new User();
		assert(user instanceof User);
		assert(user instanceof Recipient);
		assert(user instanceof AbstractModel);
		assert.deepStrictEqual(user.props, User.prototype.props);
	});


	const PROPS = {
		email: 'winston@mccall.com',
		info: { firstName: 'Winston', lastName: 'McCall' },
		role: 'admin',
		orgId: 127,
	};
	const unwanted = { invalid: true, some: 'trash' };

	it('should filter out all unwanted props on creation', () => {
		const user = new User({ ...PROPS, ...unwanted });
		assert.deepStrictEqual({ ...user }, PROPS);
	});


	it('should assign only allowable props', () => {
		const user = new User();
		user.assign(PROPS);
		user.assign(unwanted);
		assert.deepStrictEqual({ ...user }, PROPS);
	});

	
	it('should update only writable props', () => {
		const user = new User({ id: 13 });
		// props that can be updated
		const writable = {
			id: 14,
			email: 'w@mc.com',
			role: 'root',
			info: { firstName: 'W', lastName: 'MC' },
			hash: '$2a$10$6gWKeAoLc6B3wwx4Oao3TePNf0lXpBXW9OtFw7RFNSDSfeMo7csXO',
			deleted: true,
			orgId: 13,
		};
		// props that can not be updated
		const unwritable = {
			type: 'rcpt',
			password: 'aborted',
			created: new Date(),
			updated: new Date(),
			authorId: null,
		};

		// pass all props
		const props = { ...writable, ...unwritable };
		user.update({ props, author })
			.then(() => {
				assert(db.query.calledOnce);
				const [query, [id, updatedProps, authorId]] = db.query.firstCall.args;

				assert(query.includes('update_user'));
				assert(id === 13);
				assert(authorId === author.id);

				assert.deepStrictEqual(updatedProps, writable);
			});
	});


	it('should convert to json only enumerable props', () => {
		const secretProps = {
			password: 'secret',
			hash: '$2a$10$6g',
			token: 'abcad-218bsa',
		};
		const json = { id: 13, email: 'w@mc.com' };
		const user = new User({ ...json, ...secretProps });

		assert.deepStrictEqual(user.toJSON(), json);
	});


	it('should unnest info prop for client', () => {
		const user = new User({ id: 13, role: 'recipient' });
		user.assign({
			info: { firstName: 'Winston', lastName: 'McCall' },
			password: 'super-secret',
		});
		assert.deepStrictEqual(
			user.toJSON(),
			{
				id: 13,
				role: 'recipient',
				firstName: 'Winston',
				lastName: 'McCall',
			});
	});
});
