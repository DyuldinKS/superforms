import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import db from 'Server/db';

const { expect } = chai;


describe('recipients sql-functions test', () => {
	let bot;


	before(() => (
		db.query('SELECT min(id) AS id FROM users;')
			.then((user) => { bot = user; })
	));


	const nativeCreate = (rcpt, authorId) => (
		db.query(
			'SELECT * FROM create_rcpt($1::json, $2::int)',
			[rcpt, authorId]
		)
	);


	const nativeGet = ({ id, email }) => {
		const type = id !== undefined ? 'int' : 'text';
		return db.query(`SELECT * FROM get_rcpt($1::${type})`, [id || email])
	};


	const nativeGetOrCreate = (rcpt, authorId) => (
		db.query(
			'SELECT * FROM get_or_create_rcpt($1::json, $2::int)',
			[rcpt, authorId],	
		)
	);


	const nativeUpdate = (id, props, authorId) => (
		db.query(
			'SELECT * FROM update_rcpt($1, $2::json, $3::int);',
			[id, props, bot.id],
		)
	)


	it('should create recipient', () => {
		const rcpt = {
			email: '@test1',
			type: 'user',
			active: false,
			created: new Date('2016-08-26T16:02:46.274+03:00'),
			updated: new Date('2016-08-29T14:48:58.049+03:00'),
			deleted: new Date('2016-08-30T00:00:00.000+03:00')
		};

		return nativeCreate(rcpt, bot.id)
			.then((actual) => {
				const expected = {
					...rcpt,
					id: actual.id,
					author_id: bot.id,
				}

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should create recipient with default values', () => {
		const rcpt = {
			id: 0, // should be rewritten by recipients_seq_id
			email: '@test2',
			author_id: 1337, // should be rewritten by func second parameter
		}

		return nativeCreate(rcpt, bot.id)
			.then((actual) => {
				const expected = {
					...rcpt,
					id: actual.id,
					type: 'rcpt',
					active: true,
					created: actual.created,
					updated: null,
					deleted: null,
					author_id: bot.id, // taken from the second create_rcpt() param
				};

				assert(actual.created instanceof Date);
				assert(actual.id !== rcpt.id);
				assert(actual.authorId !== rcpt.id);
				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should log inserted recipient', () => {
		const rcpt = {
			email: '@test3',
			type: 'org',
		};

		return nativeCreate(rcpt, bot.id)
			.then((actual) => {
				rcpt.id = actual.id;
				rcpt.created = actual.created;
				// get recipient logs
				return db.queryAll(
					`SELECT * FROM logs WHERE entity = 'rcpt' AND entity_id = $1`,
					[rcpt.id],
				);
			})
			.then((logs) => {
				assert(logs.length === 1); // only one record
				const [log] = logs;

				assert(log.operation === 'I') // insert

				rcpt.type = 'org';
				rcpt.active = true;
				rcpt.updated = null;
				rcpt.deleted = null;
				rcpt.author_id = bot.id;

				assert(log.author_id === rcpt.author_id);

				const { changes } = log;
				changes.created = new Date(changes.created);
				assert.deepStrictEqual(log.changes, rcpt);
			})
	})


	it('should return null as nonexistent id', () => (
		nativeGet({ id: -1 })
			.then(actual => assert(actual === null))
	))


	it('should return existing recipient', () => {
		const rcpt = { email: '@test5' };
		
		let expected;
		return nativeCreate(rcpt, bot.id)
			.then((inserted) => { expected = inserted; })
			.then(() => db.query('SELECT * FROM get_rcpt($1::int);', [expected.id]))
			.then(actual => {
				assert.deepStrictEqual({ ...expected }, { ...actual });
			})
	})


	it(
		'should create new recipient once and get it in following requests',
		() => {
			const rcpt = { email: '@test6' };

			let created;
			let gotten;
			return nativeGet(rcpt)
				.then(res => { assert(res === null)}) // rcpt doesn't exist
				.then(() => nativeGetOrCreate(rcpt, bot.id)) // create
				.then((res) => { created = res; })
				.then(() => nativeGetOrCreate(rcpt, bot.id)) // get
				.then((res) => { gotten = res; })
				.then(() => nativeGetOrCreate(rcpt, bot.id)) // get one more time
				.then((repeated) => {
					assert.deepStrictEqual({ ...created }, { ...gotten });
					assert.deepStrictEqual({ ...created }, { ...repeated });
					assert(created.email = rcpt.email);
				})
		},
	)


	it(`should cast record to short form`, () => {
		const rcpt = { email: '@test7', type: 'user' };

		return db.query(
			`SELECT (rcpt::rcpt_short).*
			FROM create_rcpt($1::json, $2::int) rcpt`,
			[rcpt, bot.id]
		)
			.then((actual) => {
				const expected = {
					...rcpt,
					id: actual.id,
					active: true,
				}

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should cast record to full form`, () => {
		const rcpt = { email: '@test8', type: 'user' };

		return db.query(
			`SELECT (rcpt::rcpt_full).*
			FROM create_rcpt($1::json, $2::int) rcpt`,
			[rcpt, bot.id]
		)
			.then((actual) => {
				const expected = {
					...rcpt,
					id: actual.id,
					active: true,
					created: actual.created,
					updated: null,
					deleted: null,
					authorId: bot.id,
				}

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should update all props`, () => {
		const rcpt = { email: '@test9', type: 'rcpt' };
		const updatedProps = {
			email: 'new@test9',
			type: 'user',
			created: new Date(),
			deleted: new Date(),
		}

		let created;
		return db.query(
			'SELECT * FROM create_rcpt($1::json, $2::int) rcpt',
			[rcpt, bot.id]
		)
			.then((res) => { created = res; })
			.then(() => nativeUpdate(created.id, updatedProps, bot.id))
			.then((actual) => {
				const expected = {
					...created,
					...updatedProps,
					updated: actual.updated,
					author_id: bot.id,
				}
				assert.deepStrictEqual(expected, { ...actual });
				assert.notDeepStrictEqual(created, actual);
			})
	})


	it(`should not update id and rewrite update time and author;`, () => {
		const rcpt = { email: '@test10', type: 'rcpt' };
		const updatedProps = {
			id: -123,
			author_id: 0,
			updated: new Date(null),
		}

		let created;
		return db.query(
			'SELECT * FROM create_rcpt($1::json, $2::int) rcpt',
			[rcpt, bot.id]
		)
			.then((res) => { created = res; })
			.then(() => nativeUpdate(created.id, updatedProps, bot.id))
			.then((actual) => {
				const expected = {
					...created,
					updated: actual.updated,
					author_id: bot.id,
				}
				assert.deepStrictEqual(expected, { ...actual });
				assert(updatedProps.id !== actual.id);
				assert(updatedProps.author_id !== actual.author_id);
				assert(updatedProps.updated !== actual.updated);
			})
	});


	it('should cast type to recipients', () => {
		const rcpt = {
			id: 182,
			email: '@test',
			authorId: 13,
		};

		const expected = {
			id: rcpt.id,
			email: rcpt.email,
			type: null,
			active: null,
			created: null,
			updated: null,
			deleted: null,
			author_id: rcpt.authorId,
		};

		db.query('SELECT ($1::json::recipients).*;', [rcpt])
			.then((actual) => {
				assert.deepStrictEqual(expected, { ...actual });
				return db.query('SELECT ($1::json::recipients).*;', [expected]);
			})
			.then((actual) => {
				assert.deepStrictEqual(expected, { ...actual });
			})
	});
});
