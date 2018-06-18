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
			if(prop in this.props
				&& (type === 'all' || this.props[prop][type])) {
				writable[prop] = props[prop];
			}
		});

		return writable;
	}


	assign(props) {
		if(!props) return null;

		return Object.assign(this, this.filterProps(props, 'all'));
	}


	save({ author }) {
		const typeConverter = `to_${this.entityName}_full`;
		const create = `create_${this.entityName}`;
		const writableProps = this.filterProps(this, 'all');

		return db.query(
			`SELECT _new.* FROM ${typeConverter}(
				${create}($1::json, $2::int)
			) _new`,
			[writableProps, author.id],
		)
			.then(res => this.assign(res));
	}


	update({ props, author }) {
		const typeConverter = `to_${this.entityName}_full`;
		const update = `update_${this.entityName}`;
		const writableProps = this.filterProps(props, 'writable');

		return db.query(
			`SELECT _updated.* FROM ${typeConverter}(
				${update}($1::int, $2::json, $3::int)
			) _updated`,
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
