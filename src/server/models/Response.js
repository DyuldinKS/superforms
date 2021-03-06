import db from '../db/index';
import AbstractModel from './AbstractModel';
import Form from './Form';
import { HTTPError } from '../errors';
import { isNatural, isDate } from '../utils/extras';


class Response extends AbstractModel {
	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static create({ props }) {
		const rspn = new Response(props);
		rspn.check();
		return rspn;
	}


	static findById(id) {
		return db.query(
			'SELECT * FROM to_response_full(get_response($1));',
			[id],
		)
			.then(found => (found ? new Response(found) : null));
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	async loadDependincies() {
		if(this.parentOrgIds) return;
		if(!this.formId) throw new Error('form.ownerId is not specified');

		const form = await Form.findById(this.formId);
		if(!form) throw new HTTPError(400, 'form not found');

		const dependincies = await form.loadDependincies();
		dependincies.forms = { [form.id]: form };
		this.form = form;
		this.parentOrgIds = form.parentOrgIds;
		return dependincies;
	}


	async save({ author }) {
		const newProps = this.filterProps(this, 'writable', 'create');
		this.check(newProps); // throws error if new props contain invalid values

		return db.query(
			`SELECT _new.* FROM to_${this.entityName}_full (
				create_${this.entityName}($1::json, $2::int)
			) _new`,
			[newProps, author ? author.id : null],
		)
			.then(res => this.assign(res));
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

Response.prototype.tableName = 'responses';

Response.prototype.entityName = 'response';

Response.prototype.props = {
	// values received from client
	formId: { writable: true, readable: true, check: isNatural },
	items: { writable: true, readable: true, check: Form.checkAnswers },
	secret: { writable: false, readable: false }, // password for filling form

	// values set by model
	respondent: { writable: true, readable: true }, // { ip, [user_id] }
	recipientId: { writable: false, readable: true }, // for auto mailing
	authorId: { writable: false, readable: true },

	// values generated by db
	id: { writable: false, readable: true },
	created: { writable: false, readable: true },
	updated: { writable: false, readable: true },
	deleted: { writable: false, readable: true, check: d => d === null || isDate(d) },
};


Object.freeze(Response);


export default Response;
