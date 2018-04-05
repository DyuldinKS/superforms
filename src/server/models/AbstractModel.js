import db from '../db/index';


class AbstractModel {
	// ***************** INSTANCE METHODS ***************** //

	constructor(instance) {
		if(instance) {
			this.assign(instance);
		}
	}


	filterProps(props, type) {
		if(!props) return null;
		const writable = {};

		Object.keys(props).forEach((prop) => {
			// leave only model writable props
			if(prop in this.props
				&& (type === 'any' || this.props[prop][type])) {
				writable[prop] = props[prop];
			}
		});

		return writable;
	}


	assign(props) {
		if(!props) return null;

		return Object.assign(this, this.filterProps(props, 'any'));
	}


	save({ author }) {
		const type = `${this.entityName}_full`;
		const create = `create_${this.entityName}`;
		const writableProps = this.filterProps(this, 'writable');

		return db.query(
			`SELECT (new::${type}).*
			FROM ${create}($1::json, $2::int) new`,
			[writableProps, author.id],
		)
			.then(res => this.assign(res));
	}


	update({ props, author }) {
		const type = `${this.entityName}_full`;
		const update = `update_${this.entityName}`;
		const writableProps = this.filterProps(props, 'writable');

		return db.query(
			`SELECT (_updated::${type}).*
			FROM ${update}($1::int, $2::json, $3::int) _updated`,
			[this.id, writableProps, author.id],
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
