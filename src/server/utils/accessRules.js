const rules = {
	// PRIVATE

	_toSet: (obj) => {
		if(!obj) throw new Error(`Cannot convert ${obj} to Set.`);
		if(obj.constructor.name === 'Array') return new Set(obj);
		if(obj.constructor.name === 'Set') return obj;
		if(obj instanceof Object) return new Set(Object.keys(obj));
		throw new Error('Argument must be instanceof of Array or Object.');
	},
	_toSetAll: (...rest) => rest.map(rules._toSet),
	_isSubset: (a, b) => [...a].every(elem => b.has(elem)),


	// PUBLIC

	// subject-object relationship rules

	isSameUser: (subj, user) => subj.id === user.id,
	isSameOrg: (subj, org) => subj.orgId === org.id,
	isFormOwner: (subj, obj) => (
		(obj.ownerId === subj.id) // obj is form
			|| (obj.form && obj.form.ownerId === subj.id) // obj is response to form
	),


	// object rules

	isFormUnsent: (subj, form) => form.collecting === null,
	// stage of collecting responses
	isFormActive: (subj, form) => (
		!form.deleted && form.collecting && !form.collecting.inactive
			&& (!form.collecting.expires
				|| new Date(form.collecting.expires) > new Date())
	),
	// check by response if form is active
	isFormOfResponseActive: (subj, response) => (
		rules.isFormActive(subj, response.form)
	),
	isResponseToSharedForm: (subj, response) => (
		response.form.collecting && response.form.collecting.shared
			&& (response.secret === response.form.collecting.shared)
	),
	isResponseToPersonalizedForm: (subj, response) => (
		// stub before the implementation of personalized mailing
		response.form.collecting && response.form.collecting.mailing && false
	),


	// scope rules

	nowhere: () => false,
	withinOrg: (subj, obj) => obj.parentOrgIds[0] === subj.orgId,
	inSubtree: (subj, obj) => obj.parentOrgIds.includes(subj.orgId),
	everywhere: () => true,


	// common rules

	isEqual: (a, b) => (a === b),
	isElemOf: (elem, set) => rules._toSet(set).has(elem),
	isSubset: (a, b) => {
		const [setA, setB] = rules._toSetAll(a, b);
		return rules._isSubset(setA, setB);
	},
	areEqualSets: (a, b) => {
		const [setA, setB] = rules._toSetAll(a, b);
		return setA.size === setB.size && rules._isSubset(a, b);
	},
};


export default rules;
