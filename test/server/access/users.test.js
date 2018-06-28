import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import User from 'Server/models/User';
// import Response from 'Server/models/Response';
import { can } from 'Server/utils/Access';
import buildRoles from 'Server/utils/roles';
import rules from 'Server/utils/accessRules';
import { users as u, parentsByOrg, entityFactory } from './setup';

const { expect } = chai;

const roles = buildRoles(rules);

describe('organization access', () => {

	describe('to create user', () => {
		const props = {
			'n1.1': { email: 'new@1.1', orgId: 1, role: 'root', info: {} },
			'n2.2': { email: 'new@2.3', orgId: 2, role: 'user', info: {} },
			'n3.1': { email: 'new@3.1', orgId: 3, role: 'root', info: {} },
			'n3.2': { email: 'new@3.2', orgId: 3, role: 'admin', info: {} },
			'n3.3': { email: 'new@3.3', orgId: 3, role: 'user', info: {} },
			'n4.2': { email: 'new@4.2', orgId: 4, role: 'admin', info: {} },
			'n4.3': { email: 'new@4.3', orgId: 4, role: 'user', info: {} },
		};

		const allNew = Object.keys(props);
		const newUsers = entityFactory.create('user')(props);


		describe('root', () => {
			it('can create any user in subtree', () => {
				assert(allNew.every(id => (
					can(u[1.1]).create(newUsers[id], props[id]))
				));

				assert(['n3.1', 'n3.2', 'n3.3', 'n4.2', 'n4.3'].every(id => (
					can(u[3.1]).create(newUsers[id], props[id])
				)))
			})

			it('can not create users outside subtree', () => {
				assert(['n1.1', 'n2.2'].every(id => (
					!can(u[3.1]).create(newUsers[id], props[id])
				)));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u[1.1]).create(newUsers['n1.1'], {}), false);
				assert.equal(can(u[1.1]).create(newUsers['n4.2'], ['email', 'orgId']), false);
				assert.equal(can(u[1.1]).create(newUsers['n3.3'], ['some', 'trash']), false);
			});
		});


		describe('admin', () => {
			it('can create any user within his org except root', () => {
				assert(can(u[3.2]).create(newUsers['n3.2'], props['n3.2']));
				assert(can(u[3.2]).create(newUsers['n3.3'], props['n3.3']));
	
				assert(can(u[4.2]).create(newUsers['n4.2'], props['n4.2']));
				assert(can(u[4.2]).create(newUsers['n4.3'], props['n4.3']));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u[3.2]).create(newUsers['n3.2'], {}), false);
				assert.equal(can(u[4.2]).create(newUsers['n4.3'], ['email', 'orgId']), false);
			});

			it('can not create root', () => {
				assert.equal(can(u[1.2]).create(newUsers['n1.1'], props['n1.1']), false);
				assert.equal(can(u[3.2]).create(newUsers['n3.1'], props['n3.1']), false);
			});

			it('can not create any user outside his org', () => {
				// for admin of 3rd org
				assert(['n1.1', 'n2.2', 'n4.2', 'n4.3'].every(id => (
					!can(u[3.2]).create(newUsers[id], props[id])
				)));

				// for admin of 4rd org
				assert(['n1.1', 'n2.2', 'n3.1', 'n3.2', 'n3.3'].every(id => (
					!can(u[4.2]).create(newUsers[id], props[id])
				)));
			})
		});


		describe('user', () => {
			it('can not create any user', () => {
				assert(
					[1.3, 3.3, 4.3]
						.map(id => u[id])
						.every(author => (
							allNew.every(id => !can(author).create(newUsers[id], props[id]))
						))
				);
			});
		});
	});


	const allInSubtree = Object.values(u);

	describe('to read sections of users', () => {
		const sections = ['info', 'forms', 'settings'];

		describe('root', () => {
			it('can read any section of any user in subtree', () => {
				// all for root in first org
				allInSubtree.forEach(usr => can(u[1.1]).read(usr));

				// inferior for root in 3rd org
				allInSubtree
					.filter(usr => usr.orgId >= 3)
					.forEach((usr) => {
						assert(can(u[3.1]).read(usr))
					})
			});

			it('can not read user outside subtree', () => {
				// parent and sibling for third org
				allInSubtree
					.filter(usr => usr.orgId < 3) // outside 3rd org subtree
					.forEach((usr) => {
						assert.equal(can(u[3.1]).read(usr, {}), false);
					})
			});
		});


		describe('admin', () => {
			it('can read any section of his own profile', () => {
				assert(can(u[1.2]).read(u[1.2]));
				assert(can(u[3.2]).read(u[3.2]));
				assert(can(u[4.2]).read(u[4.2]));
			});

			it('can read any section of his org users', () => {
				assert(can(u[1.2]).read(u[1.1]));
				assert(can(u[1.2]).read(u[1.3]));
				assert(can(u[3.2]).read(u[3.1]));
				assert(can(u[3.2]).read(u[3.3]));
				assert(can(u[4.2]).read(u[4.3]));
			});

			it('can NOT read users outside his org', () => {
				[1.2, 3.2, 4.2].forEach((id) => {
					allInSubtree
						// get users outside org of each amdin
						.filter(usr => usr.orgId !== u[id].orgId)
						.forEach((usr) => {
							assert.equal(can(u[id]).read(usr, {}), false);
						})
				})
			});
		});


		describe('user', () => {
			// about himself
			it('can read personal \'forms\' and \'info\' sections', () => {
				['forms', 'info'].forEach((section) => {
					[1.3, 3.3, 4.3].forEach((id) => {
						// read himself
						assert(can(u[id]).read(u[id], { section }));
					})
				});
			});

			it('can NOT read personal \'settings\' section', () => {
				['settings'].forEach((section) => {
					[1.3, 3.3, 4.3].forEach((id) => {
						// read himself
						assert.equal(can(u[id]).read(u[id], { section }), false);
					})
				});
			});


			// relative to other users
			it('can read \'forms\' and \'info\' section of his org users', () => {
				['forms', 'info'].forEach((section) => {
					// user 1.3
					assert(can(u[1.3]).read(u[1.1], { section }));
					assert(can(u[1.3]).read(u[1.2], { section }));
					// user 3.3
					assert(can(u[3.3]).read(u[3.1], { section }));
					assert(can(u[3.3]).read(u[3.2], { section }));
					// user 4.3
					assert(can(u[4.3]).read(u[4.2], { section }));
				});
			});

			it('can NOT read \'settings\' section of his org users', () => {
				['settings'].forEach((section) => {
					// user 1.3
					assert.equal(can(u[1.3]).read(u[1.1], { section }), false);
					assert.equal(can(u[1.3]).read(u[1.2], { section }), false);
					// user 3.3
					assert.equal(can(u[3.3]).read(u[3.1], { section }), false);
					assert.equal(can(u[3.3]).read(u[3.2], { section }), false);
					// user 4.3
					assert.equal(can(u[4.3]).read(u[4.2], { section }), false);
				})
			});


			it('can NOT read users outside his org', () => {
				[1.3, 3.3, 4.3].forEach((id) => {
					allInSubtree
						// get users outside org of each amdin
						.filter(usr => usr.orgId !== u[id].orgId)
						.forEach((usr) => {
							assert.equal(can(u[id]).read(usr, {}), false);
						});
				});
			});
		});
	});
});
