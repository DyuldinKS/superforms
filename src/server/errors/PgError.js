import HTTPError from './HTTPError';


class PgError extends Error {
	constructor(err) {
		if(typeof err === 'object') {
			super(err.message);
			// copy all properties excluding 'name'
			Object.getOwnPropertyNames(err).forEach((prop) => {
				this[prop] = err[prop];
			});

			delete this.name; // should be 'PgError'
		} else {
			super(err);
		}
	}

	toHTTPError() {
		if(process.env.NODE_ENV !== 'production') {
			return new HTTPError(400, `table: ${this.table}\ncode: ${this.code}\nmessage: ${this.message}\ndetail: ${this.detail}`);
		}
		const errProps = PgError.codes[this.code];
		return errProps ? new HTTPError(...errProps) : new HTTPError();
	}
}

PgError.codes = {
	23502: {
		status: 400,
		message: 'Some of the required fields are empty',
	},
};

PgError.prototype.name = 'PgError';


export default PgError;
