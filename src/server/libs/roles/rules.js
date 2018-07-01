import { isObject, isSet, isArray } from '../../utils/extras';


const toSet = (arg) => {
	if(isArray(arg)) return new Set(arg);
	if(isObject(arg)) return new Set(Object.keys(arg));
	if(isSet(arg)) return arg;
	throw new Error('Argument must be instanceof of Array or Object.');
};

const toSetAll = (...rest) => rest.map(toSet);

const	isSubset = (a, b) => [...a].every(elem => b.has(elem));


const rules = {
	/* --------------------- SUBJECT-OBJECT RELATION RULES -------------------- */
	/*
	SOR rules define how object is associated to subject.
	*/

	isSameUser: (subj, user) => subj.id === user.id,

	isSameOrg: (subj, org) => subj.orgId === org.id,

	isFormOwner: (subj, obj) => (
		(obj.ownerId === subj.id) // obj is form
			|| (obj.form && obj.form.ownerId === subj.id) // obj is response to form
	),


	/* ---------------------------- OBJECT RULES ------------------------------ */
	/*
	Object rules use to check some states, property values of an object
	or how object is related to associated object.
	*/

	// form is under develpment
	isFormUnsent: (subj, form) => form.collecting === null,

	// form is on the stage of collecting responses
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


	/* ----------------------------- SCOPE RULES ------------------------------ */
	/*
	Scope rules determine to which organization object belongs,
	and how this organization relates to organization of subject.

	The logic of belonging to organization:
		user -> org
		form -> owner (user) -> org
		response -> form -> owner -> org

	Each instance contains list of parent ids relative it's organization.
	Parent list ordered by distance and includes current org itself on index 0.

	If parent list of object includes organization of subject, object is in subtree.
	*/

	nowhere: () => false,

	withinOrg: (subj, obj) => obj.parentOrgIds[0] === subj.orgId,

	inSubtree: (subj, obj) => obj.parentOrgIds.includes(subj.orgId),

	everywhere: () => true,


	/* ------------------------------ SET RULES ------------------------------- */
	/*
	Set rules use to verify set of input parameters.
	For objects here is checked only set of KEYS.
	The validation of prop values is performed by data model.
	*/
	isEqual: (a, b) => (a === b),

	isElemOf: (elem, set) => toSet(set).has(elem),

	isSubset: (a, b) => {
		const [setA, setB] = toSetAll(a, b);
		return isSubset(setA, setB);
	},

	areEqualSets: (a, b) => {
		const [setA, setB] = toSetAll(a, b);
		return setA.size === setB.size && isSubset(a, b);
	},
};


export default rules;
