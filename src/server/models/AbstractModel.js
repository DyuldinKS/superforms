import db from '../db/index';


class AbstractModel {
	// ****************** STATIC METHODS ****************** //

	static toCamelCase(str) {
		return str.replace(/[-_]+(.)?/g, (match, g) => (g ? g.toUpperCase() : ''));
	}

	static toSnakeCase(str) {
		return str.replace(/([A-Z]+)/g, ([...upper]) => {
			const lower = upper.join('').toLowerCase();
			return lower.length > 1
				// example: customHTTPError -> custom_http_error
				? `_${lower.slice(0, -1)}_${lower.slice(-1)}`
				: `_${lower}`;
		});
	}


	static buildPropsDictionary(props) {
		const camelCased = {};
		const snakeCased = {};

		let snakeCasedProp;

		Object.keys(props).forEach((prop) => {
			snakeCasedProp = AbstractModel.toSnakeCase(prop);
			if(prop !== snakeCasedProp) {
				camelCased[snakeCasedProp] = prop;
				snakeCased[prop] = snakeCasedProp;
			}
		});

		return { camelCased, snakeCased };
	}


	static convertToModelProps(props, instance) {
		const result = {};

		Object.entries(props).forEach(([prop, value]) => {
			// prop = instance.dict.camelCased[prop] || prop;
			if(prop in instance.props) {
				result[prop] = value;
			}
		});

		return result;
	}


	static convertToTableColumns(props, instance) {
		const record = {};

		Object.entries(props).forEach(([prop, value]) => {
			// leave only model writable props
			if(prop in instance.props && instance.props[prop].writable) {
				record[instance.dict.snakeCased[prop] || prop] = value;
			}
		});

		return record;
	}


	// ***************** INSTANCE METHODS ***************** //

	constructor(instance) {
		if(instance) {
			this.assign(instance);
		}
	}


	assign(props) {
		if(!props) return null;

		const converted = AbstractModel.convertToModelProps(props, this);
		Object.assign(this, converted);

		return this;
	}


	filterProps(props, type) {
		if(!props) return null;
		const writable = {};

		Object.keys(props).forEach((prop) => {
			// leave only model writable props
			if(prop in this.props && this.props[prop][type]) {
				writable[prop] = props[prop];
			}
		});

		return writable;
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
}


export default AbstractModel;
