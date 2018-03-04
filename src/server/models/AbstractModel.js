import db from '../db/index';
import {
	camelCasedProps,
	snakeCasedProps,
	staticValuesProps,
	staticIdsProps,
} from './convertedProps';
import { HttpError } from '../libs/errors';

// const { toCamelCase, toSnakeCase, toId } = convertedProps;


class AbstractModel {
	// ****************** STATIC METHODS ****************** //

	static convertToModelProps(props, modelProps) {
		const result = {};
		const unexpected = {};
		let areUnexpectedProps = false;

		Object.entries(props).forEach(([prop, value]) => {
			prop = camelCasedProps[prop] || prop;
			if(prop in staticValuesProps) {
				value = staticValuesProps[prop].convert(value);
				prop = staticValuesProps[prop].propName;
			}
			if(modelProps.has(prop)) {
				result[prop] = value;
			} else {
				unexpected[prop] = value;
				areUnexpectedProps = true;
			}
		});

		if(areUnexpectedProps && modelProps.has('info')
			&& 'info' in result === false) {
			result.info = unexpected;
		}

		return result;
	}


	static convertToTableColumns(props, modelProps) {
		const record = {};
		const unexpected = {};
		let areUnexpectedProps = false;

		Object.entries(props).forEach(([prop, value]) => {
			if(modelProps.has(prop)) {
				if(prop in staticIdsProps) {
					value = staticIdsProps[prop].convert(value);
					if(value === undefined) {
						throw new HttpError(
							400,
							`Invalid value: ${value} for property '${prop}'`,
						);
					}
					prop = staticIdsProps[prop].propName;
				}
				record[snakeCasedProps[prop] || prop] = value;
			} else {
				unexpected[prop] = value;
				areUnexpectedProps = true;
			}
		});

		if(areUnexpectedProps && modelProps.has('info')
			&& 'info' in record === false) {
			record.info = unexpected;
		}

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


	toJSON() { return this; }
}


export default AbstractModel;
