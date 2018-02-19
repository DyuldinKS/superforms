import * as emailVerify from 'email-verify';
import AbstractModel from './AbstractModel';
import db from '../db/index';
// import config from '../config';
// import staticTables from '../db/staticTables.json';

// const { states, rcptTypes } = staticTables;
// import AbstractModel from './abstractModel';
// import mailer from '../libs/mailer';


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


	static verify(email) {
		return new Promise((resolve, reject) => {
			emailVerify.verify(email, (err, info) => (
				err ? reject(err) : resolve({ email, exists: info.success })
			));
		});
	}


	// ***************** INSTANCE METHODS ***************** //

	// isUnregistered() {
	// 	return this.type === 'unregistered';
	// }


	// isActive() {
	// 	return this.status === 'active';
	// }


	// isBlocked() {
	// 	return this.status === 'blocked';
	// }


	// testForRegistration() {
	// 	if(!this.isUnregistered()) {
	// 		throw new Error('Email is already used');
	// 	}
	// 	if(!this.isBlocked()) {
	// 		throw new Error('Email is blacklisted');
	// 	}
	// 	return this;
	// }


	save() {
		return db.query(
			'INSERT INTO recipients(email) VALUES($1) RETURNING *;',
			[this.email],
		)
			.then(saved => this.assign(saved));
	}


	saveIfNotExists() {
		return db.query(
			'SELECT * FROM get_or_create_rcpt($1)',
			[this.email],
		)
			.then(rcpt => this.assign(rcpt));
	}


	update(props) {
		return db.createQuery()
			.update(this.tableName)
			.set(super.convertToPgSchema(props))
			.where({ id: this.id })
			.returning()
			.run()
			.then(updated => this.assign(updated[0]));
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

Recipient.prototype.props = new Set([
	'id',
	'email',
	'updated',
	// ids
	// 'typeId',
	// 'statusId',
	// related objects
	'type',
	// 'status'
	'active',
]);


export default Recipient;
