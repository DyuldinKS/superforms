import chai from 'chai';
import assert from 'assert';
import { HTTPError, PgError, SMTPError } from 'Server/errors';

const { expect } = chai;


describe('errors', () => {
	describe('HTTPError', () => {
		it('should be instance of HTTPError', () => {
			const err = new HTTPError(500, 'Internal server error');
			assert(err instanceof HTTPError);
			assert(err.name === 'HTTPError');
			// all props
			assert.deepStrictEqual(
				Object.getOwnPropertyNames(err),
				['stack', 'message', 'status'],
			);

			assert.deepStrictEqual({ ...err }, { status: 500 });
		});


		it('should create default HTTPError', () => {
			const err = new HTTPError();
			assert(err.status === 500);
			assert(err.message === 'Unknown error');
		});


		it('should create specified HTTPError', () => {
			const err = new HTTPError(403, 'Forbidden');
			assert(err.status === 403);
			assert(err.message === 'Forbidden');
		});
	});


	describe('PgError', () => {
		it('should be instanceof PgError', () => {
			const err = new PgError();
			assert(err instanceof PgError);
			assert(err.name === 'PgError');
		})


		it('should create PgError with message', () => {
			const err = new PgError('null value ...');
			assert(err.message === 'null value ...');
		});


		it('should create PgError from object', () => {
			const obj = {
				code: '42P01',
				file: 'parse_relation.c',
				position: '13',
			};
			const err = new PgError(obj);
			assert.deepStrictEqual({ ...err }, obj);
		});

		// node-postgres error example
		const npgErr = new Error('relation "nonexistent_table" does not exist');
		Object.assign(npgErr, {
			length: 116,
			severity: 'ERROR',
			code: '42P01',
			detail: undefined,
			hint: undefined,
			position: '13',
			file: 'parse_relation.c',
			line: '1180',
			routine: 'parserOpenTable'
		});


		it('should create PgError from existing node-postgres error', () => {
			const err = new PgError(npgErr);

			const enumerableProps = Object.keys(npgErr);
			expect(err).to.have.all.keys(enumerableProps);

			const props = Object.getOwnPropertyDescriptors(err);
			assert(props.message.enumerable === false);
			assert(props.stack.enumerable === false);
			assert(err.stack === npgErr.stack);
		})
	});


	describe('SMTPError', () => {
		it('should be instanceof SMTPError', () => {
			const err = new SMTPError();
			assert(err instanceof SMTPError);
			assert(err.name === 'SMTPError');
		});


		it('should create SMTPError with message', () => {
			const err = new SMTPError('Bad email address');
			assert(err.message === 'Bad email address');
		});


		it('should create SMTPError from object', () => {
			const obj = {
				code: 501,
				response: '501 5.1.3 Bad recipient address syntax.'
			};
			const err = new SMTPError(obj);
			assert.deepStrictEqual({ ...err }, obj);
		});

		// nodemailer error example
		const smtpErr = new Error('501 5.1.3 Bad recipient address syntax.');
		Object.assign(smtpErr, {
			code: 'EENVELOPE',
			response: '501 5.1.3 Bad recipient address syntax.',
			responseCode: 501,
			command: 'RCPT TO',
			rejected: ['ehlo @example.com'],
			rejectedErrors: [{ repeated: 'props' }],
		})


		it('should create SMTPError from existing nodemailer error', () => {
			const err = new SMTPError(smtpErr);
			expect(err).to.be.instanceOf(SMTPError);
			assert(err.name === 'SMTPError');

			const enumerableProps = Object.keys(smtpErr);
			expect(err).not.to.have.all.keys(enumerableProps);
			expect(err).to.have
				.all.keys(enumerableProps.filter(prop => prop !== 'rejectedErrors'))

			const props = Object.getOwnPropertyDescriptors(err);
			assert(props.message.enumerable === false);
			assert(props.stack.enumerable === false);
			assert(err.stack === smtpErr.stack);
		})


		it('should create HTTPError for development, debug', () => {
			const NODE_ENV = process.env.NODE_ENV;
			process.env.NODE_ENV = 'development';
			try {
				const smtpError = new SMTPError(smtpErr);
				const err = smtpError.toHTTPError();
				assert(err instanceof HTTPError);

				const message = JSON.parse(err.message);
				const props = ['message', ...Object.keys(smtpError)]
				expect(message).to.have.all.keys(props)
				assert(err.status === 400);
			} catch (err) {
				console.log(err);
				assert(false);
			} finally {
				process.env.NODE_ENV = 'development';
			}
		});


		it('should create HTTPError for production', () => {
			const NODE_ENV = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';
			try {
				const err = new SMTPError(smtpErr).toHTTPError();
				// console.log(err)
				assert(err instanceof HTTPError);
				expect(err.message).to.be.equal('Bad email address')
				assert(err.message === 'Bad email address');
				assert(err.status === 400);
			} catch (err) {
				assert(false);
				console.log(err);
			} finally {
				process.env.NODE_ENV = NODE_ENV;
			}
		});

	});
});
