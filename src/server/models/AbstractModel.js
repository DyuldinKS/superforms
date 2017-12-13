import convertedProps from './convertedProps';


class AbstractModel {
	// ***************** INSTANCE METHODS ***************** //

	constructor(instance) {
		if(instance) {
			this.assign(instance);
		}
	}


	assign(instance) {
		if(!instance) return null;

		let converted;
		Object.keys(instance).forEach((prop) => {
			converted = convertedProps.toCamelCase[prop] || prop;
			if(this.props.has(converted)) {
				this[converted] = instance[prop];
			}
		});

		return this;
	}


	convertToSchema(props) {
		const pgProps = {};
		Object.keys(props).forEach((prop) => {
			if(this.props.has(prop)) {
				pgProps[convertedProps.toSnakeCase[prop] || prop] = props[prop];
			}
		});
		return pgProps;
	}


	save() { throw new Error(`The \'save\' method of ${this} must be implemented`); }
	toJSON() { return JSON.stringify(this); }
}


export default AbstractModel;
