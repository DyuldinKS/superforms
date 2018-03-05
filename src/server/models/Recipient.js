import emailSMTPVerificator from 'email-smtp-verificator';
import config from '../config';
import db from '../db/index';
import AbstractModel from './AbstractModel';


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


	// testForRegistration() {
	// 	if(!this.isUnregistered()) {
	// 		throw new Error('Email is already used');
	// 	}
	// 	if(!this.isBlocked()) {
	// 		throw new Error('Email is blacklisted');
	// 	}
	// 	return this;
	// }


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


	toJSON() {
		const { info } = this;
		const unpacked = typeof info === 'object'
			? { ...info, ...this }
			: { ...this };
		delete unpacked.info;
		delete unpacked.type;
		delete unpacked.updated;
		return unpacked;
	}
}

// static property
Recipient.prototype.tableName = 'recipients';

Recipient.prototype.entityName = 'rcpt';

Recipient.prototype.props = new Set([
	'id',
	'email',
	'updated',
	// ids
	'authorId',
	// 'typeId',
	// 'statusId',
	// related objects
	'type',
	// 'status'
	'active',
]);


export default Recipient;
