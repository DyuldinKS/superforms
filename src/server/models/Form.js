import db from '../db/index';
import AbstractModel from './AbstractModel';


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //


	static findById(id) {
		return db.query('SELECT * FROM get_form($1)', [id]);
	}


	// ***************** INSTANCE METHODS ***************** //

	save(authorId) {
		this.ownerId = authorId;

		return db.query(
			'SELECT * FROM create_form($1, $2)',
			[super.convertToTableColumns(this), authorId],
		)
			.then(saved => this.assign(saved));
	}
}


Form.prototype.tableName = 'forms';

Form.prototype.entityName = 'form';

const props = {
	id: { writable: false, enumerable: true },
	title: { writable: true, enumerable: true },
	description: { writable: true, enumerable: true },
	scheme: { writable: true, enumerable: true },
	sent: { writable: true, enumerable: true },
	ownerId: { writable: true, enumerable: true },
	created: { writable: false, enumerable: true },
	updated: { writable: false, enumerable: true },
	deleted: { writable: true, enumerable: true },
	authorId: { writable: false, enumerable: true },
};

Form.prototype.props = props;
Form.prototype.dict = Form.buildPropsDictionary(props);

Object.freeze(Form);


export default Form;
