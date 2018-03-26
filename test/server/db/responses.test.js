import chai from 'chai';
import sinon from 'sinon';
import assert from 'assert';
import db from 'Server/db';

const { expect } = chai;


describe('responses sql-functions test', () => {
	let bot;
	let form;


	before(() => (
		db.query('SELECT min(id) AS id FROM users;')
			.then((user) => { bot = user; })
			// create test form
			.then(() => (
				db.query(
					'SELECT * FROM create_form($1::json, $2)',
					[
						{
							title: 'form for responses testing',
							scheme: { items: {}, order: [] },
							owner_id: bot.id,
						},
						bot.id
					],
				)
			))
			.then((newForm) => { form = newForm; })
	));


	const nativeCreateResponse = (response, authorId) => (
		db.query(
			'SELECT * FROM create_response($1::json, $2)',
			[response, authorId]
		)
	);


	const nativeGetResponse = (id) => (
		db.query('SELECT * FROM get_response($1)', [id])
	)


	it('should create response', () => {
		const response = {
			form_id: form.id,
			items: {},
			owner_id: null,
			recipient_id: bot.id,
			created: new Date('2016-08-26T16:02:46.274+03:00'),
			updated: null,
			deleted: null,
			author_id: bot.id,
		};

		return nativeCreateResponse(response, bot.id)
			.then((actual) => {
				const expected = {
					id: actual.id,
					formId: form.id,
					items: {},
					ownerId: null,
					recipientId: bot.id,
					created: response.created,
					updated: null,
					deleted: null,
					authorId: bot.id,
				}

				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should create response with default values', () => {
		const response = {
			id: 0, // should be rewritten by last value of responses_seq_id
			form_id: form.id,
			items: {},
		}

		return nativeCreateResponse(response, bot.id)
			.then((actual) => {
				const expected = {
					id: actual.id,
					formId: form.id,
					items: {},
					ownerId: null,
					recipientId: null,
					created: actual.created,
					updated: null,
					deleted: null,
					authorId: bot.id, // function should set author as bot
				};

				assert(actual.created instanceof Date);
				assert(actual.id !== response.id);
				assert.deepStrictEqual(expected, { ...actual });
			})
	})


	it('should log inserted response', () => {
		const response = {
			form_id: form.id,
			items: {},
		};

		return nativeCreateResponse(response, bot.id)
			.then((actual) => {
				response.id = actual.id;
				response.created = actual.created;
				// get response logs
				return db.queryAll(
					`SELECT * FROM logs WHERE entity = 'rspn' AND entity_id = $1`,
					[response.id],
				)
			})
			.then((logs) => {
				assert(logs.length === 1); // only one record
				const [log] = logs;

				assert(log.operation === 'I') // insert

				response.owner_id = null;
				response.recipient_id = null;
				response.updated = null;
				response.deleted = null;
				response.author_id = bot.id;

				assert(log.author_id === response.author_id);

				const { changes } = log;
				changes.created = new Date(changes.created);
				assert.deepStrictEqual(log.changes, response);
			})
	})


	it('should return null as nonexistent id', () => (
		nativeGetResponse(-1)
			.then(actual => assert(actual === null))
	))


	it('should return existing response', () => {
		const response = {
			form_id: form.id,
			items: {},
			owner_id: bot.id,
		}

		let expected;
		return nativeCreateResponse(response, bot.id)
			.then((inserted) => { expected = inserted; })
			.then(() => db.query('SELECT * FROM get_response($1);', [expected.id]))
			.then(actual => {
				assert.deepStrictEqual({ ...expected }, { ...actual });
			})
	})
});
