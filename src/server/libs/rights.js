class Rights {
	constructor(rights = 0) {
		this.encoded = Number.parseInt(rights, 10) || Rights._encode(rights);
	}

	static _encode(scopes) {
		if(!(scopes && scopes.length === Rights._actions.length)) return null;
		const { short, full } = Rights._scopes;
		const searchArray = typeof scopes === 'string' ? short : full;
		const toNumber = scope => searchArray.indexOf(scope);
		return Number(Array.from(scopes).map(toNumber).join('')) || null;
	}

	static _unshiftWithZeros(scopeNum) {
		const times = Rights._actions.length - scopeNum.toString().length;
		return times < 0 ? '' : '0'.repeat(times) + scopeNum;
	}

	static _decode(encoded, mode = 'full') {
		const scopes = Rights._scopes[mode];
		if(scopes === undefined || typeof encoded !== 'number') return null;
		const decoded = Array.from(Rights._unshiftWithZeros(encoded))
			.map(n => scopes[n]);
		if(decoded.length !== Rights._actions.length || decoded.includes(undefined)) {
			return null;
		}
		return mode === 'short' ? decoded.join('') : decoded;
	}

	static _isEncodedValid(rights) {
		return rights !== null && rights === Rights._encode(Rights._decode(rights));
	}

	static _isDecodedValid(rights) {
		return rights !== null && rights === Rights._decode(Rights._encode(rights));
	}

	static _isValid(rights) {
		if(!rights) return false;
		const encoded = Number.parseInt(rights, 10);
		return (encoded)
			? Rights._isEncodedValid(encoded)
			: Rights._isDecodedValid(rights);
	}

	isValid() {
		return Rights._isEncodedValid(this.encoded);
	}

	toInt() {
		return this.encoded;
	}

	toString() {
		return Rights._decode(this.encoded, 'short');
	}

	toArray() {
		return Rights._decode(this.encoded, 'full');
	}

	toJSON() {
		return this.encoded;
	}

	getScope(action, mode = 'int') {
		if(!action) return null;
		const i = action.length ? Rights._actions.indexOf(action) : action;
		if(i === -1) return null;
		const decoded = mode === 'int'
			? Rights._unshiftWithZeros(this.encoded.toString())
			: Rights._decode(this.encoded, mode);
		return decoded
			? Number.parseInt(decoded[i], 10) || decoded[i]
			: null;
	}
}

Rights._scopes = {
	full: ['none', 'personal', 'local', 'enclosing', 'global'],
	short: 'npleg',
};
Rights._actions = ['create', 'read', 'update', 'delete', 'share'];

export default Rights;
