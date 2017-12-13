import bcrypt from 'bcrypt';
import crypto from 'crypto';
import config from '../config';
import db from '../db/index';
import Recipient from './Recipient';
import { ModelError } from '../libs/errors';


class User extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static find(userData, mode = 'short') {
		return Promise.resolve()
			.then(() => {
				switch (mode) {
				case 'full': return db.users.selectFully(userData);
				case 'secret': return db.users.selectSecret(userData);
				default: return db.users.select(userData);
				}
			})
			.then((found) => {
				if(!found) return null;
				return new User(found);
			});
	}


	static findByToken(token) {
		return db.tokens.select({ token })
			.then((user) => {
				if(!user) return null;
				return new User(user);
			});
	}

	// ***************** INSTANCE METHODS ***************** //

	login(password) {
		return bcrypt.compare(password, this.hash)
			.then((isPassValid) => {
				this.isAuthenticated = isPassValid;
				return this;
			});
	}


	recovery() {
		this.token = User.genPassSettingToken();
		return db.tokens.upsert(this).then(() => this);
	}


	static genPassSettingToken() {
		return crypto.randomBytes(20).toString('hex');
	}

	// @implement
	save() {
		return Promise.resolve()
			// .then(() => {
			// 	if(!this.email) throw new ModelError(this, 'Missing email');
			// 	if(!this.role) throw new ModelError(this, 'Missing user role');
			// 	if(!this.authorId) throw new ModelError(this, 'Unknown author');
			// })
			.then(() => db.users.insert(this))
			.then(user => this.assign(user));
	}


	setPass(pass) {
		return bcrypt.hash(pass, config.bcrypt.saltRound)
			.then(hash => db.users.update(this, { hash }))
			.then(() => db.tokens.delete(this))
			.then(() => this);
	}

	// @override
	toJSON() {
		const res = { ...this };
		delete res.hash;
		return JSON.stringify(res);
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

User.prototype.props = new Set([
	'id',
	'email',
	'info',
	'created',
	// ids
	'roleId',
	'orgId',
	'statusId',
	'authorId',
	// related objects
	'role',
	'org',
	'status',
	// token for password setting
	'token',
	// secret
	'hash',
]);


Object.freeze(User);


export default User;

User.find({ id: 1 }, 'short')
// const query = db.createQuery();
// query.select(['id', 'hash']).from('users').where({ id: 2 });
// query.run()
	.then(console.log)
	.catch(console.log)
// console.log(res)
// const q = new Query();
// // q.update('users').set({ email: 'some@new.email', hash: 'djk21a19' })
// // 	.in([1, 4, 67, 28], 'int');
// // console.log(q)

// q.
// console.log(q)
