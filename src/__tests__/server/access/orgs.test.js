import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import Org from 'Server/models/Org';
import { can } from 'Server/libs/Access';
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
					can(u[1.1]).create(newOrgs[id], { body: props[id] })))
				);

				// inferior for root in third org
				assert(can(u[3.1]).create(newOrgs['n3'], { body: props['n3'] }));
				assert(can(u[3.1]).create(newOrgs['n4'], { body: props['n4'] }));
			});

			it('can not create org outside subtree', () => {
				assert(can(u[1.1]).create(newOrgs['n0'], { body: props['n0'] }) === false);

				assert(can(u[3.1]).create(newOrgs['n1'], { body: props['n1'] }) === false);
				assert(can(u[3.1]).create(newOrgs['n2'], { body: props['n2'] }) === false);
			});

			it('can not create org with invalid prop keys', () => {
				// reqired body: { email, orgId, info }
				assert(can(u[1.1]).create(newOrgs['n3'], { body: {} }) === false);
				assert(can(u[1.1]).create(newOrgs['n1'], { body: { email: 'some@ema.il' } }) === false);
			});
		});

		describe('admin', () => {
			it('can not create any org', () => {
				assert(
					[u[1.2], u[3.2], u[4.2]].every(user => (
						// all orgs
						creatable.every(id => !can(user).create(newOrgs[id], { body: { /* any props */ } }))
					)),
				);
			});
		});

		describe('user', () => {
			it('can not create any org', () => {
				assert(
					// all simple users
					[u[1.3], u[3.3], u[4.3]].every(user => (
						// all orgs
						creatable.every(id => !can(user).create(newOrgs[id], { body: { /* any props */ } }))
					)),
				);
			});
		});
	});


	const allInSubtree = Object.values(o);

	describe('to read subpaths of organization', () => {
		const subpaths = [
			'', // for api request to read user info
			'orgs/new', 'users/new', // pages to create org or user
			'info', 'orgs', 'users', 'forms', 'settings',
		];


		describe('root', () => {
			it('can read any subpath of any org in subtree', () => {
				subpaths.forEach((subpath) => {
					// all for root in first org
					allInSubtree.forEach((org) => {
						assert(can(u[1.1]).read(org, { subpath }));
					});

					// inferior for root in third org
					assert(can(u[3.1]).read(o[3], { subpath }));
					assert(can(u[3.1]).read(o[4], { subpath }));
				});
			});

			it('can not read any org path outside subtree', () => {
					// parent and sibling for third org
				subpaths.forEach((subpath) => {
					assert(can(u[3.1]).read(o[1], { subpath }) === false);
					assert(can(u[3.1]).read(o[2], { subpath }) === false);
				});
			});
		});


		describe('admin', () => {
			const notAvailable = ['orgs', 'orgs/new'];
			it('can read any subpath of his org except orgs/new', () => {
				subpaths.filter(sp => !notAvailable.includes(sp))
					.forEach((subpath) => {
						assert(can(u[1.2]).read(o[1], { subpath, query: {} }));
						assert(can(u[3.2]).read(o[3], { subpath, query: {} }));
						assert(can(u[4.2]).read(o[4], { subpath, query: {} }));
					})
			});

			it('can NOT get page to create orgs (orgs/new)', () => {
				notAvailable.forEach((subpath) => {
					assert(can(u[1.2]).read(o[1], { subpath }) === false);
					assert(can(u[3.2]).read(o[3], { subpath }) === false);
					assert(can(u[4.2]).read(o[4], { subpath }) === false);
				})
			});

			it('can NOT set maxDepth option for user search', () => {
				const subpath = 'users';
				assert(can(u[1.2]).read(o[1], { subpath, query: { maxDepth: 4 } }) === false);
				assert(can(u[3.2]).read(o[3], { subpath, query: { maxDepth: 1 } }) === false);
				assert(can(u[4.2]).read(o[4], { subpath, query: { maxDepth: null } }) === false);
			});

			it('can NOT read any path of other orgs', () => {
				subpaths.forEach((subpath) => {
					assert(can(u[1.2]).read(o[2], { subpath }) === false);

					assert(can(u[3.2]).read(o[1], { subpath }) === false);
					assert(can(u[3.2]).read(o[2], { subpath }) === false);
					assert(can(u[3.2]).read(o[4], { subpath }) === false);
				});
			});
		});


		describe('user', () => {
			const available = ['', 'info', 'forms'];
			const notAvailable = subpaths.filter(s => !available.includes(s));

			it('can read all available subpath of his org', () => {
				available.forEach((subpath) => {
					assert(can(u[1.3]).read(o[1], { subpath }));
					assert(can(u[3.3]).read(o[3], { subpath }));
					assert(can(u[4.3]).read(o[4], { subpath }));
				})
			});

			it('can not read other subpaths of his org', () => {
				notAvailable.forEach((subpath) => {
					assert(can(u[1.3]).read(o[1], { subpath }) === false);
					assert(can(u[3.3]).read(o[3], { subpath }) === false);
					assert(can(u[4.3]).read(o[4], { subpath }) === false);
				})
			});

			it('can not read other orgs', () => {
				subpaths.forEach((subpath) => {
					// check all subpaths of other orgs for u[1.3]
					[2, 3, 4].every((id) => {
						assert(can(u[1.3]).read(o[id], { subpath }) === false);
					});

					// check all subpaths of other orgs for u[1.3]
					[1, 2, 4].forEach((id) => {
						assert(can(u[3.3]).read(o[id], { subpath }) === false);
					});
				});
			});
		});
	});


	describe('to update organization', () => {
		// props to update org of the user
		const updatableInHisOrg = { email: 'new@', info: 'updated' };
		// props to update other orgs in subtree
		const allUpdatable = {
			email: 'new@',
			active: true,
			info: 'updated',
			deleted: Date.parse('2012-07-13'),
		};

		describe('root', () => {
			it('can update his org', () => {
				assert(can(u[1.1]).update(o[1], { body: updatableInHisOrg }));
				assert(can(u[1.1]).update(o[1], { body: { /* any props */ } }));
				assert(can(u[1.1]).update(o[1], { body: { info: 'only new info' } }));
				assert(can(u[3.1]).update(o[3], { body: updatableInHisOrg }));
				assert(can(u[3.1]).update(o[3], { body: { email: 'only.new.email' } }));
			});

			it('can update org in subtree', () => {
				// org subtree
				assert(can(u[1.1]).update(o[2], { body: allUpdatable }));
				assert(can(u[1.1]).update(o[3], { body: allUpdatable }));
				assert(can(u[1.1]).update(o[4], { body: allUpdatable }));
				assert(can(u[3.1]).update(o[4], { body: allUpdatable }));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(u[3.1]).update(o[3], { body: allUpdatable }), false);
				assert.equal(can(u[1.1]).update(o[4], { body: { parentId: 12 } }),false);
				assert.equal(can(u[1.1]).update(o[4], { body: { ...allUpdatable, custom: true } }), false);
			});

			it('can not update org outside subtree', () => {
				assert.equal(can(u[3.1]).update(o[1], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.1]).update(o[2], { body: { /* any props */ } }), false);
			});
		});

		describe('admin', () => {
			it('can update email and info his org', () => {
				assert(can(u[1.2]).update(o[1], { body: { info: 'some new info' } }));
				assert(can(u[3.2]).update(o[3], { body: updatableInHisOrg }));
				assert(can(u[3.2]).update(o[3], { body: { email: 'only.new.email' } }));
			});

			it('can not update org with invalid props', () => {
				// all props for user's organization
				assert.equal(can(u[3.2]).update(o[3], { body: allUpdatable }), false);
				assert.equal(can(u[1.2]).update(o[1], { body: { parentId: 12 } }),false);
				assert.equal(can(u[1.2]).update(o[1], { body: { ...allUpdatable, custom: true } }), false);
			});

			it('can not update org in subtree', () => {
				// org subtree
				assert.equal(can(u[1.2]).update(o[2], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.2]).update(o[4], { body: { /* any props */ } }), false);
			});

			it('can not update org outside subtree', () => {
				// org subtree
				assert.equal(can(u[3.2]).update(o[2], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.2]).update(o[1], { body: { /* any props */ } }), false);
				assert.equal(can(u[4.2]).update(o[1], { body: { /* any props */ } }), false);
			});
		});

		describe('user', () => {
			it('can not update any org', () => {
				assert.equal(can(u[3.3]).update(o[1], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.3]).update(o[2], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.3]).update(o[3], { body: { /* any props */ } }), false);
				assert.equal(can(u[3.3]).update(o[4], { body: { /* any props */ } }), false);
			});
		});
	})
});
