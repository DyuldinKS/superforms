import db from '../db/index';
import AbstractModel from './AbstractModel';


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	// ***************** INSTANCE METHODS ***************** //

	async loadDependincies() {
		if(this.parentOrgIds) return;
		if(!this.ownerId) throw new Error('form.ownerId is not specified');

		const result = await db.query(
			`SELECT json_agg(link.parent_id ORDER BY link.distance) AS "parentIds"
			FROM users
			JOIN org_links link ON link.org_id = users.org_id 
			WHERE users.id = $1;`,
			[this.ownerId],
		);

		this.parentOrgIds = result ? result.parentIds : null;
	}


	// @implements
	save({ author }) {
		this.ownerId = author.id;

		return super.save({ author });
	}


	// get responses in short(default) or full form
	getResponses(mode) {
		const cast = `to_response_${mode === 'full' ? 'full' : 'short'}`;
		return db.queryAll(
			`SELECT resp_short.* FROM get_responses_by_form($1) resp,
				${cast}(resp) resp_short;`,
			[this.id],
		)
			.then((responses) => {
				this.responses = responses;
				return responses;
			});
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
