import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import Org from 'Server/models/Org';
// import Response from 'Server/models/Response';
import { can } from 'Server/utils/access';
import { orgs as o, users as u, entityFactory } from './setup';

const { expect } = chai;


describe('organization access', () => {

	describe('to create organization', () => {
		// not created yet
		const props = {
			'n0': { email: 'org@0', parentId: null, info: { 19: 84 } },
			'n1': { email: 'org@1', parentId: 1, info: {} },
			'n2': { email: 'org@2', parentId: 2, info: {} },
			'n3': { email: 'new@3', parentId: 3, info: {} },
			'n4': { email: 'new@4', parentId: 4, info: {} },
		}

		const newOrgs = entityFactory.create('org')(props);
		const creatableInSubtree = ['n1', 'n2', 'n3', 'n4'];
		const creatable = ['n0', ...creatableInSubtree]

		describe('root', () => {
			it('can create org in subtree', () => {
				// all for root in first org
				assert(creatableInSubtree.every(id => (
					can(u['1.1']).create(newOrgs[id], props[id])))
				);

				// inferior for root in third org
				assert(can(u['3.1']).create(newOrgs['n3'], props['n3']));
				assert(can(u['3.1']).create(newOrgs['n4'], props['n4']));
			});

			it('can not create org outside subtree', () => {
				assert(can(u['1.1']).create(newOrgs['n0'], props['n0']) === false);

				assert(can(u['3.1']).create(newOrgs['n1'], props['n1']) === false);
				assert(can(u['3.1']).create(newOrgs['n2'], props['n2']) === false);
			});

			it('can not create org with invalid props', () => {
				assert(can(u['1.1']).create(newOrgs['n3'], {}) === false);
				assert(can(u['1.1']).create(newOrgs['n1'], ['email', 'created']) === false);
			});
		});

		describe('admin', () => {
			it('can not create any org', () => {
				assert(
					[u['1.2'], u['3.2'], u['4.2']].every(user => (
						// all orgs
						creatable.every(id => !can(user).create(newOrgs[id], { /* any props */ }))
					)),
				);
			});
		});

		describe('user', () => {
			it('can not create any org', () => {
				assert(
					// all simple users
					[u['1.3'], u['3.3'], u['4.3']].every(user => (
						// all orgs
						creatable.every(id => !can(user).create(newOrgs[id], { /* any props */ }))
					)),
				);
			});
		});
	});


	const allInSubtree = Object.values(o);

	describe('to read sections of organization', () => {
		const sections = ['info', 'orgs', 'users', 'forms', 'settings'];

		describe('root', () => {
			it('can read any section of any org in subtree', () => {
				// all for root in first org
				assert(allInSubtree.every((org) => (
					can(u['1.1']).read(org)))
				);

				// inferior for root in third org
				assert(can(u['3.1']).read(o[3]));
				assert(can(u['3.1']).read(o[4]));
			});

			it('can not read org outside subtree', () => {
				// parent and sibling for third org
				assert(can(u['3.1']).read(o[1]) === false);
				assert(can(u['3.1']).read(o[2]) === false);
			});
		});

		describe('admin', () => {
			it('can read any section of his org', () => {
				assert(can(u['1.2']).read(o[1]));
				assert(can(u['3.2']).read(o[3]));
				assert(can(u['4.2']).read(o[4]));
			});

			it('can not read other orgs', () => {
				assert(can(u['1.2']).read(o[2]) === false);

				assert(can(u['3.2']).read(o[1]) === false);
				assert(can(u['3.2']).read(o[2]) === false);
				assert(can(u['3.2']).read(o[4]) === false);
			});
		});

		describe('user', () => {
			const available = ['forms'];
			const notAvailable = sections.filter(s => !available.includes(s));

			it('can read \'forms\' section of his org', () => {
				assert(can(u['1.3']).read(o[1], { section: 'forms' }));
				assert(can(u['3.3']).read(o[3], { section: 'forms' }));
				assert(can(u['4.3']).read(o[4], { section: 'forms' }));
			});

			it('can not read other sections of his org', () => {
				// section is not defined
				assert.equal(can(u['1.3']).read(o[1]), false);
				// other sections
				assert(notAvailable.every(section => (
					!can(u['1.3']).read(o[1], { section })),
				));
			});

			it('can not read other orgs', () => {
				// section is not defined
				assert([2, 3, 4].every(id => !can(u['1.3']).read(o[id])));

				// check not available sections of other orgs for u['1.3']
				assert(
					[2, 3, 4].every(id => (
						notAvailable.every(section => (
							!can(u['1.3']).read(o[id], { section })),
						)
					))
				);

				// check not available sections of other orgs for u['1.3']
				assert(
					[1, 2, 4].every(id => (
						notAvailable.every(section => (
							!can(u['3.3']).read(o[id], { section })),
						)
					))
				)
			});
		});
	});


	describe('to update organization', () => {
		// props to update org of the user
		const updatableInHisOrg = { email: 'new@', info: 'updated' };
		// props to update other orgs in subtree
		const allUpdatable = { email: 'new@', active: true, info: 'updated' };

		describe('root', () => {
			it('can update his org', () => {
				assert(can(u['1.1']).update(o[1], updatableInHisOrg));
				assert(can(u['1.1']).update(o[1], { /* any props */ }));
				assert(can(u['1.1']).update(o[1], { info: 'only new info' }));
				assert(can(u['3.1']).update(o[3], updatableInHisOrg));
				assert(can(u['3.1']).update(o[3], { email: 'only.new.email' }));
			});

			it('can update org in subtree', () => {
				// org subtree

				assert(can(u['1.1']).update(o[2], allUpdatable));
				assert(can(u['1.1']).update(o[3], allUpdatable));
				assert(can(u['1.1']).update(o[4], allUpdatable));
				assert(can(u['3.1']).update(o[4], allUpdatable));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(u['3.1']).update(o[3], allUpdatable), false);
				assert.equal(can(u['1.1']).update(o[4], { parentId: 12 }),false);
				assert.equal(can(u['1.1']).update(o[4], { ...allUpdatable, custom: true }), false);
			});

			it('can not update org outside subtree', () => {
				assert.equal(can(u['3.1']).update(o[1], { /* any props */ }), false);
				assert.equal(can(u['3.1']).update(o[2], { /* any props */ }), false);
			});
		});

		describe('admin', () => {
			it('can update email and info his org', () => {
				assert(can(u['1.2']).update(o[1], { info: 'some new info' }));
				assert(can(u['3.2']).update(o[3], updatableInHisOrg));
				assert(can(u['3.2']).update(o[3], { email: 'only.new.email' }));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(u['3.2']).update(o[3], allUpdatable), false);
				assert.equal(can(u['1.2']).update(o[1], { parentId: 12 }),false);
				assert.equal(can(u['1.2']).update(o[1], { ...allUpdatable, custom: true }), false);
			});

			it('can not update org in subtree', () => {
				// org subtree
				assert.equal(can(u['1.2']).update(o[2], { /* any props */ }), false);
				assert.equal(can(u['3.2']).update(o[4], { /* any props */ }), false);
			});

			it('can not update org outside subtree', () => {
				// org subtree
				assert.equal(can(u['3.2']).update(o[2], { /* any props */ }), false);
				assert.equal(can(u['3.2']).update(o[1], { /* any props */ }), false);
				assert.equal(can(u['4.2']).update(o[1], { /* any props */ }), false);
			});
		});

		describe('user', () => {
			it('can not update any org', () => {
				assert.equal(can(u['3.3']).update(o[1], { /* any props */ }), false);
				assert.equal(can(u['3.3']).update(o[2], { /* any props */ }), false);
				assert.equal(can(u['3.3']).update(o[3], { /* any props */ }), false);
				assert.equal(can(u['3.3']).update(o[4], { /* any props */ }), false);
			});
		});
	})
});
