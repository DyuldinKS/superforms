import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import config from '../config';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import Recipient from './Recipient';
import LogRecord from './LogRecord';
import passwordGenerator from '../libs/passwordGenerator';
import { HttpError, SmtpError, PgError } from '../libs/errors';


class User extends Recipient {
	// ***************** STATIC METHODS ***************** //

	static findOne({ email, id }, options = {}) {
		const column = id ? 'id' : 'email';

		return db.query(
			`SELECT usr.id, usr.info, usr.role_id, usr.org_id,
				rcpt.email, rcpt.active
				${options.secret ? ', usr.hash ' : ''}
			FROM users usr
			JOIN recipients rcpt ON usr.id = rcpt.id
			WHERE rcpt.${column} = $1;`,
			[id || email],
		);
	}


	static findById(id) {
		return User.findOne({ id })
			.then((found) => {
				if(!found) return null;
				return new User(found);
			});
	}

	// for authentication or password recovery
	static findByEmail(email) {
		return User.findOne({ email }, { secret: true })
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


	static log(operation, record, authorId) {
		return db.query(
			`INSERT INTO logs(operation, entity, record, author_id)
			VALUES('U', 'user', $1::json, $2:int);`,
			[record, authorId],
		);
	}


	// ***************** INSTANCE METHODS ***************** //

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
					throw new HttpError(403, 'This email is not available');
				}
				return db.query(
					'SELECT * FROM create_user($1, $2, $3, $4, $5, $6)',
					[
						rcpt.id,
						this.orgId,
						this.info,
						this.role,
						null,
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


	// @override
	toJSON() {
		const obj = super.toJSON();
		delete obj.password;
		delete obj.hash;
		delete obj.token;
		return obj;
	}
}


// ***************** PROTOTYPE PROPERTIES ***************** //

User.prototype.tableName = 'users';

User.prototype.entityName = 'user';

User.prototype.props = new Set([
	'id',
	'email',
	'info',
	'created',
	'updated',
	'deleted',
	// ids
	// 'roleId',
	// 'statusId',
	'orgId',
	'authorId',
	// values
	'role',
	// 'status',
	'active',
	// token for password setting
	'token',
	// secret
	'password',
	'hash',
]);


Object.freeze(User);


export default User;
