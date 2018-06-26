
const isBool = b => typeof b === 'boolean';
// is finite number
const isNumber = n => typeof n === 'number' && Number.isFinite(n);
const isNatural = n => Number.isSafeInteger(n) && n > 0;

const isString = s => typeof s === 'string';
const isFunction = f => typeof f === 'function';
const isArray = arr => Array.isArray(arr);

// returns true if arg is simple object (direct instance of Object) else false
const isObject = obj => (
	obj && Object.prototype.toString.call(obj) === '[object Object]'
);

// returns true if arg is valid date else false
const isDate = d => (
	d && Object.prototype.toString.call(d) === '[object Date]'
		&& !Number.isNaN(d.getTime())
);


// return length of string/array/Object.keys
const len = (arg) => {
	if(isObject(arg)) return Object.keys(arg).length;
	if(isString(arg) || isArray(arg)) return arg.length;
	return undefined;
};

// returns true if string/array/object is empty
const isEmpty = obj => len(obj) === 0;


// find object value by path
const deepFind = (obj, path) => {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length; i += 1) {
		if (keys[i] in current) {
			current = current[keys[i]];
		} else {
			return undefined;
		}
	}
	return current;
};


export {
	isBool,
	isNumber,
	isNatural,
	isString,
	isFunction,
	isArray,
	isObject,
	isDate,
	len,
	isEmpty,
	deepFind,
};
