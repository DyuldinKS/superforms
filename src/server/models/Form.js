import db from '../db/index';
import AbstractModel from './AbstractModel';


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	// ***************** INSTANCE METHODS ***************** //

	// @implements
	save({ author }) {
		this.ownerId = author.id;

		return super.save({ author });
	}


	getResponses() {
		return db.queryAll(
			`SELECT resp_short.* FROM get_responses_by_form($1) resp,
				to_response_short(resp) resp_short;`,
			[this.id],
		)
	}
}


Form.prototype.tableName = 'forms';

Form.prototype.entityName = 'form';

Form.prototype.props = {
	id: { writable: false, enumerable: true },
	title: { writable: true, enumerable: true },
	description: { writable: true, enumerable: true },
	scheme: { writable: true, enumerable: true },
	collecting: { writable: true, enumerable: true },
	ownerId: { writable: true, enumerable: true },
	created: { writable: false, enumerable: true },
	updated: { writable: false, enumerable: true },
	deleted: { writable: true, enumerable: true },
	authorId: { writable: false, enumerable: true },
	questionCount: { writable: false, enumerable: true },
	responseCount: { writable: false, enumerable: true },
};

Object.freeze(Form);


export default Form;
