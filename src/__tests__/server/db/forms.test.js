import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import db from 'Server/db';
import { createCaseConverter } from 'Server/utils/translate';


describe('forms sql-functions test', () => {
	let bot;
	// convert object keys to camel case
	const keysToCamelCase = createCaseConverter('camel');

	before(() => (
		db.query('SELECT min(id) AS id FROM users;')
			.then((user) => { bot = user; })
	));


	const createForm = (form, authorId) => (
		db.query(
			'SELECT (to_form_full(cf)).* FROM create_form($1::json, $2::int) cf',
			[form, authorId]
		)
	);


	const getForm = (id) => (
		db.query('SELECT (to_form_full(f)).* FROM get_form($1::int) f', [id])
	);


	const updateForm = (id, props, authorId) => (
		db.query(
			'SELECT (to_form_full(uf)).* FROM update_form($1::int, $2::json, $3::int) uf',
			[id, props, authorId],
		)
	);


	it('should create form', () => {
		const form = {
			title: 'test1',
			description: 'it should create form',
			scheme: { order: [], items: {} },
			collecting: null,
			ownerId: bot.id,
			created: new Date('2016-08-26T16:02:46.274+03:00'),
			updated: new Date('2016-08-29T14:48:58.049+03:00'),
			authorId: bot.id,
		};

		return createForm(form, bot.id)
			.then((actual) => {
				const expected = keysToCamelCase({
					...form,
					id: actual.id,
					deleted: null,
					responseCount: null,
				});

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should create form with default values', () => {
		const form = {
			id: 0, // should be rewritten by forms_seqId
			title: 'test2',
			scheme: {},
			ownerId: bot.id,
			authorId: -1,
		}

		return createForm(form, bot.id)
			.then((actual) => {
				const expected = keysToCamelCase({
					...form,
					id: actual.id,
					description: null,
					collecting: null,
					created: actual.created,
					updated: null,
					deleted: null,
					ownerId: form.ownerId,
					authorId: bot.id, // taken from the second create_form() param
					responseCount: null,
				});

				assert(actual.created instanceof Date);
				assert(actual.id !== form.id);
				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should log inserted form', () => {
		const form = {
			title: 'test3',
			scheme: { it: 'should be in the logs table' },
			ownerId: bot.id,
		};

		return createForm(form, bot.id)
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
				const log = keysToCamelCase(logs[0]);

				assert(log.operation === 'I') // insert

				form.authorId = bot.id;

				assert(log.authorId === form.authorId);

				const { changes } = log;
				changes.created = new Date(changes.created);
				assert.deepStrictEqual(log.changes, form);
			})
	})


	it('should return null as nonexistent id', () => (
		getForm(-1)
			.then(actual => assert(actual === null))
	))


	it('should return existing form', () => {
		const form = {
			title: 'test5',
			scheme: {},
			ownerId: bot.id,
		};
		
		let expected;
		return createForm(form, bot.id)
			.then((inserted) => { expected = inserted; })
			.then(() => getForm(expected.id))
			.then(actual => {
				assert.deepStrictEqual({ ...expected }, { ...actual });
			})
	});


	it(`should cast record to short form`, () => {
		const scheme = {
			items: { /* some questions and delimiters */ },
			order: [/* ordered item ids */],
			itemCount: 25,
			questionCount: 21,
		};
		const form = {
			scheme,
			title: 'test6',
			ownerId: bot.id,
		};

		return db.query(
			'SELECT (_new::form_short).* FROM create_form($1::json, $2::int) _new',
			[form, bot.id],
		)
			.then((actual) => {
				const { itemCount, questionCount } = scheme;
				const expected = {
					scheme: { itemCount, questionCount },
					id: actual.id,
					title: form.title,
					description: null,
					collecting: null,
					ownerId: form.ownerId,
					created: actual.created,
					responseCount: null,
				};

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should cast record to full form`, () => {
		const scheme = {
			items: { /* some questions and delimiters */ },
			order: [/* ordered item ids */],
			itemCount: 25,
			questionCount: 21,
		};
		const form = {
			title: 'test7',
			scheme: {},
			ownerId: bot.id,
		};

		return db.query(
			'SELECT (_new::form_full).* FROM create_form($1::json, $2::int) _new',
			[form, bot.id],
		)
			.then((actual) => {
				const expected = {
					id: actual.id,
					title: form.title,
					description: null,
					scheme: {},
					collecting: null,
					ownerId: form.ownerId,
					created: actual.created,
					updated: null,
					deleted: null,
					authorId: bot.id,
					responseCount: null,
				};

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it(`should update all props`, () => {
		const form = {
			title: 'test8',
			scheme: {},
			ownerId: bot.id,
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
			collecting: { start: "2018-06-20T17:48:15.913+03:00" },
			created: new Date(null),
			deleted: new Date(),
		};

		let createdForm;
		return createForm(form, bot.id)
			.then((res) => { createdForm = res; })
			.then(() => updateForm(createdForm.id, updatedProps, bot.id))
			.then((actual) => {
				const { items, order } = updatedProps.scheme;
				// count responses
				const questionCount = order.reduce((count, key) => (
					count + (items[key].itemType === 'delimeter' ? 0 : 1)
				), 0);

				const expected = {
					...createdForm,
					...updatedProps,
					responseCount: null,
					updated: actual.updated,
					authorId: bot.id,
					collecting: {
						start: updatedProps.collecting.start,
						id: createdForm.id,
						refilling: false,
						shared: null,
						stop: null,
					},
				};
				assert.deepStrictEqual(expected, { ...actual });
				assert.notDeepStrictEqual(createdForm, actual);
			})
	})


	it(`should not update id and rewrite update time and author;`, () => {
		const form = {
			title: 'test9',
			scheme: {},
			ownerId: bot.id,
		};

		const updatedProps = {
			id: -123,
			authorId: 0,
			updated: new Date('2016-08-29T14:48:58.049+03:00'),
		}

		let created;
		return createForm(form, bot.id)
			.then((res) => { created = res; })
			.then(() => updateForm(created.id, updatedProps, bot.id))
			.then((actual) => {
				assert(actual.id === created.id);
				assert(actual.authorId === created.authorId);
				assert(actual.updated !== updatedProps.updated);
			})
	});


	it('should cast type to forms', () => {
		const form = {
			id: 1337,
			title: 'test10',
			scheme: {},
			ownerId: 85,
			authorId: bot.id,
		};

		const expected = {
			id: form.id,
			title: form.title,
			description: null,
			scheme: form.scheme,
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


	it(`should not create form with invalid 'collecting' object`, () => {
		const form = {
			title: 'test11',
			scheme: {},
			ownerId: bot.id,
			collecting: { shared: 'unique' }, // start key is required
		};

		return createForm(form, bot.id)
			.catch(err => (
				assert.equal(
					err.message,
					'null value in column "start" violates not-null constraint',
				)
			));
	})


	it(`should insert 'collecting' record with form`, () => {
		const form = {
			title: 'test12',
			scheme: {},
			ownerId: bot.id,
			collecting: {
				start: new Date(),
				shared: 'unique',
			},
		};

		return createForm(form, bot.id)
			.then((created) => {
				form.id = created.id;
				return db.query('SELECT * FROM collecting WHERE id = $1', [form.id])
			})
			.then(keysToCamelCase)
			.then((actual) => {
				const expected = {
					...form.collecting,
					id: form.id,
					stop: null,
					refilling: false,
				}
				assert.deepStrictEqual(expected, { ...actual });
			})
	})
});
