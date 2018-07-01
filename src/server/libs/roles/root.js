export default ({
	inSubtree,
	isSameUser,
	isSameOrg,
	isFormOfResponseActive,
	isResponseToSharedForm,
	isSubset,
	areEqualSets,
}) => ({
	create: {
		// create organization is his org subtree
		org: (subj, org, { body }) => (
			inSubtree(subj, org)
				&& areEqualSets(body, ['email', 'parentId', 'info'])
		),

		user: (subj, user, { body }) => (
			inSubtree(subj, user)
				&& areEqualSets(body, ['email', 'orgId', 'info', 'role'])
		),

		form: (subj, form, { body }) => (
			isSubset(body, ['title', 'description', 'scheme'])
				&& isSubset(['title', 'description'], body)
		),

		response: (subj, response) => (
			isFormOfResponseActive(subj, response)
				&& isResponseToSharedForm(subj, response)
		),
	},

	read: {
		org: inSubtree,
		user: inSubtree,
		form: inSubtree,
		response: inSubtree,
	},

	update: {
		org: (subj, org, { body }) => (
			// updates another organization in subtree
			(inSubtree(subj, org) && !isSameOrg(subj, org)
				&& isSubset(body, ['email', 'active', 'info', 'deleted']))
			// updates his org
			|| (isSameOrg(subj, org) && isSubset(body, ['email', 'info']))
		),

		user: (subj, user, { body }) => (
			// updates another user in subtree
			(inSubtree(subj, user) && !isSameUser(subj, user))
			// or updates himself
			|| (isSameUser(subj, user)
				&& isSubset(body, ['email', 'info', 'password']))
		),

		form: inSubtree,

		response: (subj, response, { body }) => (
			// soft deletion or recovering
			inSubtree(subj, response) && areEqualSets(body, ['deleted'])
		),
	},
});
