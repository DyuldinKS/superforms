import assert from 'assert';
import {
	isNumber,
	isString,
	isFunction,
	isArray,
	isObject,
	isDate,
	len,
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
		compObj: {
			a: 'this is',
			b: 'large and compound',
			c: 'object',
			d: this.obj,
		},
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
			assert(isArray(all.emptyArr));
		});

		it('should return false for all except arrays', () => {
			assert(except(['arr', 'emptyArr']).every(arg => !isArray(arg)))
		});
	});


	describe('isObject()', () => {
		it('should return true for Object direct instance', () => {
			assert(isObject(all.obj));
			assert(isObject(all.compObj));
			assert(isObject(all.emptyObj));
		});

		const objects = ['obj', 'emptyObj', 'compObj'];
		it('should return false for all except plain objects', () => {
			assert(except(objects).every(arg => !isObject(arg)))
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


	describe('len()', () => {
		it('should return number of keys for objects', () => {
			assert(len(all.obj) === 1);
			assert(len(all.emptyObj) === 0);
			assert(len(all.compObj) === 4);

		});

		it('should return length of arrays', () => {
			assert(len(all.arr) === all.arr.length);
			assert(len(all.emptyArr) === all.emptyArr.length);
		});

		it('should return length of strings', () => {
			assert(len(all.str) === all.str.length);
			assert(len(all.emptyStr) === all.emptyStr.length);
		});

		const iterable = [
			'obj', 'compObj', 'emptyObj',
			'arr', 'emptyArr',
			'str', 'emptyStr',
		];
		iterable.forEach(key => console.log(key, len(all[key])))
		it('should return undefined for non-iterable instances', () => {
			assert(except(iterable).every(arg => len(arg) === undefined));
		})
	})


	describe('isEmpty()', () => {
		const empty = ['emptyObj', 'emptyStr', 'emptyArr']

		it('should return true for empty object, string and array', () => {
			assert(empty.every(key => isEmpty(all[key])));
		});

		it('should return false for non empty objects', () => {
			assert(except(empty).every(arg => !isEmpty(arg)));
		});
	});
})