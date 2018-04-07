import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import db from 'Server/db';

const { expect } = chai;


describe('forms sql-functions test', () => {
	let bot;


	before(() => (
		db.query('SELECT min(id) AS id FROM users;')
			.then((user) => { bot = user; })
	));


	const nativeCreateForm = (form, authorId) => (
		db.query(
			'SELECT * FROM create_form($1::json, $2::int)',
			[form, authorId]
		)
	);


	const nativeGetForm = (id) => (
		db.query('SELECT * FROM get_form($1::int)', [id])
	);


	const nativeUpdate = (id, props, authorId) => (
		db.query(
			'SELECT * FROM update_form($1::int, $2::json, $3::int)',
			[id, props, authorId],
		)
	);


	it('should create form', () => {
		const form = {
			title: 'test1',
			description: 'it should create form',
			scheme: { order: [], items: {} },
			sent: null,
			owner_id: bot.id,
			created: new Date('2016-08-26T16:02:46.274+03:00'),
			updated: new Date('2016-08-29T14:48:58.049+03:00'),
			author_id: bot.id,
		};

		return nativeCreateForm(form, bot.id)
			.then((actual) => {
				const expected = {
					...form,
					id: actual.id,
					deleted: null,
					question_count: 0,
					response_count: 0,
				}

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should create form with default values', () => {
		const form = {
			id: 0, // should be rewritten by forms_seq_id
			title: 'test2',
			scheme: {},
			owner_id: bot.id,
			author_id: -1,
		}

		return nativeCreateForm(form, bot.id)
			.then((actual) => {
				const expected = {
					...form,
					id: actual.id,
					description: null,
					sent: null,
					created: actual.created,
					updated: null,
					deleted: null,
					owner_id: form.owner_id,
					author_id: bot.id, // taken from the second create_form() param
					question_count: 0,
					response_count: 0,
				};

				assert(actual.created instanceof Date);
				assert(actual.id !== form.id);
				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should log inserted form', () => {
		const form = {
			title: 'test3',
			scheme: { it: 'should be in the logs table' },
			owner_id: bot.id,
		};

		return nativeCreateForm(form, bot.id)
			.then((actual) => {
				form.id = actual.id;
				form.created = actual.created;
				// get form logs
				return db.queryAll(
					`SELECT * FROM logs WHERE entity = 'form' AND entity_id = $1`,
					[form.id],
				)
			})
			.then((logs) => {
				assert(logs.length === 1); // only one record
				const [log] = logs;

				assert(log.operation === 'I') // insert

				form.description = null;
				form.sent = null;
				form.updated = null;
				form.deleted = null;
				form.author_id = bot.id;

				assert(log.author_id === form.author_id);

				const { changes } = log;
				changes.created = new Date(changes.created);
				assert.deepStrictEqual(log.changes, form);
			})
	})


	it('should return null as nonexistent id', () => (
		nativeGetForm(-1)
			.then(actual => assert(actual === null))
	))


	it('should return existing form', () => {
		const form = {
			title: 'test5',
			scheme: {},
			owner_id: bot.id,
		};
		
		let expected;
		return nativeCreateForm(form, bot.id)
			.then((inserted) => { expected = inserted; })
			.then(() => db.query('SELECT * FROM get_form($1);', [expected.id]))
			.then(actual => {
				assert.deepStrictEqual({ ...expected }, { ...actual });
			})
	});


	it(`should cast record to short form`, () => {
		const form = {
			title: 'test6',
			scheme: {},
			owner_id: bot.id,
			sent: { shareable: 'some-uuidv4' },
		};

		return db.query(
			'SELECT (_new::form_short).*FROM create_form($1::json, $2::int) _new',
			[form, bot.id],
		)
			.then((actual) => {
				const expected = {
					id: actual.id,
					title: form.title,
					description: null,
					sent: form.sent,
					ownerId: form.owner_id,
					created: actual.created,
					questionCount: 0,
					responseCount: 0,
				};

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should cast record to full form`, () => {
		const form = {
			title: 'test7',
			scheme: {},
			owner_id: bot.id,
		};

		return db.query(
			'SELECT (_new::form_full).*FROM create_form($1::json, $2::int) _new',
			[form, bot.id],
		)
			.then((actual) => {
				const expected = {
					id: actual.id,
					title: form.title,
					description: null,
					scheme: {},
					sent: null,
					ownerId: form.owner_id,
					created: actual.created,
					updated: null,
					deleted: null,
					authorId: bot.id,
					questionCount: 0,
					responseCount: 0,
				};

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should update all props`, () => {
		const form = {
			title: 'test8',
			scheme: {},
			owner_id: bot.id,
		};

		const updatedProps = {
			title: 'new title',
			description: 'new description',
			scheme: {
				items: {
					'a': { itemType: 'delimeter' },
					'b': { itemType: 'input' },
					'c': { itemType: 'input'},
					'd': { itemType: 'delimeter' },
					'e': { itemType: 'input' },
				},
				order: ['d', 'e', 'a', 'b', 'c'],
			},
			sent: { shareable: 'uuidv4' },
			created: new Date(null),
			deleted: new Date(),
		};

		let createdForm;
		return db.query(
			'SELECT * FROM create_form($1::json, $2::int) form',
			[form, bot.id],
		)
			.then((res) => { createdForm = res; })
			.then(() => nativeUpdate(createdForm.id, updatedProps, bot.id))
			.then((actual) => {
				const { items, order } = updatedProps.scheme;
				// count responses
				const question_count = order.reduce((count, key) => (
					count + (items[key].itemType === 'delimeter' ? 0 : 1)
				), 0);

				const expected = {
					...createdForm,
					...updatedProps,
					question_count,
					response_count: 0,
					updated: actual.updated,
					author_id: bot.id,
				}
				assert.deepStrictEqual(expected, { ...actual });
				assert.notDeepStrictEqual(createdForm, actual);
			})
	})


	it(`should not update id and rewrite update time and author;`, () => {
		const form = {
			title: 'test9',
			scheme: {},
			owner_id: bot.id,
		};

		const updatedProps = {
			id: -123,
			author_id: 0,
			updated: new Date('2016-08-29T14:48:58.049+03:00'),
		}

		let created;
		return db.query(
			'SELECT * FROM create_form($1::json, $2::int) form',
			[form, bot.id]
		)
			.then((res) => { created = res; })
			.then(() => nativeUpdate(created.id, updatedProps, bot.id))
			.then((actual) => {
				assert(actual.id === created.id);
				assert(actual.author_id === created.author_id);
				assert(actual.updated !== updatedProps.updated);
			})
	});


	it('should cast type to recipients', () => {
		const form = {
			id: 1337,
			title: 'test10',
			scheme: {},
			ownerId: 85,
			authorId: bot.id,
			questionCount: 0,
			responseCount: 0,
		};

		const expected = {
			id: form.id,
			title: form.title,
			description: null,
			scheme: form.scheme,
			sent: null,
			owner_id: form.ownerId,
			created: null,
			updated: null,
			deleted: null,
			author_id: form.authorId,
		};

		return db.query('SELECT ($1::json::forms).*;', [form])
			.then((actual) => {
				assert.deepStrictEqual(expected, { ...actual });
				return db.query('SELECT ($1::json::forms).*;', [expected]);
			})
			.then((actual) => {
				assert.deepStrictEqual(expected, { ...actual });
			})
	});
});
