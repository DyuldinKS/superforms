import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import User from 'Server/models/User';
// import Response from 'Server/models/Response';
import { can } from 'Server/utils/access';
import buildRoles from 'Server/utils/roles';
import rules from 'Server/utils/accessRules';
import { orgs, users, parentsByOrg } from './setup';

const { expect } = chai;

const roles = buildRoles(rules);

describe('organization access', () => {

	const { org1, org2, org3, org4 } = orgs;
	const {
		user11, user12, user13, user31, user32, user33, user42, user43
	} = users;

	const allInSubtree = [org1, org2, org3, org4];

	describe('to create user', () => {
		const props = {
			'1.1': { email: 'new@1.1', orgId: 1, role: 'root', info: {} },
			'1.2': { email: 'new@2.3', orgId: 2, role: 'user', info: {} },
			'3.1': { email: 'new@3.1', orgId: 3, role: 'root', info: {} },
			'3.2': { email: 'new@3.2', orgId: 3, role: 'admin', info: {} },
			'3.3': { email: 'new@3.3', orgId: 3, role: 'user', info: {} },
			'4.2': { email: 'new@4.2', orgId: 4, role: 'admin', info: {} },
			'4.3': { email: 'new@4.3', orgId: 4, role: 'user', info: {} },
		};

		const newUsers = Object.entries(props).reduce(
			(acc, [key, values]) => {
				const { orgId } = values;
				acc[key] = new User({
					...values,
					parentOrgIds: [...parentsByOrg[orgId], orgId],
				});

				return acc;
			},
			{},
		);

		describe('root', () => {
			it('can create any user in subtree', () => {
				assert(Object.keys(props).every(id => (
					can(user11).create(newUsers[id], props[id]))
				));

				assert(['3.1', '3.2', '3.3', '4.2', '4.3'].every(id => (
					can(user31).create(newUsers[id], props[id])
				)))
			})

			it('can not create users outside subtree', () => {
				assert(['1.1', '1.2'].every(id => (
					!can(user31).create(newUsers[id], props[id])
				)));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(user11).create(newUsers['1.1'], {}), false);
				assert.equal(can(user11).create(newUsers['4.2'], ['email', 'orgId']), false);
				assert.equal(can(user11).create(newUsers['3.3'], ['some', 'trash']), false);
			});
		});

		describe('admin', () => {
			it('can create any user within his org except root', () => {
				assert(can(user12).create(newUsers['1.2'], props['1.2']);

				assert(can(user12).create(newUsers['1.2'], props['1.2']);
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


	// describe('to read sections of organization', () => {
	// 	const sections = ['info', 'orgs', 'users', 'forms', 'settings'];

	// 	describe('root', () => {
	// 		it('can read any section of any org in subtree', () => {
	// 			// all for root in first org
	// 			assert(allInSubtree.every((org) => (
	// 				can(user11).read(org)))
	// 			);

	// 			// inferior for root in third org
	// 			assert(can(user31).read(org3));
	// 			assert(can(user31).read(org4));
	// 		});

	// 		it('can not read org outside subtree', () => {
	// 			// parent and sibling for third org
	// 			assert(can(user31).read(org1) === false);
	// 			assert(can(user31).read(org2) === false);
	// 		});
	// 	});

	// 	describe('admin', () => {
	// 		it('can read any section of his org', () => {
	// 			assert(can(user12).read(org1));
	// 			assert(can(user32).read(org3));
	// 			assert(can(user42).read(org4));
	// 		});

	// 		it('can not read other orgs', () => {
	// 			assert(can(user12).read(org2) === false);

	// 			assert(can(user32).read(org1) === false);
	// 			assert(can(user32).read(org2) === false);
	// 			assert(can(user32).read(org4) === false);
	// 		});
	// 	});

	// 	describe('user', () => {
	// 		const available = ['forms'];
	// 		const notAvailable = sections.filter(s => !available.includes(s));

	// 		it('can read \'forms\' section of his org', () => {
	// 			assert(can(user13).read(org1, { section: 'forms' }));
	// 			assert(can(user33).read(org3, { section: 'forms' }));
	// 			assert(can(user43).read(org4, { section: 'forms' }));
	// 		});

	// 		it('can not read other sections of his org', () => {
	// 			// section is not defined
	// 			assert.equal(can(user13).read(org1), false);
	// 			// other sections
	// 			assert(notAvailable.every(section => (
	// 				!can(user13).read(org1, { section })),
	// 			));
	// 		});

	// 		it('can not read other orgs', () => {
	// 			// section is not defined
	// 			assert([org2, org3, org4].every(org => !can(user13).read(org)));

	// 			// check not available sections of other orgs for user13
	// 			assert(
	// 				[org2, org3, org4].every(org => (
	// 					notAvailable.every(section => (
	// 						!can(user13).read(org, { section })),
	// 					)
	// 				))
	// 			);

	// 			// check not available sections of other orgs for user13
	// 			assert(
	// 				[org1, org2, org4].every(org => (
	// 					notAvailable.every(section => (
	// 						!can(user33).read(org, { section })),
	// 					)
	// 				))
	// 			)
	// 		});
	// 	});
	// });


	// describe('to update organization', () => {
	// 	// props to update org of the user
	// 	const updatableInHisOrg = { email: 'new@', info: 'updated' };
	// 	// props to update other orgs in subtree
	// 	const allUpdatable = { email: 'new@', active: true, info: 'updated' };

	// 	describe('root', () => {
	// 		it('can update his org', () => {
	// 			assert(can(user11).update(org1, updatableInHisOrg));
	// 			assert(can(user11).update(org1, { /* any props */ }));
	// 			assert(can(user11).update(org1, { info: 'only new info' }));
	// 			assert(can(user31).update(org3, updatableInHisOrg));
	// 			assert(can(user31).update(org3, { email: 'only.new.email' }));
	// 		});

	// 		it('can update org in subtree', () => {
	// 			// org subtree

	// 			assert(can(user11).update(org2, allUpdatable));
	// 			assert(can(user11).update(org3, allUpdatable));
	// 			assert(can(user11).update(org4, allUpdatable));
	// 			assert(can(user31).update(org4, allUpdatable));
	// 		});

	// 		it('can not update org with invalid props', () => {
	// 			// all props for user's organization
	// 			assert.equal(can(user31).update(org3, allUpdatable), false);
	// 			assert.equal(can(user11).update(org4, { parentId: 12 }),false);
	// 			assert.equal(can(user11).update(org4, { ...allUpdatable, custom: true }), false);
	// 		});

	// 		it('can not update org outside subtree', () => {
	// 			assert.equal(can(user31).update(org1, { /* any props */ }), false);
	// 			assert.equal(can(user31).update(org2, { /* any props */ }), false);
	// 		});
	// 	});

	// 	describe('admin', () => {
	// 		it('can update email and info his org', () => {
	// 			assert(can(user12).update(org1, { info: 'some new info' }));
	// 			assert(can(user32).update(org3, updatableInHisOrg));
	// 			assert(can(user32).update(org3, { email: 'only.new.email' }));
	// 		});

	// 		it('can not update org with invalid props', () => {
	// 			// all props for user's organization
	// 			assert.equal(can(user32).update(org3, allUpdatable), false);
	// 			assert.equal(can(user12).update(org1, { parentId: 12 }),false);
	// 			assert.equal(can(user12).update(org1, { ...allUpdatable, custom: true }), false);
	// 		});

	// 		it('can not update org in subtree', () => {
	// 			// org subtree
	// 			assert.equal(can(user12).update(org2, { /* any props */ }), false);
	// 			assert.equal(can(user32).update(org4, { /* any props */ }), false);
	// 		});

	// 		it('can not update org outside subtree', () => {
	// 			// org subtree
	// 			assert.equal(can(user32).update(org2, { /* any props */ }), false);
	// 			assert.equal(can(user32).update(org1, { /* any props */ }), false);
	// 			assert.equal(can(user42).update(org1, { /* any props */ }), false);
	// 		});
	// 	});

	// 	describe('user', () => {
	// 		it('can not update any org', () => {
	// 			assert.equal(can(user33).update(org1, { /* any props */ }), false);
	// 			assert.equal(can(user33).update(org2, { /* any props */ }), false);
	// 			assert.equal(can(user33).update(org3, { /* any props */ }), false);
	// 			assert.equal(can(user33).update(org4, { /* any props */ }), false);
	// 		});
	// 	});
	// })
		
	// forms
	// responses
});
