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
	)


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
					ownerId: form.owner_id,
					authorId: form.author_id,
				}
				delete expected.owner_id;
				delete expected.author_id;

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should create form with default values', () => {
		const form = {
			id: 0, // should be rewritten by forms_seq_id
			title: 'test2',
			scheme: {},
			owner_id: bot.id,
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
					ownerId: form.owner_id,
					authorId: bot.id, // taken from the second create_form() param
				};
				delete expected.owner_id;
				delete expected.author_id;				

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
			author_id: bot.id,
		}
		
		let expected;
		return nativeCreateForm(form, bot.id)
			.then((inserted) => { expected = inserted; })
			.then(() => db.query('SELECT * FROM get_form($1);', [expected.id]))
			.then(actual => {
				assert.deepStrictEqual({ ...expected }, { ...actual });
			})
	})
})