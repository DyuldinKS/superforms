// is finite number
const isNumber = n => typeof n === 'number' && Number.isFinite(n);

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

// returns true if string/array/object is empty
const isEmpty = obj => (
	(isObject(obj) && Object.keys(obj).length === 0)
	|| ((isString(obj) || isArray(obj)) && obj.length === 0)
);


export {
	isNumber,
	isString,
	isFunction,
	isArray,
	isObject,
	isDate,
	isEmpty,
};
