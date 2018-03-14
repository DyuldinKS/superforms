class HTTPError extends Error {
	constructor(status = 500, message = 'Unknown error') {
		super(message);
		this.status = status;
	}
}

HTTPError.prototype.name = 'HTTPError';


export default HTTPError;
