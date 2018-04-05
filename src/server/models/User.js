import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import config from '../config';
import db from '../db/index';
import Recipient from './Recipient';
import Org from './Org';
import passwordGenerator from '../libs/passwordGenerator';
import { HTTPError } from '../errors';


class User extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query(
			'SELECT (_found::user_full).* FROM get_user($1::int) _found;',
			[id],
		)
			.then(found => (found ? new User(found) : null));
	}

	// for authentication or password recovery
	static findByEmail(email, mode = null) {
		return db.query(
			'SELECT (_found::user_full).* FROM get_user($1::text, $2) _found;',
			[email, mode],
		)
			.then(found => (found ? new User(found) : null));
	}


	static findByToken(token) {
		return db.query(
			`SELECT rcpt.id, rcpt.email, ut.token
			FROM user_tokens ut
			JOIN recipients rcpt ON rcpt.id = ut.user_id
			WHERE token = $1
				AND now() - ut.created < interval '1 day';`,
			[token],
		)
			.then(found => (found ? new User(found) : null));
	}


	static find({ id, email, token }) {
		if(id !== undefined) return User.findById(id);
		if(email !== undefined) return User.findByEmail(email);
		if(token !== undefined) return User.findByToken(token);
		throw new Error('No search attributes specified');
	}


	static encrypt(password) {
		return bcrypt.hash(password, config.bcrypt.saltRound);
	}


	// ***************** INSTANCE METHODS ***************** //

	getScope() {
		return Promise.resolve()
			.then(() => {
				if(this.org) return this.org;
				if(!this.orgId) throw new Error('orgId is not specified');

				return Org.findById(this.orgId)
					.then((org) => {
						this.org = org;
						return org;
					});
			});
	}


	authenticate(password) {
		return bcrypt.compare(password, this.hash)
			.then((isPassValid) => {
				this.isAuthenticated = isPassValid;
				return this;
			});
	}


	setToken(token) {
		return db.query(
			`INSERT INTO user_tokens(user_id, token)
			VALUES($1, $2)
			ON CONFLICT(user_id) DO UPDATE
			SET token = $2 WHERE user_tokens.user_id = $1
			RETURNING *;`,
			[this.id, token],
		);
	}


	deleteToken() {
		return db.query(
			'DELETE FROM user_tokens WHERE token = $1;',
			[this.token],
		);
	}


	restorePassword() {
		return this.setToken(uuidv4())
			.then(res => this.assign(res));
	}


	resetPassword({ password, author }) {
		this.password = password || passwordGenerator(8);

		return User.encrypt(this.password)
			.then(hash => this.update({ props: { hash }, author }))
			.then(() => this.deleteToken())
			.then(() => this);
	}


	// @implements
	save({ author }) {
		return Promise.resolve()
			.then(() => {
				if(!this.role) throw new HTTPError(400, 'Missing user role');

				return new Recipient(this).saveIfNotExists({ author });
			})
			.then((rcpt) => {
				if(!rcpt.active || rcpt.type !== 'rcpt') {
					throw new HTTPError(403, 'This email is not available');
				}
				this.id = rcpt.id;
				return super.save({ author });
			})
			.then(user => this.assign(user));
	}


	getDisplayName() {
		const { firstName, patronymic } = this.info;
		if(firstName) {
			return patronymic
				? `${firstName} ${patronymic}`
				: `${firstName}`;
		}
		return '';
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

User.prototype.tableName = 'users';
User.prototype.entityName = 'user';

User.prototype.props = {
	...Recipient.prototype.props,
	id: { writable: true, enumerable: true },
	orgId: { writable: true, enumerable: true },
	org: { writable: false, enumerable: false },
	info: { writable: true, enumerable: true },
	role: { writable: true, enumerable: true },
	token: { writable: false, enumerable: false },
	password: { writable: false, enumerable: false },
	hash: { writable: true, enumerable: false },
};

Object.freeze(User);


export default User;
