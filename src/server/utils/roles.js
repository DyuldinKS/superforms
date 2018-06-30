const buildRoles = ({
	// subject-object relationship rules
	isSameUser,
	isSameOrg,
	isFormOwner,
	// object rules
	isFormUnsent,
	isFormActive,
	isFormOfResponseActive,
	isResponseToSharedForm,
	isResponseToPersonalizedForm,
	// scope rules
	nowhere,
	withinOrg,
	inSubtree,
	everywhere,
	// common
	isEqual,
	isElemOf,
	isSubset,
	areEqualSets,
}) => ({
	// *********************************  ROOT  ******************************* //
	root: {
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
	},


	// *********************************  ADMIN  ****************************** //

	admin: {
		create: {
			org: nowhere,

			user: (subj, user, { body }) => (
				withinOrg(subj, user)
					&& areEqualSets(body, ['email', 'orgId', 'info', 'role'])
					&& isElemOf(body.role, ['admin', 'user'])
			),

			form: (subj, form, { body }) => (
				areEqualSets(body, ['title', 'description', 'scheme'])
			),

			response: (subj, response) => (
				isFormOfResponseActive(subj, response)
					&& isResponseToSharedForm(subj, response)
			),
		},

		read: {
			org: (subj, org, { subpath }) => (
				isSameOrg(subj, org) && !isEqual(subpath, 'orgs/new')
			),
			user: withinOrg,
			form: withinOrg,
			response: withinOrg,
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
		},
	},


	// *********************************  USER  ******************************* //

	user: {
		create: {
			org: nowhere,
			user: nowhere,
			form: (subj, form, params) => (
				areEqualSets(params, ['title', 'description', 'scheme'])
			),
			response: (subj, response) => (
				isFormOfResponseActive(subj, response)
					&& isResponseToSharedForm(subj, response)
			),
		},

		read: {
			org: (subj, org, { subpath }) => (
				isSameOrg(subj, org) && isEqual(subpath, 'forms')
			),
			user: (subj, user, { subpath }) => (
				// reads another user in his org
				(withinOrg(subj, user) && !isSameUser(subj, user)
					&& isElemOf(subpath, [undefined, 'info', 'forms']))
				// reads himself
				// subpath is undefined for api request to get user
				|| (isSameUser(subj, user)
						&& isElemOf(subpath, [undefined, 'info', 'forms', 'settings']))
			),
			form: (subj, form, { subpath }) => (
				isFormOwner(subj, form)
					// only preview of foreign forms
					// subpath === undefined for interview page or api request to get form
					|| (withinOrg(subj, form) && !isFormOwner(subj, form)
						&& isSubset(subpath, [undefined, 'preview']))
			),
			response: (subj, response) => isFormOwner(subj, response),
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
	},
});


export default buildRoles;
