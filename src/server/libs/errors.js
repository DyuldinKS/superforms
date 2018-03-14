class HttpError extends Error {
	constructor(status = 500, message = 'Unknown error') {
		super(message);
		this.status = status;
	}
}

HttpError.prototype.name = 'HttpError';


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
		if(typeof err === 'object') {
			super(err.message);
			// copy all properties excluding 'rejectedErrors'
			Object.getOwnPropertyNames(err).forEach((prop) => {
				this[prop] = err[prop];
			});

			delete this.rejectedErrors;
			delete this.name; // should be 'SmtpError'
		} else {
			super(err);
		}
	}

	toHttpError() {
		const code = this.responseCode;
		let status = 500;
		let message = 'Could not send email';

		if([101, 111].includes(code)) {
			status = 503;
			message = 'Sending mail is temporarily unavailable';
		} else if([501, 510, 511, 512, 550].includes(code)) {
			status = 400;
			message = 'Bad email address';
		} else if(code === 523) {
			status = 400;
			message = 'Message is too big';
		} else if(code > 400 && code < 500) {
			status = 400;
			message = 'Could not send email';
		}

		if(process.env.NODE_ENV !== 'production') {
			message = JSON.stringify({ message: this.message, ...this });
		}

		return new HttpError(status, message);
	}
}

SmtpError.prototype.name = 'SmtpError';


export {
	HttpError,
	PgError,
	SmtpError,
};
