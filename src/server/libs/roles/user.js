export default ({
	nowhere,
	everywhere,
	withinOrg,
	isSameUser,
	isSameOrg,
	isFormOwner,
	isFormUnsent,
	isElemOf,
	isSubset,
	areEqualSets,
}) => ({
	create: {
		org: nowhere,
		user: nowhere,

		form: (subj, form, params) => (
			areEqualSets(params, ['title', 'description', 'scheme'])
		),

		response: everywhere,
	},

	read: {
		org: (subj, org, { subpath }) => (
			isSameOrg(subj, org) && isElemOf(subpath, ['', 'forms', 'info'])
		),

		user: (subj, user, { subpath }) => (
			// reads another user in his org
			(withinOrg(subj, user) && !isSameUser(subj, user)
				&& isElemOf(subpath, ['', 'info', 'forms']))
			// reads himself
			// subpath === '' for api request to get user
			|| (isSameUser(subj, user)
					&& isElemOf(subpath, ['', 'info', 'forms', 'settings']))
		),

		form: (subj, form, { subpath }) => (
			isFormOwner(subj, form)
				// only preview of foreign forms
				// subpath === '' for interview page or api request to get form
				|| (withinOrg(subj, form) && !isFormOwner(subj, form)
					&& isElemOf(subpath, ['', 'preview']))
		),

		response: isFormOwner,
	},

	update: {
		org: nowhere,

		user: (subj, user, { body }) => (
			// updates himself
			isSameUser(subj, user) && isSubset(body, ['email', 'info', 'password'])
		),

		form: (subj, form, { body }) => (
			isFormOwner(subj, form)
				&& (// if form is under developing
					(isFormUnsent(subj, form) && !isElemOf('ownerId', body))
					// if responses collecting started
					|| (!isFormUnsent(subj, form)
						&& isSubset(body, ['title', 'description', 'collecting'])))
		),

		response: (subj, response, { body }) => (
			// soft deletion or recovering
			withinOrg(subj, response) && areEqualSets(body, ['deleted'])
		),
	},
});
