const toSet = (obj) => {
	if(!obj) throw new Error('Empty set');
	if(obj.constructor.name === 'Set') return obj;
	if(obj.constructor.name === 'Array') return new Set(obj);
	if(obj instanceof Object) return new Set(Object.keys(obj));
	throw new Error('argument must be instanceof of Array or Object');
};

const rules = {
	// subject-object relationship rules
	isSameUser: (subj, user) => subj.id === user.id,
	isSameOrg: (subj, org) => subj.orgId === org.id,
	isOwner: (subj, obj) => obj.ownerId === subj.id,
	isFormOwner: (subj, response) => response.formOwnerId === subj.id,

	// scope rules
	nowhere: () => false,
	withinOrg: (subj, obj) => obj.parentOrgIds[0] === subj.orgId,
	inSubtree: (subj, obj) => obj.parentOrgIds.includes(subj.orgId),
	everywhere: () => true,

	// common rules
	isEqual: (a, b) => (a === b),
	isElemOf: (elem, set) => toSet(set).has(elem),
	isSubset: (a, b) => {
		const setB = toSet(b);
		return [...toSet(a)].every(elem => setB.has(elem));
	},
	areEqualSets: (a, b) => {
		const setA = toSet(a);
		const setB = toSet(b);
		return setA.size === setB.size && rules.isSubset(a, b);
	},
};


export default rules;
