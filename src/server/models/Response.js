import db from '../db/index';
import AbstractModel from './AbstractModel';


class Response extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query(
			'SELECT * FROM to_response_full(get_response($1));',
			[id],
		)
			.then(found => (found ? new Response(found) : null));
	}


	// ***************** INSTANCE METHODS ***************** //

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
