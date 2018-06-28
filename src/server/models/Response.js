import db from '../db/index';
import AbstractModel from './AbstractModel';
import Form from './Form';
import { HTTPError } from '../errors';


class Response extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static create({ props }) {
		return new Response(props);
	}


	static findById(id) {
		return db.query(
			'SELECT * FROM to_response_full(get_response($1));',
			[id],
		)
			.then(found => (found ? new Response(found) : null));
	}


	// ***************** INSTANCE METHODS ***************** //

	async loadDependincies() {
		if(this.parentOrgIds) return;
		if(!this.formId) throw new Error('form.ownerId is not specified');

		const form = await Form.findById(this.formId);
		if(!form) throw new HTTPError(400, 'form not found');

		await form.loadDependincies();
		this.form = form;
		this.parentOrgIds = form.parentOrgIds;
		return this;
	}


	// @implements
	save({ author }) {
		return super.save({ author });
	}
}


Response.prototype.tableName = 'responses';

Response.prototype.entityName = 'response';

Response.prototype.props = {
	id: { writable: false, enumerable: true },
	formId: { writable: false, enumerable: true },
	secret: { writable: false, enumerable: false },
	items: { writable: true, enumerable: true },
	respondent: { writable: true, enumerable: true },
	recipientId: { writable: false, enumerable: true },
	created: { writable: false, enumerable: true },
	updated: { writable: false, enumerable: true },
	deleted: { writable: true, enumerable: true },
	authorId: { writable: false, enumerable: true },
};

Object.freeze(Response);


export default Response;
