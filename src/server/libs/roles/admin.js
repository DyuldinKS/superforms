export default ({
	nowhere,
	everywhere,
	withinOrg,
	isSameUser,
	isSameOrg,
	isEqual,
	isElemOf,
	isSubset,
	areEqualSets,
}) => ({
	create: {
		org: nowhere,

		user: (subj, user, { body }) => (
			withinOrg(subj, user)
				&& areEqualSets(body, ['email', 'orgId', 'info', 'role'])
				&& isElemOf(body.role, ['admin', 'user'])
		),

		form: (subj, form, { body }) => (
			isSubset(body, ['title', 'description', 'scheme'])
				&& isSubset(['title', 'scheme'], body)
		),

		response: everywhere,
		recipient: nowhere,
	},

	read: {
		org: (subj, org, { query, subpath }) => (
			isSameOrg(subj, org)
				&& (!isElemOf(subpath, ['orgs/new', 'orgs', 'users'])
					// can not change default maxDepth = 0
					|| (isEqual(subpath, 'users') && !isElemOf('maxDepth', query)))
		),
		user: withinOrg,
		form: withinOrg,
		response: withinOrg,
		recipient: everywhere,
	},

	update: {
		org: (subj, org, { body }) => (
			isSameOrg(subj, org) && isSubset(body, ['email', 'info'])
		),

		user: (subj, user, { body }) => (
			// updates another user in subtree
			(withinOrg(subj, user) && !isSameUser(subj, user))
			// or updates himself
			|| (isSameUser(subj, user)
				&& isSubset(body, ['email', 'info', 'password']))
		),

		form: withinOrg,

		response: (subj, response, { body }) => (
			// soft deletion or recovering
			withinOrg(subj, response) && areEqualSets(body, ['deleted'])
		),

		recipient: nowhere,
	},
});
