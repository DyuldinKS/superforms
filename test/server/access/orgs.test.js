import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import Org from 'Server/models/Org';
// import Response from 'Server/models/Response';
import { can } from 'Server/utils/access';
import { orgs, users } from './setup';

const { expect } = chai;


describe('organization access', () => {

	const { org1, org2, org3, org4 } = orgs;
	const {
		user11, user12, user13, user31, user32, user33, user42, user43
	} = users;

	const allInSubtree = [org1, org2, org3, org4];

	describe('to create organization', () => {
		// not created yet
		const props0 = { email: 'org0', parentId: null, info: { 19: 84 }};
		const org0 = new Org({ ...props0, parentOrgIds: [] })

		const props10 = { email: 'org@1.0', parentId: 1, info: {} };
		const org10 = new Org({ ...props10, parentOrgIds: [1] });

		const props20 = { email: 'org@2.0', parentId: 2, info: {} };
		const org20 = new Org({ ...props20, parentOrgIds: [1, 2] }); 

		const props30 = { email: 'new@3.0', parentId: 3, info: {} };
		const org30 = new Org({ ...props30, parentOrgIds: [1, 3] }); 

		const props40 = { email: 'new@4.0', parentId: 4, info: {} };
		const org40 = new Org({ ...props40, parentOrgIds: [1, 3, 4] });

		const creatableInSubtree = [
			[org10, props10],
			[org20, props20],
			[org30, props30],
			[org40, props40],
		];

		const creatable = [
			...creatableInSubtree,
			[org0, props0],
		];

		describe('root', () => {
			it('can create org in subtree', () => {
				// all for root in first org
				assert(creatableInSubtree.every(([org, props]) => (
					can(user11).create(org, props)))
				);

				// inferior for root in third org
				assert(can(user31).create(org30, props30));
				assert(can(user31).create(org40, props40));
			});

			it('can not create org outside subtree', () => {
				assert(can(user11).create(org0, props0) === false);

				assert(can(user31).create(org10, props10) === false);
				assert(can(user31).create(org20, props20) === false);
			});

			it('can not create org with invalid props', () => {
				assert(can(user11).create(org30, {}) === false);
				assert(can(user11).create(org10, ['email', 'created']) === false);
			});
		});

		describe('admin', () => {
			it('can not create any org', () => {
				assert(
					[user12, user32, user42].every(user => (
						// all orgs
						creatable.every(([org]) => !can(user).create(org, { /* any props */ }))
					)),
				);
			});
		});

		describe('user', () => {
			it('can not create any org', () => {
				assert(
					// all simple users
					[user13, user33, user43].every(user => (
						// all orgs
						creatable.every(([org]) => !can(user).create(org, { /* any props */ }))
					)),
				);
			});
		});
	});


	describe('to read sections of organization', () => {
		const sections = ['info', 'orgs', 'users', 'forms', 'settings'];

		describe('root', () => {
			it('can read any section of any org in subtree', () => {
				// all for root in first org
				assert(allInSubtree.every((org) => (
					can(user11).read(org)))
				);

				// inferior for root in third org
				assert(can(user31).read(org3));
				assert(can(user31).read(org4));
			});

			it('can not read org outside subtree', () => {
				// parent and sibling for third org
				assert(can(user31).read(org1) === false);
				assert(can(user31).read(org2) === false);
			});
		});

		describe('admin', () => {
			it('can read any section of his org', () => {
				assert(can(user12).read(org1));
				assert(can(user32).read(org3));
				assert(can(user42).read(org4));
			});

			it('can not read other orgs', () => {
				assert(can(user12).read(org2) === false);

				assert(can(user32).read(org1) === false);
				assert(can(user32).read(org2) === false);
				assert(can(user32).read(org4) === false);
			});
		});

		describe('user', () => {
			const available = ['forms'];
			const notAvailable = sections.filter(s => !available.includes(s));

			it('can read \'forms\' section of his org', () => {
				assert(can(user13).read(org1, { section: 'forms' }));
				assert(can(user33).read(org3, { section: 'forms' }));
				assert(can(user43).read(org4, { section: 'forms' }));
			});

			it('can not read other sections of his org', () => {
				// section is not defined
				assert.equal(can(user13).read(org1), false);
				// other sections
				assert(notAvailable.every(section => (
					!can(user13).read(org1, { section })),
				));
			});

			it('can not read other orgs', () => {
				// section is not defined
				assert([org2, org3, org4].every(org => !can(user13).read(org)));

				// check not available sections of other orgs for user13
				assert(
					[org2, org3, org4].every(org => (
						notAvailable.every(section => (
							!can(user13).read(org, { section })),
						)
					))
				);

				// check not available sections of other orgs for user13
				assert(
					[org1, org2, org4].every(org => (
						notAvailable.every(section => (
							!can(user33).read(org, { section })),
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
				assert(can(user11).update(org1, updatableInHisOrg));
				assert(can(user11).update(org1, { /* any props */ }));
				assert(can(user11).update(org1, { info: 'only new info' }));
				assert(can(user31).update(org3, updatableInHisOrg));
				assert(can(user31).update(org3, { email: 'only.new.email' }));
			});

			it('can update org in subtree', () => {
				// org subtree

				assert(can(user11).update(org2, allUpdatable));
				assert(can(user11).update(org3, allUpdatable));
				assert(can(user11).update(org4, allUpdatable));
				assert(can(user31).update(org4, allUpdatable));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(user31).update(org3, allUpdatable), false);
				assert.equal(can(user11).update(org4, { parentId: 12 }),false);
				assert.equal(can(user11).update(org4, { ...allUpdatable, custom: true }), false);
			});

			it('can not update org outside subtree', () => {
				assert.equal(can(user31).update(org1, { /* any props */ }), false);
				assert.equal(can(user31).update(org2, { /* any props */ }), false);
			});
		});

		describe('admin', () => {
			it('can update email and info his org', () => {
				assert(can(user12).update(org1, { info: 'some new info' }));
				assert(can(user32).update(org3, updatableInHisOrg));
				assert(can(user32).update(org3, { email: 'only.new.email' }));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(user32).update(org3, allUpdatable), false);
				assert.equal(can(user12).update(org1, { parentId: 12 }),false);
				assert.equal(can(user12).update(org1, { ...allUpdatable, custom: true }), false);
			});

			it('can not update org in subtree', () => {
				// org subtree
				assert.equal(can(user12).update(org2, { /* any props */ }), false);
				assert.equal(can(user32).update(org4, { /* any props */ }), false);
			});

			it('can not update org outside subtree', () => {
				// org subtree
				assert.equal(can(user32).update(org2, { /* any props */ }), false);
				assert.equal(can(user32).update(org1, { /* any props */ }), false);
				assert.equal(can(user42).update(org1, { /* any props */ }), false);
			});
		});

		describe('user', () => {
			it('can not update any org', () => {
				assert.equal(can(user33).update(org1, { /* any props */ }), false);
				assert.equal(can(user33).update(org2, { /* any props */ }), false);
				assert.equal(can(user33).update(org3, { /* any props */ }), false);
				assert.equal(can(user33).update(org4, { /* any props */ }), false);
			});
		});
	})
		
	// forms
	// responses
});
