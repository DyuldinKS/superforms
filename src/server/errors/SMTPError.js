import HTTPError from './HTTPError';


class SMTPError extends Error {
	constructor(err) {
		if(typeof err === 'object') {
			super(err.message);
			// copy all properties excluding 'rejectedErrors'
			Object.getOwnPropertyNames(err).forEach((prop) => {
				this[prop] = err[prop];
			});

			delete this.rejectedErrors;
			delete this.name; // should be 'SMTPError'
		} else {
			super(err);
		}
	}

	toHTTPError() {
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

		return new HTTPError(status, message);
	}
}

SMTPError.prototype.name = 'SMTPError';


export default SMTPError;
