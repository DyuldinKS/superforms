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
				`should be a valid Rights object created from '${r.string}'`,
				() => {
					const rights = new Rights(r.string);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});

		correct.forEach((r) => {
			it(
				`should be a valid Rights object created from [${r.array}]`,
				() => {
					const rights = new Rights(r.array);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});

		correctEncoded.forEach((enc) => {
			it(
				`should be a valid Rights object created from ${enc}`,
				() => {
					const rights = new Rights(enc);
					expect(rights.isValid()).to.be.equal(true);
				},
			);
		});


		Object.entries({
			incomplite,
			invalid,
			overflowingEncoded,
			overflowingDecoded,
		}).forEach(([category, rights]) => {
			it(
				`should be an invalid Rights object created from all ${category} rights`,
				() => {
					rights.forEach((r) => {
						expect(new Rights(r).isValid()).to.be.equal(false);
					});
				},
			);
		});
	});


	describe('.toInt()', () => {
		correct.forEach((r) => {
			it(`should return required valid: ${r.number}`, () => {
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

		Object.entries({
			incomplite,
			invalid,
			overflowingDecoded,
		}).forEach(([category, rights]) => {
			it(
				`should return null for all ${category} rights`,
				() => {
					rights.forEach((r) => {
						expect(new Rights(r).toInt()).to.be.equal(null);
					});
				},
			);
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

		it(
			'should return valid rights string for all correctEncoded rights',
			() => {
				correctEncoded.forEach((enc) => {
					expect(new Rights(enc).toString()).to.be.a('string')
						.and.have.length(Rights._actions.length);
				});
			},
		);

		Object.entries({
			incomplite,
			invalid,
			overflowingEncoded,
			overflowingDecoded,
		}).forEach(([category, rights]) => {
			it(`should return null for all ${category} rights`, () => {
				rights.forEach((r) => {
					const result = null;
					expect(new Rights(r).toString()).to.be.equal(result);
				});
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

		Object.entries({
			incomplite,
			invalid,
			overflowingEncoded,
			overflowingDecoded,
		}).forEach(([category, rights]) => {
			it(`should return null for all ${category} rights`, () => {
				rights.forEach((r) => {
					const result = null;
					expect(new Rights(r).toArray()).to.be.equal(result);
				});
			});
		});
	});


	describe('.getScope()', () => {
		it(
			'should return scope in required form for all correctEncoded rights',
			() => {
				correctEncoded.forEach((enc) => {
					const rights = new Rights(enc);
					Rights._actions.forEach((action) => {
						expect(rights.getScope(action)).to.be.a('number');
						expect(rights.getScope(action, 'int')).to.be.a('number');
						expect(rights.getScope(action, 'short')).to.be.a('string')
							.and.have.length(1);
						expect(rights.getScope(action, 'full')).to.be.a('string');
					});
				});
			},
		);

		it(
			'should return required scope in integer form',
			() => {
				correct.forEach((r) => {
					Rights._actions.forEach((action, i) => {
						const rights = new Rights(r.number);
						const intRes = +Rights._unshiftWithZeros(rights.toInt())
							.toString()[Rights._actions.indexOf(action)];

						expect(rights.getScope(action)).to.be.equal(intRes)
							.and.to.be.equal(rights.getScope(action, 'int'))
							.and.to.be.equal(rights.getScope(i))
							.and.to.be.equal(rights.getScope(i, 'int'));
					});
				});
			},
		);

		it(
			'should return required scope in short form',
			() => {
				correct.forEach((r) => {
					Rights._actions.forEach((action, i) => {
						const rights = new Rights(r.number);
						const shortRes = r.string[Rights._actions.indexOf(action)];

						expect(rights.getScope(action, 'short')).to.be.equal(shortRes)
							.and.to.be.equal(rights.getScope(i, 'short'));
					});
				});
			},
		);

		it(
			'should return required scope in full form',
			() => {
				correct.forEach((r) => {
					Rights._actions.forEach((action, i) => {
						const rights = new Rights(r.number);
						const fullRes = r.array[Rights._actions.indexOf(action)];

						expect(rights.getScope(action, 'full')).to.be.equal(fullRes)
							.and.to.be.equal(rights.getScope(i, 'full'));
					});
				});
			},
		);

		Object.entries({
			incomplite,
			invalid,
			overflowingDecoded,
		}).forEach(([category, rightsList]) => {
			it(
				`should return null for all ${category} rights`,
				() => {
					rightsList.forEach((r) => {
						const result = null;
						const rights = new Rights(r);
						Rights._actions.forEach((action) => {
							expect(rights.getScope(action)).to.be.equal(result);
							expect(rights.getScope(action, 'int')).to.be.equal(result);
							expect(rights.getScope(action, 'short')).to.be.equal(result);
						});
					});
				},
			);
		});
	});
});
