import diff from 'object-diff';
import db from '../db/index';
import { isEmpty } from '../utils/extras';


class AbstractModel {
	// ***************** INSTANCE METHODS ***************** //

	constructor(instance) {
		if(instance) {
			this.assign(instance);
		}
	}


	filterProps(props, type) {
		if(!props) return null;
		const filtered = {};

		Object.keys(props).forEach((prop) => {
			if(prop in this.props
				&& (type === 'all' || this.props[prop][type])) {
				filtered[prop] = props[prop];
			}
		});

		return filtered;
	}


	assign(props) {
		if(!props) return null;

		return Object.assign(this, this.filterProps(props, 'all'));
	}


	save({ author }) {
		const typeConverter = `to_${this.entityName}_full`;
		const create = `create_${this.entityName}`;
		const writableProps = this.filterProps(this, 'writable');

		return db.query(
			`SELECT _new.* FROM ${typeConverter}(
				${create}($1::json, $2::int)
			) _new`,
			[writableProps, author.id],
		)
			.then(res => this.assign(res));
	}


	async update({ props, author }) {
		// sql funcs
		const typeConverter = `to_${this.entityName}_full`;
		const update = `update_${this.entityName}`;

		// filter props to update
		const writableProps = this.filterProps(props, 'writable');
		const newProps = diff(this, writableProps);
		if(isEmpty(newProps)) return this;

		// update only new props
		return db.query(
			`SELECT _updated.* FROM ${typeConverter}(
				${update}($1::int, $2::json, $3::int)
			) _updated`,
			[this.id, newProps, author.id],
		)
			.then(res => this.assign(res));
	}


	toJSON() {
		return this.filterProps(this, 'enumerable');
	}


	toStore() {
		return { [this.id]: this.toJSON() };
	}
}


export default AbstractModel;
