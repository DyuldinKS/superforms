import consts from './constants.json';

class ConstTable {
	constructor(tableName, values) {
		this.values = values;
		this.name = tableName;
	}
	getValue(id) {
		return typeof id === 'number'
			? Object.keys(this.values).find(key => this.values[key] === id)
			: undefined;
	}
	getId(value) {
		return typeof value === 'string' ? this.values[value] : undefined;
	}
}

const stored = {};
Object.entries(consts).forEach(([table, values]) => {
	stored[table] = new ConstTable(table, values);
});

export default stored;
