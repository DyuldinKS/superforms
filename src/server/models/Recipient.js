import * as emailVerify from 'email-verify';
import AbstractModel from './AbstractModel';
import db from '../db/index';
import config from '../config';
// import AbstractModel from './abstractModel';
// import mailer from '../libs/mailer';


class Recipient extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static find({ id, email }) {
		return db.recipients.select({
			id: typeof id === 'string' ? Number.parseInt(id, 10) : id,
			email,
		})
			.then(rcp => (rcp ? new Recipient(rcp) : null));
	}

	// ***************** INSTANCE METHODS ***************** //

	static verify(email) {
		return new Promise((resolve, reject) => {
			emailVerify.verify(email, (err, info) => (
				err ? reject(err) : resolve({ email, exists: info.success })
			));
		});
	}


	isUnregistered() {
		return this.type === 'unregistered';
	}


	isActive() {
		return this.status === 'active';
	}


	isBlocked() {
		return this.status === 'blocked';
	}


	testForRegistration() {
		if(!this.isUnregistered()) {
			throw new Error('Email is already used');
		}
		if(!this.isBlocked()) {
			throw new Error('Email is blacklisted');
		}
		return this;
	}


	save() {
		const { email } = this;
		return db.recipients.insert({ email })
			.then(saved => this.assign(saved));
	}


	update(props) {
		console.log(props, super.convertToSchema(props))
		return db.createQuery()
			.update(this.tableName)
			.set(super.convertToSchema(props))
			.where({ id: this.id })
			.returning()
			.run()
			.then(updated => this.assign(updated));
	}
}

// static property
Recipient.prototype.tableName = 'recipients';

Recipient.prototype.props = new Set([
	'id',
	'email',
	'updated',
	// ids
	'typeId',
	'statusId',
	// related objects
	'type',
	'status',
]);


export default Recipient;
