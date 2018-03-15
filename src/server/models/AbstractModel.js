import db from '../db/index';
import {
	camelCasedProps,
	snakeCasedProps,
	staticValuesProps,
	staticIdsProps,
} from './convertedProps';
import { HTTPError } from '../errors';

// const { toCamelCase, toSnakeCase, toId } = convertedProps;


class AbstractModel {
	// ****************** STATIC METHODS ****************** //

	static convertToModelProps(props, modelProps) {
		const result = {};

		Object.entries(props).forEach(([prop, value]) => {
			prop = camelCasedProps[prop] || prop;
			if(prop in staticValuesProps) {
				value = staticValuesProps[prop].convert(value);
				prop = staticValuesProps[prop].propName;
			}
			if(prop in modelProps) {
				result[prop] = value;
			}
		});

		return result;
	}


	static convertToTableColumns(props, modelProps) {
		const record = {};

		Object.entries(props).forEach(([prop, value]) => {
			// leave only model writable props
			if(prop in modelProps && modelProps[prop].writable) {
				if(prop in staticIdsProps) {
					value = staticIdsProps[prop].convert(value);
					if(value === undefined) {
						throw new HTTPError(
							400,
							`Invalid value: ${value} for property '${prop}'`,
						);
					}
					prop = staticIdsProps[prop].propName;
				}
				record[snakeCasedProps[prop] || prop] = value;
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


	assign(instance) {
		if(!instance) return null;
		Object.assign(
			this,
			AbstractModel.convertToModelProps(instance, this.props),
		);
		return this;
	}


	convertToTableColumns(props) {
		return AbstractModel.convertToTableColumns(props, this.props);
	}


	save() { throw new Error(`The \'save\' method of ${this} must be implemented`); }


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
