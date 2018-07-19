import moment from 'moment';
import diff from 'object-diff';
import db from '../db/index';
import AbstractModel from './AbstractModel';
import User from './User';
import Collecting from './Collecting';
import {
	isNumber,
	isNatural,
	isString,
	isObject,
	isArray,
	isDate,
	isISODateString,
	isISOTimeString,
	isEmpty,
} from '../utils/extras';
import { HTTPError } from '../errors';


class Form extends AbstractModel {
	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static create({ props, author }) {
		const extra = {
			...props,
			ownerId: author.id,
		};
		const form = new Form(extra);
		form.check();
		return form;
	}


	static findById(id) {
		return db.query('SELECT * FROM to_form_full(get_form($1)) form;', [id])
			.then(found => (found ? new Form(found) : null));
	}


	static checkTitle(title) {
		return isString(title) && title.length > 0;
	}


	static checkScheme(scheme) {
		if(!isObject(scheme)) return false;

		const { items, order } = scheme;
		if(!isObject(items) || !isArray(order)) return false;

		const ids = Object.keys(items);
		return ids.length === order.length
			&& order.every(id => isObject(items[id]));
	}


	static getAnswerValidator(type) {
		const uCased = type && type[0].toUpperCase() + type.slice(1);
		return Form[`is${uCased}AnswerValid`] || Form.textAnswerValid;
	}


	static isTextAnswerValid(question, answer) {
		return isString(answer) && answer.trim().length > 0
			&& answer.length < 2000;
	}


	static isNumberAnswerValid(question, answer) {
		return isNumber(answer)
			&& (!question.integer || Number.isInteger(answer));
	}


	static isSelectAnswerValid(question, answer) {
		if(!isObject(answer)) return false;
		const opts = question.options;
		const indexSet = new Set(opts.map((e, i) => i));
		const selected = Object.keys(answer).filter(key => key !== 'other');

		// selected options stored as { [i]: true, [j]: true, ... }
		// where i, j - option indexes in question.options array.

		// all props in answer (except 'other') should be in opt set and be a true
		if(selected.some(i => !indexSet.has(+i) || answer[i] !== true)) return false;

		let optCount = selected.length;
		// other option value should be a non empty string
		const { other } = answer;
		if(other) {
			if(!(isString(other) && other.length > 0)) return false;
			if(question.optionOther) optCount += 1;
		}

		return question.multiple ? optCount > 0 : optCount === 1;
	}


	static isDateAnswerValid(question, answer) {
		if(!isString(answer)) return false;
		return isISODateString(answer);
	}


	static isTimeAnswerValid(question, answer) {
		if(!isString(answer)) return false;
		return isISOTimeString(answer);
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	// @overrides
	assign(props) {
		if(!props) return null;
		super.assign(props);
		if(this.collecting) {
			this.collecting = new Collecting(this.collecting);
		}
		return this;
	}


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


	update({ props, author }) {
		if(props.collecting) {
			let clct = new Collecting(props.collecting);
			let propsToUpdate;
			if(this.collecting) {
				propsToUpdate = diff(this.collecting, props.collecting);
				propsToUpdate = clct.filterProps(propsToUpdate, 'writable', 'update');
			} else {
				clct.start();
				propsToUpdate = clct.filterProps(clct, 'writable', 'create');
			}

			if(isEmpty(propsToUpdate)) {
				delete props.collecting;
			} else {
				props.collecting = propsToUpdate;
			}
		}

		return super.update({ props, author });
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


	checkAnswers(answers) {
		if(!isObject(answers)) {
			throw new HTTPError(400, 'Invalid response.items structure');
		}

		const { items, order } = this.scheme;
		let question;
		let type;
		let validator;
		order.filter(id => items[id].itemType === 'input')
			.forEach((id, i) => {
				question = items[id];

				if(question.required && !(id in answers)) {
					throw new HTTPError(400, `Missing answer to question #${i + 1}`);
				}

				({ type } = question);
				if(id in answers) {
					validator = Form.getAnswerValidator(type);
					if(!validator(question, answers[id])) {
						throw new HTTPError(400, `Invalid answer to ${type} question #${i + 1}`);
					}
				}
			});
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

Form.prototype.tableName = 'forms';

Form.prototype.entityName = 'form';

Form.prototype.props = {
	// values received from client
	title: { writable: true, readable: true, check: Form.checkTitle },
	description: { writable: true, readable: true, check: isString },
	scheme: { writable: true, readable: true, check: Form.checkScheme },
	deleted: { writable: false, readable: true, check: d => d === null || isDate(d) },

	// values set by model
	collecting: { writable: true, readable: true, check: Collecting.check },
	ownerId: { writable: true, readable: true, check: isNatural },
	authorId: { writable: false, readable: true, check: isNatural },

	// values generated by db
	id: { writable: false, readable: true, check: isNatural },
	created: { writable: false, readable: true, check: isDate },
	updated: { writable: false, readable: true, check: isDate },
	questionCount: { writable: false, readable: true },
	responseCount: { writable: false, readable: true },
};

Object.freeze(Form);


export default Form;
