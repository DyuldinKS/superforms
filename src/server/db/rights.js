class Rights {
	
	constructor(props) {
		Object.defineProperty(
			this.actions,
			'length', 
			{ value: Object.keys(this.actions).length }
		)
	}

	actions = {
		create: 0,
		read: 1,
		update: 2,
		delete: 3,
		share: 4,
	}
	
	scopes = {
		full: [ 'none', 'personal', 'local', 'enclosing', 'global' ],
		short: 'npleg'
	}

	encode(scopes) {
		if(scopes.length !== this.actions.length) {
			throw new Error('invalid rights');
		}
		const {short, full} = this.scopes;
		const searchArray = typeof scopes === 'string' ? short : full;
		const toNumber = scope => searchArray.indexOf(scope);

		return Number( Array.from(scopes).map(toNumber).join('') );
	}

	decode(encoded, mode) { 
		// set default if mode value is incorrect
		mode = ~Object.keys(this.scopes).indexOf(mode)? mode : 'full';
		const decoded = Array.from( this.unshiftWithZeros(encoded) )
			.map( n => this.scopes[mode][n] );
		return mode === 'short'? decoded.join('') : decoded;
	}
	
	unshiftWithZeros(scopeNum) {
		if(typeof scopeNum === 'number') {
			scopeNum = '' + scopeNum;
		}
		return '0'.repeat(this.actions.length - scopeNum.length) + scopeNum;
	}

}

// const rights = new Rights;

export default new Rights;