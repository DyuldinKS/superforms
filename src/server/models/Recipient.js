import emailValidator from 'email-validator';
import emailSMTPVerificator from 'email-smtp-verificator';
import config from '../config';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import { HTTPError } from '../errors';


class Recipient extends AbstractModel {
	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

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


	static validateEmail = emailValidator.validate


	static verifyEmail = emailSMTPVerificator({
		timeout: 12000,
		sender: config.nodemailer.smtp.auth.user,
	})


	static checkEmail(props) {
		if('email' in props && !Recipient.validateEmail(props.email)) {
			throw new HTTPError(400, `Invalid email`);
		}
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	saveIfNotExists({ author }) {
		return Promise.resolve()
			.then(() => {
				if(!this.email) throw new HTTPError(400, 'Missing email');

				return db.query(
					'SELECT (_rcpt::rcpt_full).* FROM get_or_create_rcpt($1, $2) _rcpt',
					[this, author.id],
				);
			})
			.then(rcpt => this.assign(rcpt));
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


	check(props) {
		Recipient.checkEmail(props);
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
	id: { writable: false, enumerable: true },
	email: { writable: true, enumerable: true },
	type: { writable: false, enumerable: true },
	active: { writable: true, enumerable: true },
	created: { writable: false, enumerable: true },
	updated: { writable: false, enumerable: true },
	deleted: { writable: true, enumerable: true },
	authorId: { writable: false, enumerable: true },
};

Object.freeze(Recipient);


export default Recipient;
