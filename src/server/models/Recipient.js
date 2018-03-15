import emailSMTPVerificator from 'email-smtp-verificator';
import config from '../config';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import { HTTPError } from '../errors';


class Recipient extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static find({ id, email }) {
		const column = id ? 'id' : 'email';
		return db.query(
			`SELECT * FROM recipients rcp
			WHERE rcp.${column} = $1`,
			[id || email],
		)
			.then(rcp => (rcp ? new Recipient(rcp) : null));
	}


	static findById(id) {
		return Recipient.find({ id });
	}


	static verifyEmail = emailSMTPVerificator({
		timeout: 12000,
		sender: config.nodemailer.smtp.auth.user,
	})


	// ***************** INSTANCE METHODS ***************** //

	isUnregistered() {
		return this.type === 'rcpt';
	}

	isActive() {
		return this.active === true;
	}

	isBlocked() {
		return this.active === false;
	}


	save(authorId) {
		return db.query(
			'SELECT * FROM create_rcpt($1, $2)',
			[this.email, authorId],
		)
			.then(saved => this.assign(saved));
	}


	saveIfNotExists(authorId) {
		return db.query(
			'SELECT * FROM get_or_create_rcpt($1, $2)',
			[this.email, authorId],
		)
			.then(rcpt => this.assign(rcpt));
	}


	update(params, authorId) {
		if('email' in params && !params.email) {
			throw new HTTPError(400, 'Bad email address');
		}

		return super.update(params, authorId);
	}


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

// static property
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


export default Recipient;
