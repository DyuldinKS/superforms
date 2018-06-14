import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import User from 'Server/models/User';
// import Response from 'Server/models/Response';
import { can } from 'Server/utils/access';
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
					can(u['1.1']).create(newUsers[id], props[id]))
				));

				assert(['n3.1', 'n3.2', 'n3.3', 'n4.2', 'n4.3'].every(id => (
					can(u['3.1']).create(newUsers[id], props[id])
				)))
			})

			it('can not create users outside subtree', () => {
				assert(['n1.1', 'n2.2'].every(id => (
					!can(u['3.1']).create(newUsers[id], props[id])
				)));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u['1.1']).create(newUsers['n1.1'], {}), false);
				assert.equal(can(u['1.1']).create(newUsers['n4.2'], ['email', 'orgId']), false);
				assert.equal(can(u['1.1']).create(newUsers['n3.3'], ['some', 'trash']), false);
			});
		});

		describe('admin', () => {
			it('can create any user within his org except root', () => {
				assert(can(u['3.2']).create(newUsers['n3.2'], props['n3.2']));
				assert(can(u['3.2']).create(newUsers['n3.3'], props['n3.3']));
	
				assert(can(u['4.2']).create(newUsers['n4.2'], props['n4.2']));
				assert(can(u['4.2']).create(newUsers['n4.3'], props['n4.3']));
			});

			it('can not create user with invalid props', () => {
				// required: ['email', 'orgId', 'info', 'role']
				assert.equal(can(u['3.2']).create(newUsers['n3.2'], {}), false);
				assert.equal(can(u['4.2']).create(newUsers['n4.3'], ['email', 'orgId']), false);
			});

			it('can not create root', () => {
				assert.equal(can(u['1.2']).create(newUsers['n1.1'], props['n1.1']), false);
				assert.equal(can(u['3.2']).create(newUsers['n3.1'], props['n3.1']), false);
			});

			it('can not create any user outside his org', () => {
				// for admin of 3rd org
				assert(['n1.1', 'n2.2', 'n4.2', 'n4.3'].every(id => (
					!can(u['3.2']).create(newUsers[id], props[id])
				)));

				// for admin of 4rd org
				assert(['n1.1', 'n2.2', 'n3.1', 'n3.2', 'n3.3'].every(id => (
					!can(u['4.2']).create(newUsers[id], props[id])
				)));
			})
		});

		describe('user', () => {
			it('can not create any user', () => {
				assert(
					['1.3', '3.3', '4.3']
						.map(id => u[id])
						.every(author => (
							allNew.every(id => !can(author).create(newUsers[id], props[id]))
						))
				);
			});
		});
	});


	const allInSubtree = Object.values(u);

	// describe('to read sections of users', () => {
	// 	const sections = ['info', 'forms', 'settings'];

	// 	// describe('root', () => {
	// 	// 	console.log('HELLO')
	// 	// 	console.log(allInSubtree)

	// 	// 	it('can read any user in subtree', () => {
	// 	// 		console.log('HELLO')
	// 	// 		console.log(allInSubtree)
	// 	// 		// assert(allInSubtree.every(id => (
	// 	// 		// 	can(u['1.1']).read(newUsers[id]))
	// 	// 		// ));
	// 	// 	})
	// 	// 	// it('can read any section of any user in subtree', () => {
	// 	// 	// 	// all for root in first org
	// 	// 	// 	console.log('HELLO')
	// 	// 	// 	console.log(allInSubtree)
	// 	// 	// 	assert(allInSubtree.every(usr => can(u['3.1']).read(usr)));

	// 	// 	// 	// assert(
	// 	// 	// 	// 	allInSubtree
	// 	// 	// 	// 		.filter(u => u.orgId >= 3) // inferior for root in 3rd org
	// 	// 	// 	// 		.every(usr => can(u['3.1']).read(usr))
	// 	// 	// 	// );
	// 	// 	// });

	// 	// 	// it('can not read user outside subtree', () => {
	// 	// 	// 	// parent and sibling for third org
	// 	// 	// 	assert(
	// 	// 	// 		allInSubtree
	// 	// 	// 			.filter(u => u.orgId < 3) // inferior for root in 3rd org
	// 	// 	// 			.every(usr => !can(u['3.1']).read(usr))
	// 	// 	// 	);
	// 	// 	// });
	// 	// });

	// 	// describe('admin', () => {
	// 	// 	it('can read any section of his org', () => {
	// 	// 		assert(can(u['1.2']).read(org1));
	// 	// 		assert(can(u['3.2']).read(org3));
	// 	// 		assert(can(u['4.2']).read(org4));
	// 	// 	});

	// 	// 	it('can not read other orgs', () => {
	// 	// 		assert(can(u['1.2']).read(org2) === false);

	// 	// 		assert(can(u['3.2']).read(org1) === false);
	// 	// 		assert(can(u['3.2']).read(org2) === false);
	// 	// 		assert(can(u['3.2']).read(org4) === false);
	// 	// 	});
	// 	// });

	// 	describe('user', () => {
	// 		// console.log(allInSubtree)
	// 		const available = ['forms'];
	// 		const notAvailable = sections.filter(s => !available.includes(s));
	// 		const ais = allInSubtree
	// 		it('can read \'forms\' section of his org users', () => {
	// 			console.log(u['1.3']);
	// 			assert(can(u['1.3']).read(u['1.1'], { section: 'forms' }));
	// 			// assert(can(u['3.3']).read(org3, { section: 'forms' }));
	// 			// assert(can(u['4.3']).read(org4, { section: 'forms' }));
	// 		});
	// 	});
	// });
});
