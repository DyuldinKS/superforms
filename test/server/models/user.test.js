import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import AbstractModel from 'Server/models/AbstractModel';
import Recipient from 'Server/models/Recipient';
import User from 'Server/models/User';
import db from 'Server/db';
import { HTTPError } from 'Server/errors';

const { expect } = chai;


describe('User model', () => {
	const author = { id: 1 };

	beforeEach(() => sinon.stub(db, 'query').resolves({}));

	afterEach(() => db.query.restore());


	it('should be instance of User, Recipient and AbstractModel', () => {
		const user = new User();
		assert(user instanceof User);
		assert(user instanceof Recipient);
		assert(user instanceof AbstractModel);
		assert.deepStrictEqual(user.props, User.prototype.props);
	});

	describe('check()', () => {
		it('should NOT throw Error on checking valid props', () => {
			const user = new User({ id: 13 });
			const invalidPropsList = [
				{ email: 'some-real@email.com' },
				{ role: 'user' },
				{ info: { firstName: 'W', lastName: 'M' } },
				{ info: { firstName: 'V', lastName: 'Lenin', patronymic: 'I'  } },
				{ password: 'encryptMe', email: 'wc@gmail.com' },
			];

			invalidPropsList.forEach((props) => {
				assert.doesNotThrow(() => user.check(props));
			})
		});


		it('should throw HTTPError about invalid property values', () => {
			const user = new User({ id: 13 });
			const invalidPropsList = [
				[{ email: 'jo@ke' }, 'Invalid email'],
				[{ role: 'superman' }, 'Invalid role'],
				[{ info: null }, 'Invalid info'],
				[{ info: { name: 'Winston' } }, 'Invalid info structure'],
				[{ password: null, email: 'wc@gmail.com' }, 'Invalid password'],
			];

			invalidPropsList.forEach(([props, msg]) => {
				assert.throws(() => user.check(props), HTTPError, msg);
			})
		});
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


	describe('update()', () => {
		it('should update only writable props', () => {
			const user = new User({ id: 13 });
			// props that can be updated
			const writable = {
				email: 'w@mc.com',
				role: 'root',
				info: { firstName: 'W', lastName: 'MC' },
				deleted: true,
				orgId: 13,
			};
			// props that can not be updated
			const unwritable = {
				id: 14,
				type: 'rcpt',
				created: new Date(),
				updated: new Date(),
				authorId: null,
			};

			// pass all props
			const props = { ...writable, ...unwritable };

			return user.update({ props, author })
				.then(() => {
					assert(db.query.calledOnce);
					const [query, [id, updatedProps, authorId]] = db.query.firstCall.args;

					assert(query.includes('update_user'));
					assert(id === 13);
					assert(authorId === author.id);

					assert.deepStrictEqual(updatedProps, writable);
				});
		});


		it('should encrypt new password and update hash', () => {
			const user = new User({ id: 13 });
			const password = 'someNewPwd';
			const props = { password };

			return user.update({ props, author })
				.then(() => {
					assert(db.query.calledOnce);
					const [query, [id, updatedProps, authorId]] = db.query.firstCall.args;
					user.hash = updatedProps.hash;
					return user.authenticate(password)
				})
				.then(() => { assert(user.isAuthenticated); });
		});
	});


	describe('toJSON()', () => {
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
});
