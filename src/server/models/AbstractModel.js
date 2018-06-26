import diff from 'object-diff';
import db from '../db/index';
import { isEmpty } from '../utils/extras';


class AbstractModel {
	// ***************** INSTANCE METHODS ***************** //

	constructor(props) {
		if(typeof props !== 'object') {
			throw new TypeError(`${this.constructor.name} accepts only object with properties`);
		}
		this.assign(props);
	}


	filterProps(props, type, action) {
		if(!props) return null;
		let filter = () => true;
		if(type === 'readable') {
			// filter props available for a client
			filter = prop => this.props[prop].readable;
		} else if(type === 'writable') {
			// filter writable props
			// or props that can be written only on create or update
			filter = prop => (
				this.props[prop].writable || this.props[prop].writableOn === action
			);
		}

		const filtered = {};
		Object.keys(props).forEach((prop) => {
			if(this.props[prop] && filter(prop)) {
				filtered[prop] = props[prop];
			}
		});

		return filtered;
	}


	check(props) {
		if(typeof props !== 'object') {
			throw new Error('Argument must be an object with properties');
		}

		const keys = Object.keys(props);
		let key;
		let checker;
		for (let i = 0; i < keys.length; i += 1) {
			key = keys[i];
			if(!this.props[key]) {
				throw new Error(`Unexpected ${this.entityName}.${key} property`);
			}
			checker = this.props[key].check;
			if(checker !== undefined && !checker(props[key])) {
				throw new Error(`Invalid ${this.entityName}.${key} value`);
			}
		}
	}


	assign(props) {
		return props
			? Object.assign(this, this.filterProps(props))
			: null;
	}


	save({ author }) {
		const typeConverter = `to_${this.entityName}_full`;
		const create = `create_${this.entityName}`;
		const writableProps = this.filterProps(this, 'writable', 'create');

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
		const writableProps = this.filterProps(props, 'writable', 'update');
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
		return this.filterProps(this, 'readable');
	}


	toStore() {
		return { [this.id]: this.toJSON() };
	}
}


export default AbstractModel;
