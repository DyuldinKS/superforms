import AbstractModel from './AbstractModel';
import { isObject, isArray } from '../utils/extras';
import { HTTPError } from '../errors';


class FormScheme extends AbstractModel {
	/*----------------------------------------------------------------------------
	------------------------------- STATIC METHODS -------------------------------
	----------------------------------------------------------------------------*/

	static create({ props }) {
		const scheme = new FormScheme(props);
		scheme.check();
		return scheme;
	}


	/*----------------------------------------------------------------------------
	------------------------------ INSTANCE METHODS ------------------------------
	----------------------------------------------------------------------------*/

	assign(props) {
		super.assign(props);
		if(this.itemCount === undefined) {
			this.itemCount = this.countItems();
			this.questionCount = this.countItems('question');
		}
		return this;
	}


	check(props = this) {
		const { items, order } = props;
		const ids = Object.keys(items);
		if(ids.length !== order.length
				|| order.some(id => isObject(items[id]) === false)) {
			throw new HTTPError('Invalid form scheme');
		}

		super.check();
	}


	countItems(type) {
		const { items, order } = this;
		let itemType;
		if(type === 'question') itemType = 'input';
		// annoying spelling mistake of the whole system in 'delimiter'
		else if(type === 'delimeter') itemType = 'delimeter';
		else return order.length;

		return order.filter(id => items[id].itemType === itemType).length;
	}
}


/*------------------------------------------------------------------------------
----------------------------- PROTOTYPE PROPERTIES -----------------------------
------------------------------------------------------------------------------*/

FormScheme.prototype.entityName = 'scheme';

FormScheme.prototype.props = {
	// values received from client
	items: { writable: true, readable: true, check: isObject },
	order: { writable: true, readable: true, check: isArray },

	// values set by model
	itemCount: { writable: true, readable: true, check: Number.isSafeInteger },
	questionCount: { writable: true, readable: true, check: Number.isSafeInteger },
};


Object.freeze(FormScheme);


export default FormScheme;
