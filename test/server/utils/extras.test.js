import assert from 'assert';
import {
	isNumber,
	isString,
	isFunction,
	isArray,
	isObject,
	isDate,
	isEmpty,
} from 'Server/utils/extras';


describe('Object Extras', () => {
	const all = {
		undef: undefined,
		null: null,
		nan: NaN,
		num: 813,
		int0: 0,
		float0: 0.00,
		inf: Infinity,
		str: 'hello world',
		emptyStr: '',
		func: () => { console.log('what should i do?'); },
		construnctedFunc: new Function(),
		arr: ['a', 'few', 'elems'],
		emptyArr: [],
		obj: { foo: 'baz' },
		emptyObj: {},
		date: new Date(),
		invDate: new Date('invalid date'),
		parsedDate: new Date('nope'),
	};


	const except = (exceptions) => (
		Object.keys(all)
			.filter(key => !exceptions.includes(key))
			.map(key => all[key])
	);


	describe('isNumber()', () => {
		it('should return true for 813, 0 and 0.00 as numbers', () => {
			assert(isNumber(all.num));
			assert(isNumber(all.int0));
			assert(isNumber(all.float0));
		});

		it('should return false for NaN, Infinity', () => {
			assert(isNumber(all.nan) === false);
			assert(isNumber(all.inf) === false);
		});

		it('should return false for all except number', () => {
			assert(except(['num', 'float0', 'int0']).every(arg => !isNumber(arg)))
		});
	});


	describe('isString()', () => {
		it('should return true for String direct instance', () => {
			assert(isString(all.str));
		});

		it('should return true for empty string', () => {
			assert(isString(all.emptyStr));
		});

		it('should return false for all except strings', () => {
			assert(except(['str', 'emptyStr']).every(arg => !isString(arg)))
		});
	});


	describe('isFunction()', () => {
		it('should return true for function', () => {
			assert(isFunction(all.func));
		});

		it('should return true for constructed function', () => {
			assert(isFunction(all.construnctedFunc));
		});

		it('should return false for all except funcs', () => {
			assert(except(['func', 'construnctedFunc']).every(arg => !isFunction(arg)))
		});
	});


	describe('isArray()', () => {
		it('should return true for Array direct instance', () => {
			assert(isArray(all.arr));
		});

		it('should return true for empty array', () => {
			assert(isArray(all.emptyArr));
		});

		it('should return false for all except arrays', () => {
			assert(except(['arr', 'emptyArr']).every(arg => !isArray(arg)))
		});
	});


	describe('isObject()', () => {
		it('should return true for Object direct instance', () => {
			assert(isObject(all.obj));
		});

		it('should return true for empty object', () => {
			assert(isObject(all.emptyObj));
		});

		it('should return false for all except plain objects', () => {
			assert(except(['obj', 'emptyObj']).every(arg => !isObject(arg)))
		});
	});


	describe('isDate()', () => {
		it('should return true for Date direct instance', () => {
			assert(isDate(all.date));
		});

		it('should return false for invalid Date', () => {
			assert(isDate(all.invDate) === false);
		});

		it('should return false for parsed invalid Date', () => {
			assert(isDate(all.parsedDate) === false);
		});

		it('should return false for all except plain objects', () => {
			assert(except(['date']).every(arg => !isDate(arg)))
		});
	});


	describe('isEmpty()', () => {
		const empty = ['emptyObj', 'emptyStr', 'emptyArr']

		it('should return true for empty object, string and array', () => {
			assert(empty.every(key => isEmpty(all[key])));
		});

		it('should return false for non empty objects', () => {
			assert(except(empty).every(arg => !isEmpty(all.obj)));
		});
	});
})