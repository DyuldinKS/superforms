import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import config from '../config';
import db from '../db/index';
import Recipient from './Recipient';
import passwordGenerator from '../libs/passwordGenerator';
import { HTTPError } from '../errors';


class User extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM get_user($1);', [id])
			.then((found) => {
				if(!found) return null;
				return new User(found);
			});
	}

	// for authentication or password recovery
	static findByEmail(email) {
		return db.query('SELECT * FROM get_user_by_email($1)', [email])
			.then((found) => {
				if(!found) return null;
				return new User(found);
			});
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
			.then((user) => {
				if(!user) return null;
				return new User(user);
			});
	}


	// ***************** INSTANCE METHODS ***************** //

	authenticate(password) {
		console.log(this);
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


	resetPassword(authorId) {
		this.password = passwordGenerator(8);
		return bcrypt.hash(this.password, config.bcrypt.saltRound)
			.then(hash => this.update({ hash }, authorId))
			.then(() => this.deleteToken())
			.then(() => this);
	}


	// @implements
	save(authorId) {
		const rcpt = new Recipient(this);
		return rcpt.saveIfNotExists(authorId)
			.then(() => {
				if(!rcpt.active || rcpt.type !== 'rcpt') {
					throw new HTTPError(403, 'This email is not available');
				}
				return db.query(
					'SELECT * FROM create_user($1, $2, $3, $4, $5, $6)',
					[
						rcpt.id,
						this.orgId,
						this.info,
						this.role,
						this.hash,
						authorId,
					],
				);
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

const props = {
	...Recipient.prototype.props,
	orgId: { writable: false, enumerable: true },
	info: { writable: true, enumerable: true },
	role: { writable: true, enumerable: true },
	token: { writable: false, enumerable: false },
	password: { writable: false, enumerable: false },
	hash: { writable: true, enumerable: false },
};

User.prototype.props = props;
User.prototype.dict = User.buildPropsDictionary(props);

Object.freeze(User);


export default User;
