import {
	camelCasedProps,
	snakeCasedProps,
	staticValuesProps,
	staticIdsProps,
} from './convertedProps';
import { HttpError } from '../libs/errors';

// const { toCamelCase, toSnakeCase, toId } = convertedProps;


class AbstractModel {
	// ***************** INSTANCE METHODS ***************** //

	constructor(instance) {
		if(instance) {
			this.assign(instance);
		}
	}


	assign(instance) {
		if(!instance) return null;

		const unexpected = {};
		Object.entries(instance).forEach(([prop, value]) => {
			prop = camelCasedProps[prop] || prop;
			if(prop in staticValuesProps) {
				value = staticValuesProps[prop].convert(value);
				prop = staticValuesProps[prop].propName;
			}
			if(this.props.has(prop)) {
				this[prop] = value;
			} else {
				unexpected[prop] = value;
			}
			if(typeof this.info !== 'object') this.info = unexpected;
		});

		return this;
	}


	convertToPgSchema(props) {
		const pgProps = {};
		Object.entries(props).forEach(([prop, value]) => {
			if(this.props.has(prop)) {
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
				pgProps[snakeCasedProps[prop] || prop] = value;
			}
		});
		return pgProps;
	}


	save() { throw new Error(`The \'save\' method of ${this} must be implemented`); }
	toJSON() { return this; }
}


export default AbstractModel;
