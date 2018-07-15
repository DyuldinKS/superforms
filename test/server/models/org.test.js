import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import AbstractModel from 'Server/models/AbstractModel';
import Recipient from 'Server/models/Recipient';
import Org from 'Server/models/Org';
import db from 'Server/db';

const { expect } = chai;


describe('Org model', () => {
	const author = { id: 1 };

	it('should be instance of Org, Recipient and AbstractModel', () => {
		const org = new Org({});
		assert(org instanceof Org);
		assert(org instanceof Recipient);
		assert(org instanceof AbstractModel);
		assert.deepStrictEqual(org.props, Org.prototype.props);
	});


	describe('assign()', () => {
		const initial = {
			email: 'admissions@mit.edu',
			info: { fullName: 'Massachusetts Institute of Technology', label: 'MIT' },
			parentId: 287,
		};
		const unwanted = { invalid: true, some: 'trash' };

		it('should filter out all unwanted props on creation', () => {
			const org = new Org({ ...initial, ...unwanted });
			assert.deepStrictEqual({ ...org }, initial);
		});

		it('should assign only allowable props', () => {
			const org = new Org({});
			org.assign(initial);
			org.assign(unwanted);
			assert.deepStrictEqual({ ...org }, initial);
		});
	})

	
	describe('update()', () => {
		beforeEach(() => sinon.stub(db, 'query').resolves({}));

		afterEach(() => db.query.restore());

		it('should update only writable props', () => {
			const org = new Org({ id: 13 });
			// props that can be updated
			const writable = {
				email: 'w@mc.com',
				info: { fullName: 'Massachusetts Institute of Technology', label: 'MIT' },
				active: false,
				deleted: new Date(),
			};
			// props that can not be updated
			const unwritable = {
				id: 14,
				type: 'rcpt',
				parentId: 111,
			};

			// pass all props
			const props = { ...writable, ...unwritable };

			return org.update({ props, author })
				.then(() => {
					assert(db.query.calledOnce === true);
					const [query, [id, updatedProps, authorId]] = db.query.firstCall.args;
					assert(query.includes('update_org'));
					assert(id === 13);
					assert(authorId === author.id);

					const result = { ...writable };
					assert.deepStrictEqual(updatedProps, result);
				});
		});
	});

	describe('toJSON()', () => {
		it('should convert to json only readable props', () => {
			const json = { id: 13, email: 'w@mc.com', parentId: 187 };
			const org = new Org(json);

			assert.deepStrictEqual(org.toJSON(), json);
		});


		it('should unnest info prop for client', () => {
			const initial = {
				email: 'admissions@mit.edu',
				info: { fullName: 'Massachusetts Institute of Technology', label: 'MIT' },
				parentId: 287,
			};
			const org = new Org(initial);
			const { info, ...rest } = initial;

			assert.deepStrictEqual(org.toJSON(), { ...info, ...rest });
		});
	})
});
