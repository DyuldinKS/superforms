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

	it('should be instance of User, Recipient and AbstractModel', () => {
		const user = new User({});
		assert(user instanceof User);
		assert(user instanceof Recipient);
		assert(user instanceof AbstractModel);
		assert.deepStrictEqual(user.props, User.prototype.props);
	});


	describe('check()', () => {
		it('should NOT throw Error on checking valid props', () => {
			const user = new User({ id: 13 });
			const props = {
				id: 3289,
				orgId: 892,
				email: 'some-real@email.com',
				role: 'user',
				info: { firstName: 'W', lastName: 'M' },
				info: { firstName: 'V', lastName: 'Lenin', patronymic: 'I'  },
				password: 'encryptMe', email: 'wc@gmail.com',
				created: new Date,
				authorId: 21,
			};

			assert.doesNotThrow(() => user.check(props));
		});


		it('shoult throw Error about unexpected property', () => {
			const user = new User({ id: 13 });
			const unexpectedPropsList = [
				{ save: 'me to db' },
				{ hello: 'world' },
				{ '': null },
				{ 2981: { name: 'Winston' } },
			];

			unexpectedPropsList.forEach((props) => {
				assert.throws(
					() => user.check(props), Error, /^Unexpected user.\w+ property$/
				);
			})
		})


		it('should throw Error about invalid property value', () => {
			const user = new User({ id: 13 });
			const invalidPropsList = [
				{ id: 3289.2 },
				{ orgId: 'nope' },
				{ email: 'jo@ke' },
				{ role: 'superman' },
				{ info: null },
				{ info: { name: 'Winston' } },
				{ password: null, email: 'wc@gmail.com' },
				{ authorId: -234 },
			];

			invalidPropsList.forEach((props) => {
				assert.throws(
					() => user.check(props), Error, /^Invalid user.\w+ value$/
				);
			})
		});
	});


	describe('assign()', () => {
		const initial = {
			email: 'winston@mccall.com',
			info: { firstName: 'Winston', lastName: 'McCall' },
			role: 'admin',
			orgId: 127,
		};
		const unwanted = { invalid: true, some: 'trash' };


		it('should assign only allowable props', () => {
			const user = new User({});
			user.assign(initial);
			user.assign(unwanted);
			assert.deepStrictEqual({ ...user }, initial);
		});


		it('should filter out all unwanted props on creation', () => {
			const user = new User({ ...initial, ...unwanted });
			assert.deepStrictEqual({ ...user }, initial);
		});
	})


	describe('update()', () => {
		beforeEach(() => sinon.stub(db, 'query').resolves({}));

		afterEach(() => db.query.restore());

		it('should update only writable props', () => {
			const user = new User({ id: 13 });
			// props that can be updated
			const writable = {
				email: 'w@mc.com',
				role: 'root',
				info: { firstName: 'W', lastName: 'MC' },
				deleted: new Date(),
			};
			// props that can not be updated
			const unwritable = {
				id: 14,
				orgId: 13,
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
		it('should convert to json only readable props', () => {
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
