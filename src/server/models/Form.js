import db from '../db/index';
import AbstractModel from './AbstractModel';
import User from './User';
import { HTTPError } from '../errors';


class Form extends AbstractModel {
	// ***************** STATIC METHODS ***************** //

	static create({ props, author }) {
		const extra = {
			...props,
			ownerId: author.id,
		};
		return new Form(extra);
	}


	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	// ***************** INSTANCE METHODS ***************** //

	async loadDependincies() {
		if(this.parentOrgIds) return;
		if(!this.ownerId) throw new Error('form.ownerId is not specified');

		const owner = await User.findById(this.ownerId);
		if(!owner) throw new Error('form owner not found');

		const dependincies = await owner.loadDependincies();
		dependincies.users = { [owner.id]: owner };
		this.owner = owner;
		this.parentOrgIds = owner.parentOrgIds;
		return dependincies;
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

	// is stage of response collecting
	isActive() {
		const { deleted, collecting } = this;
		return !deleted && collecting && !collecting.inactive
			&& (!collecting.expires	|| new Date(collecting.expires) > new Date());
	}


	isShared() {
		return this.collecting && this.collecting.shared;
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
