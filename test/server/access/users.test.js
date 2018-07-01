import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import User from 'Server/models/User';
import { can } from 'Server/libs/Access';
import { users as u, parentsByOrg, entityFactory } from './setup';

const { expect } = chai;


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
					can(u[1.1]).create(newUsers[id], { body: props[id] }))
				));

				assert(['n3.1', 'n3.2', 'n3.3', 'n4.2', 'n4.3'].every(id => (
					can(u[3.1]).create(newUsers[id], { body: props[id] })
				)))
			})

			it('can not create users outside subtree', () => {
				assert(['n1.1', 'n2.2'].every(id => (
					!can(u[3.1]).create(newUsers[id], { body: props[id] })
				)));
			});

			it('can not create user with invalid props', () => {
				// required body keys: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u[1.1]).create(newUsers['n1.1'], { body: {} }), false);
				assert.equal(can(u[1.1]).create(newUsers['n4.2'], { body: ['email', 'orgId'] }), false);
				assert.equal(can(u[1.1]).create(newUsers['n3.3'], { body: ['some', 'trash'] }), false);
			});
		});


		describe('admin', () => {
			it('can create any user within his org except root', () => {
				assert(can(u[3.2]).create(newUsers['n3.2'], { body: props['n3.2'] }));
				assert(can(u[3.2]).create(newUsers['n3.3'], { body: props['n3.3'] }));
	
				assert(can(u[4.2]).create(newUsers['n4.2'], { body: props['n4.2'] }));
				assert(can(u[4.2]).create(newUsers['n4.3'], { body: props['n4.3'] }));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u[3.2]).create(newUsers['n3.2'], { body: {} }), false);
				assert.equal(can(u[4.2]).create(newUsers['n4.3'], { body: ['email', 'orgId'] }), false);
			});

			it('can not create root', () => {
				assert.equal(can(u[1.2]).create(newUsers['n1.1'], { body: props['n1.1'] }), false);
				assert.equal(can(u[3.2]).create(newUsers['n3.1'], { body: props['n3.1'] }), false);
			});

			it('can not create any user outside his org', () => {
				// for admin of 3rd org
				assert(['n1.1', 'n2.2', 'n4.2', 'n4.3'].every(id => (
					!can(u[3.2]).create(newUsers[id], { body: props[id] })
				)));

				// for admin of 4rd org
				assert(['n1.1', 'n2.2', 'n3.1', 'n3.2', 'n3.3'].every(id => (
					!can(u[4.2]).create(newUsers[id], { body: props[id] })
				)));
			})
		});


		describe('user', () => {
			it('can not create any user', () => {
				assert(
					[1.3, 3.3, 4.3]
						.map(id => u[id])
						.every(author => (
							allNew.every(id => !can(author).create(newUsers[id], { body: props[id] }))
						))
				);
			});
		});
	});


	const allInSubtree = Object.values(u);

	describe('to read subpaths of users', () => {
		const subpaths = ['info', 'forms', 'settings'];

		describe('root', () => {
			it('can read any subpath of any user in subtree', () => {
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
			it('can read any subpath of his own profile', () => {
				[1.2, 3.2, 4.2].forEach((id) => {
					subpaths.forEach((subpath) => {
						assert(can(u[id]).read(u[id], { subpath }));
					})
				})
			});

			it('can read any subpath of his org users', () => {
				[1.2, 3.2, 4.2].forEach((id) => {
					allInSubtree
						// get users within org of each amdin
						.filter(usr => usr.orgId === u[id].orgId)
						.forEach(usr => {
							subpaths.forEach((subpath) => {
								assert(can(u[id]).read(usr, { subpath }));
							})
						})
				})
			});

			it('can NOT read users outside his org', () => {
				[1.2, 3.2, 4.2].forEach((id) => {
					allInSubtree
						// get users outside org of each amdin
						.filter(usr => usr.orgId !== u[id].orgId)
						.forEach((usr) => {
							subpaths.forEach((subpath) => {
								assert(can(u[id]).read(usr, { subpath }) === false);
							})
						})
				})
			});
		});


		describe('user', () => {
			// about himself
			it('can read personal \'forms\' and \'info\' subpaths', () => {
				['forms', 'info'].forEach((subpath) => {
					[1.3, 3.3, 4.3].forEach((id) => {
						// read himself
						assert(can(u[id]).read(u[id], { subpath }));
					})
				});
			});

			// relative to other users
			it('can read \'forms\' and \'info\' subpath of his org users', () => {
				['forms', 'info'].forEach((subpath) => {
					// user 1.3
					assert(can(u[1.3]).read(u[1.1], { subpath }));
					assert(can(u[1.3]).read(u[1.2], { subpath }));
					// user 3.3
					assert(can(u[3.3]).read(u[3.1], { subpath }));
					assert(can(u[3.3]).read(u[3.2], { subpath }));
					// user 4.3
					assert(can(u[4.3]).read(u[4.2], { subpath }));
				});
			});

			it('can NOT read \'settings\' subpath of his org users', () => {
				['settings'].forEach((subpath) => {
					// user 1.3
					assert.equal(can(u[1.3]).read(u[1.1], { subpath }), false);
					assert.equal(can(u[1.3]).read(u[1.2], { subpath }), false);
					// user 3.3
					assert.equal(can(u[3.3]).read(u[3.1], { subpath }), false);
					assert.equal(can(u[3.3]).read(u[3.2], { subpath }), false);
					// user 4.3
					assert.equal(can(u[4.3]).read(u[4.2], { subpath }), false);
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
