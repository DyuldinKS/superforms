class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = 'HttpError';
	}
}

class PgError extends Error {
	constructor(err) {
		if(err instanceof Error) {
			super(err.message);
			this.stack += `\nExtends: ${err.stack}`;
			Object.entries(err).forEach(([prop, value]) => {
				this[prop] = value;
			});
		} else {
			super(err);
		}
		this.name = 'PgError';
	}
}

class SmtpError extends Error {
	constructor(err) {
		if(err instanceof Error) {
			super(err.message);
			this.stack += `\nExtends: ${err.stack}`;
		} else {
			super(err);
		}
		this.name = 'PgError';
	}
}

export {
	HttpError,
	PgError,
	SmtpError,
};
