import emailValidator from 'email-validator';
import emailSMTPVerificator from 'email-smtp-verificator';
import config from '../config';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import { isNatural, isBool, isDate } from '../utils/extras';
import { HTTPError } from '../errors';


class Recipient extends AbstractModel {
	/*----------------------------------------------------------------------------
	-------------------------------- STATIC PROPS --------------------------------
	----------------------------------------------------------------------------*/

	static types = new Set(['rcpt', 'user', 'org'])


	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static create({ props }) {
		const rcpt = new Recipient(props);
		rcpt.check();
		return rcpt;
	}


	static findById(id) {
		return db.query(
			'SELECT (_found::rcpt_full).* FROM get_rcpt($1::int) _found;',
			[id],
		)
			.then(found => (found ? new Recipient(found) : null));
	}


	static findByEmail(email) {
		return db.query(
			'SELECT (_found::rcpt_full).* FROM get_rcpt($1::text) _found;',
			[email],
		)
			.then(found => (found ? new Recipient(found) : null));
	}


	static find({ id, email }) {
		if(id !== undefined) return Recipient.findById(id);
		if(email !== undefined) return Recipient.findByEmail(email);
		throw new Error('No search attributes specified');
	}


	static checkEmail = emailValidator.validate


	static checkType(type) {
		return Recipient.types.has(type);
	}


	static verifyEmail = emailSMTPVerificator({
		timeout: 12000,
		sender: config.nodemailer.smtp.auth.user,
	})


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	async loadDependincies() {
		// stub
	}


	async saveIfNotExists({ author }) {
		if(!this.email) throw new HTTPError(400, 'Missing email');

		const rcpt = await db.query(
			'SELECT (_rcpt::rcpt_full).* FROM get_or_create_rcpt($1, $2) _rcpt',
			[this, author.id],
		);

		return this.assign(rcpt);
	}


	// @overrides
	update({ props, author }) {
		return Promise.resolve()
			.then(() => {
				if('email' in props && !props.email) {
					throw new HTTPError(400, 'Bad email address');
				}
			})
			.then(() => super.update({ props, author }));
	}


	isUnregistered() {
		return this.type === 'rcpt';
	}

	isActive() {
		return this.active === true;
	}

	isBlocked() {
		return this.active === false;
	}


	// @overrides
	toJSON() {
		const obj = super.toJSON();

		// unnest info for org and user instance
		if(typeof obj.info === 'object') {
			Object.assign(obj, { ...obj.info });
			delete obj.info;
		}

		return obj;
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

Recipient.prototype.tableName = 'recipients';

Recipient.prototype.entityName = 'rcpt';

Recipient.prototype.props = {
	// values received from client
	email: { writable: true, readable: true, check: Recipient.checkEmail },
	active: { writable: true, readable: true, check: isBool },

	// values set by model
	authorId: { writable: false, readable: true, check: isNatural },

	// values generated by db
	id: { writable: false, readable: true, check: isNatural },
	type: { writable: false, readable: true, check: Recipient.checkType },
	created: { writable: false, readable: true, check: isDate },
	updated: { writable: false, readable: true, check: isDate },
	deleted: { writable: true, readable: true, check: d => d === null || isDate(d) },

};

Object.freeze(Recipient);


export default Recipient;
