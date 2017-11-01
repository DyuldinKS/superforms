import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import db from '../../src/server/db';
import { PgError } from '../../src/server/libs/errors';

chai.use(chaiAsPromised);
const should = chai.should();
const { expect } = chai;

function runTests(firstUser) {
	const userShortFormKeys = [
		'id',
		'email',
		'info',
		'roleId',
		'orgId',
		'statusId',
		'authorId',
	];
	const userFullFormKeys = [
		'id',
		'email',
		'info',
		'role',
		'organization',
		'status',
		'authorId',
	];

	describe('.get()', () => {
		it('should return user with full info by recipient id', () => (
			db.users.get(firstUser)
				.then((user) => {
					expect(user).to.have.all.keys(userShortFormKeys);
					expect(user).to.be.include(firstUser);
				})
		));

		[1337, 'some string', []].forEach((arg) => {
			it('should return undefined', () => (
				db.users.get(arg).should.become(undefined)
			));
		});

		[undefined, null].forEach((arg) => {
			it('should throw TypeError', () => (
				expect(() => db.users.get(arg)).to.throw(TypeError)
			));
		});
	});


	describe('.getFully()', () => {
		it('should return user with full info by recipient id', () => (
			db.users.getFully(firstUser)
				.then((user) => {
					expect(user).to.have.all.keys(userFullFormKeys);
					expect(user).to.be.include(firstUser);
				})
		));

		it('should return user with full info by recipiend email', () => (
			db.users.getFully({ email: 'root@' })
				.then((user) => {
					expect(user).to.have.all.keys(userFullFormKeys);
					expect(user).to.be.include(firstUser);
				})
		));

		it('should return undefined', () => (
			db.users.getFully({}).should.become(undefined)
		));

		it('should return undefined as not existing user', () => (
			db.users.getFully({ email: 'notExistingEmail' }).should.become(undefined)
		));

		it('should return type error by postgres', () => (
			db.users.getFully({ id: 'notNumber' })
				.should.eventually.be.rejected.and.be.instanceOf(PgError)
				// postgreSQL code for 'invalid_text_representation'
				.and.include({ code: '22P02' })
		));
	});


	describe('.add()', () => {
		const rcp = { email: 'test@mail.com', status: 'active' };
		const user = { info: { test: true } };

		before(() => (
			db.recipients.remove(rcp)
				// add test recipient, get random role
				.then(() => Promise.all([db.recipients.add(rcp), db.roles.getAll()]))
				.then(([{ id, email }, roles]) => {
					Object.assign(user, { id, email, roleId: roles.pop().id });
				})
		));

		it('should add a user into database', () => (
			db.users.add(user, firstUser)
				.then((added) => {
					expect(added).to.be.an('object');
					return db.users.get(added).should.eventually.deep.equal(added);
				})
		));

		// reject by not null violation constraint
		const invalidParams = [
			// nonexistent recipient id - email pair
			[{ ...user, email: 'another@test.email' }, firstUser],
			[{ ...user, info: undefined }, firstUser], // undefined required field
			[{}, firstUser], // empty user object
			[user, { id: 0 }], // nonexistent author
		];
		invalidParams.forEach(([usr, author]) => {
			it('should return PgError as invalid input params', () => (
				db.users.add(usr, author)
					.should.eventually.be.rejected.and.be.instanceOf(PgError)
					// postgreSQL code for 'not null violation'
					.and.include({ code: '23502' })
			));
		});

		// remove added user, remove test recipient
		after(() => (
			db.query('DELETE FROM users WHERE id = $1;', [user.id])
				.then(() => db.recipients.remove(rcp))
		));
	});


	describe('.setToken', () => {
		it('should set user token', () => {
			const token = db.users.genPassSettingToken();
			const result = { user_id: firstUser.id, token };

			return db.users.setToken({ ...firstUser, token })
				.then(() => (
					db.query('SELECT * FROM user_tokens WHERE token = $1', [token])
						.should.become(result)
				))
				.catch()
				.then(() => (
					db.query('DELETE FROM user_tokens WHERE token = $1', [token])
				));
		});

		it('should overrite user token', () => {
			const oldToken = db.users.genPassSettingToken();
			const newToken = db.users.genPassSettingToken();
			const result = { userId: firstUser.id, token: newToken };

			return db.users.setToken({ ...firstUser, token: oldToken })
				.then(() => db.users.setToken({ ...firstUser, token: newToken }))
				.then(() => db.users.getByToken(newToken).should.become(result))
				.then(() => (
					db.queryAll(
						'SELECT * FROM user_tokens WHERE user_id = $1;',
						[firstUser.id]
					).should.eventually.have.length(1)
				));
		});
	});


	describe('.getByToken()', () => {
		it('should return user id-token pair by pass setting token', () => {
			const token = db.users.genPassSettingToken();
			const result = { userId: firstUser.id, token };

			return db.users.setToken({ ...firstUser, token })
				.then(() => (
					db.users.getByToken(token).should.become(result)
				));
		});

		const invalidParams = ['stringlikeAToken', 37, [], {}, () => 73];
		invalidParams.forEach((param) => {
			it('should return undefined as nonexistent token', () => (
				db.users.getByToken(param).should.become(undefined)
			));
		});
	});
}


describe('db-user module', () => {
	db.query('SELECT id FROM users WHERE id = (SELECT min(id) FROM users);')
		.then(runTests)
		.catch(console.log);
});
