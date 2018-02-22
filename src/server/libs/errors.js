class HttpError extends Error {
	constructor(status = 500, message = 'Unknown error') {
		super(message);
		this.status = status;
	}
}

HttpError.prototype.name = 'HttpError';


class PgError extends Error {
	constructor(err) {
		if(err instanceof Error) {
			super(err.message);
			// this.stack += `\nExtends: ${err.stack}`;
			Object.entries(err).forEach(([prop, value]) => {
				if(prop !== 'name') this[prop] = value;
			});
		} else {
			super(err);
		}
	}

	toHttpError() {
		if(process.env.NODE_ENV !== 'production') {
			return new HttpError(400, `table: ${this.table}\ncode: ${this.code}\nmessage: ${this.message}\ndetail: ${this.detail}`);
		}
		const errProps = PgError.codes[this.code];
		return errProps ? new HttpError(...errProps) : new HttpError();
	}
}

PgError.codes = {
	23502: {
		status: 400,
		message: 'Some of the required fields are empty',
	},
};

PgError.prototype.name = 'PgError';


class SmtpError extends Error {
	constructor(err) {
		if(err instanceof Error) {
			super(err.message);
			this.stack += `\nExtends: ${err.stack}`;
		} else {
			super(err);
		}
	}
}

SmtpError.prototype.name = 'SmtpError';


class ModelError extends Error {
	constructor(model, message) {
		super();
		this.model = model;
		this.message = message;
	}
}

ModelError.prototype.name = 'ModelError';


export {
	HttpError,
	PgError,
	SmtpError,
	ModelError,
};
