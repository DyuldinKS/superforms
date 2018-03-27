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
			prop = instance.dict.camelCased[prop] || prop;
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


	convertToTableColumns(props) {
		if(!props) return null;
		return AbstractModel.convertToTableColumns(props, this);
	}


	save() {
		throw new Error(`The .save() method of ${
			this.constructor
		} must be implemented`);
	}


	update(props, authorId) {
		const pgProps = this.convertToTableColumns(props);
		// merge with the current info of instance
		if('info' in pgProps) {
			pgProps.info = { ...this.info, ...pgProps.info };
		}

		return db.query(
			`SELECT * FROM update_${this.entityName}($1::int, $2::json, $3::int)`,
			[this.id, pgProps, authorId],
		)
			.then(rcpt => this.assign(rcpt));
	}


	toJSON() {
		return Object.keys(this).reduce(
			(json, prop) => {
				if(this.props[prop].enumerable) {
					json[prop] = this[prop];
				}
				return json;
			},
			{},
		);
	}
}


export default AbstractModel;
