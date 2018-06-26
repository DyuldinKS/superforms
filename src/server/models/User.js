import bcrypt from 'bcrypt';
import uuidv4 from 'uuid/v4';
import config from '../config';
import db from '../db/index';
import Recipient from './Recipient';
import Org from './Org';
import passwordGenerator from '../libs/passwordGenerator';
import { isNatural, isObject, isString, isEmpty } from '../utils/extras';
import { HTTPError } from '../errors';


class User extends Recipient {
	/*----------------------------------------------------------------------------
	-------------------------------- STATIC PROPS --------------------------------
	----------------------------------------------------------------------------*/

	static roles = new Set(['root', 'admin', 'user', 'respondent'])


	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static findById(id) {
		return db.query(
			'SELECT _user.* FROM to_user_full(get_user($1::int)) _user;',
			[id],
		)
			.then(found => (found ? new User(found) : null));
	}


	// for authentication or password recovery
	static findByEmail(email, mode = null) {
		return db.query(
			'SELECT _user.* FROM to_user_full(get_user($1::text, $2)) _user;',
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


	static checkInfo(info) {
		if(!isObject(info)) return false;

		const {
			firstName, lastName, patronymic, ...unexpected
		} = info;

		return (firstName && isString(firstName)
				&& lastName && isString(lastName)
				&& (patronymic === undefined || isString(patronymic))
				&& isEmpty(unexpected));
	}


	static checkRole(role) {
		return User.roles.has(role);
	}


	static checkPassword(p) {
		return isString(p) && p.length >= 8 && p.length <= 64;
	}


	static async encrypt(password) {
		return bcrypt.hash(password, config.bcrypt.saltRound);
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	// @overrides
	async save({ author }) {
		const rcpt = await new Recipient(this).saveIfNotExists({ author });
		if(!rcpt.active || rcpt.type !== 'rcpt') {
			throw new HTTPError(403, 'This email is not available');
		}

		const writableProps = this.filterProps(this, 'writable');
		const user = await db.query(
			`SELECT _new.* FROM to_user_full(
				create_user($1::int, $2::json, $3::int)
			) _new;`,
			[rcpt.id, writableProps, author.id],
		);

		return this.assign(user);
	}


	// @overrides
	async update({ props, author }) {
		const { password } = props;
		if(password) {
			props.hash = await User.encrypt(password);
		}

		return super.update({ props, author });
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
		const props = { password: this.password };

		return this.update({ props, author })
			.then(() => this.deleteToken())
			.then(() => this);
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


	findForms(options = {}) {
		const filter = Org.buildFilter(options);

		return db.query(
			'SELECT * FROM find_user_forms($1::int, $2::jsonb)',
			[this.id, filter],
		);
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

User.prototype.tableName = 'users';
User.prototype.entityName = 'user';

User.prototype.props = {
	/* client */
	...Recipient.prototype.props,
	// @override recipient.id
	id: { writableOn: 'create', readable: true, check: isNatural },
	orgId: { writable: 'create', readable: true, check: isNatural },
	info: { writable: true, readable: true, check: User.checkInfo },
	role: { writable: true, readable: true, check: User.checkRole },
	// should be encrypted and saved as hash property
	password: { writable: false, readable: false, check: User.checkPassword },

	/* system */
	org: { writable: false, readable: false },
	token: { writable: false, readable: false },
	hash: { writable: true, readable: false },
};

Object.freeze(User);


export default User;
