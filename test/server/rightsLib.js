import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Rights from '../../src/server/libs/rights';

chai.use(chaiAsPromised);
const should = chai.should();
const { expect } = chai;

describe('Rights-class', () => {
	const correct = [
		{
			string: 'lepgn',
			number: 23140,
			array: ['local', 'enclosing', 'personal', 'global', 'none'],
		},
		{
			string: 'nnnnl',
			number: 2,
			array: ['none', 'none', 'none', 'none', 'local'],
		},
		{
			string: 'nngng',
			number: 404,
			array: ['none', 'none', 'global', 'none', 'global'],
		},
	];
	const correctEncoded = [2, 4432, 42.187, '12.21', [13, 0]];
	// 0 <= each_digit_of_encoded < Rights._actions.length
	const overflowingEncoded = [
		18.61,
		61,
		-3,
		313012,
		'239',
	];
	// (str || array).length === Rights._actions.length
	const overflowingDecoded = [
		'nlepgp',
		['local', 'enclosing', 'personal', 'global', 'none', 'personal'],
	];
	// (str || array).length === Rights._actions.length
	const incomplite = [
		'lnle',
		['local', 'global', 'none', 'personal'],
	];
	const invalid = [
		undefined,
		null,
		NaN,
		0,
		'some invalid rights',
		'nletq',
		{},
		{ 13: 37 },
		[],
		['yo', 'local'],
	];

	describe('.isValid()', () => {
		correct.forEach((r) => {
			it(
				'should be a valid Rights object created from correct rights string',
				() => {
					const rights = new Rights(r.string);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});

		correct.forEach((r) => {
			it(
				'should be a valid Rights object created from correct rights array',
				() => {
					const rights = new Rights(r.array);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});

		correctEncoded.forEach((item) => {
			it(
				'should be a valid Rights object created from correct rights number',
				() => {
					const rights = new Rights(item);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});

		[
			...incomplite,
			...invalid,
			...overflowingEncoded,
			...overflowingDecoded,
		].forEach((item) => {
			it(
				'should create an invalid Rights object',
				() => {
					const rights = new Rights(item);
					rights.should.be.instanceOf(Rights);
					expect(rights.isValid()).to.be.equal(false);
				},
			);
		});
	});

	describe('.toInt()', () => {
		correct.forEach((r) => {
			it(`should return required valid <number></number>: ${r.number}`, () => {
				new Rights(r.number).toInt().should.be.equal(r.number);
				new Rights(r.string).toInt().should.be.equal(r.number);
				new Rights(r.array).toInt().should.be.equal(r.number);
			});
		});

		correctEncoded.forEach((enc) => {
			const result = Number.parseInt(enc, 10);
			it(`should return valid number: ${result}`, () => {
				expect(new Rights(enc).toInt()).to.be.equal(result);
			});
		});

		overflowingEncoded.forEach((enc) => {
			const result = Number.parseInt(enc, 10);
			it(`should return invalid overflowing number: ${result}`, () => {
				expect(new Rights(enc).toInt()).to.be.equal(result);
			});
		});

		[...overflowingDecoded, ...incomplite, ...invalid].forEach((rights) => {
			const result = null;
			it(`should return invalid: ${result}`, () => {
				expect(new Rights(rights).toInt()).to.be.equal(result);
			});
		});
	});

	describe('.toString()', () => {
		correct.forEach((r) => {
			it(
				`should return required valid rights string: '${r.string}'`,
				() => {
					new Rights(r.number).toString().should.be.equal(r.string);
					new Rights(r.string).toString().should.be.equal(r.string);
					new Rights(r.array).toString().should.be.equal(r.string);
				},
			);
		});

		correctEncoded.forEach((enc) => {
			it('should return valid rights string', () => {
				expect(new Rights(enc).toString()).to.be.a('string')
					.and.have.length(Rights._actions.length);
			});
		});

		[
			...incomplite,
			...invalid,
			...overflowingEncoded,
			...overflowingDecoded,
		].forEach((rights) => {
			const result = null;
			it(`should return invalid: ${result}`, () => {
				expect(new Rights(rights).toString()).to.be.equal(result);
			});
		});
	});

	describe('.toArray()', () => {
		correct.forEach((r) => {
			it(`should return required valid array: [${r.array}]`, () => {
				new Rights(r.number).toArray().should.be.deep.equal(r.array);
				new Rights(r.string).toArray().should.be.deep.equal(r.array);
				new Rights(r.array).toArray().should.be.deep.equal(r.array);
			});
		});

		correctEncoded.forEach((enc) => {
			it('should return valid rights array:', () => {
				expect(new Rights(enc).toArray()).to.be.an('array')
					.and.have.length(Rights._actions.length);
			});
		});

		[
			...incomplite,
			...invalid,
			...overflowingEncoded,
			...overflowingDecoded,
		].forEach((rights) => {
			const result = null;
			it(`should return invalid: ${result}`, () => {
				expect(new Rights(rights).toArray()).to.be.equal(result);
			});
		});
	});
});
