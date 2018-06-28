const buildRoles = ({
	// subject-object relationship rules
	isSameUser,
	isSameOrg,
	isOwner,
	isFormOwner,
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
			// create organization with it's parent in subtree
			org: (subj, org, params) => (
				inSubtree(subj, org)
					&& areEqualSets(params, ['email', 'parentId', 'info'])
			),

			user: (subj, user, params) => (
				inSubtree(subj, user)
					&& areEqualSets(params, ['email', 'orgId', 'info', 'role'])
			),

			form: (subj, form, params) => (
				areEqualSets(params, ['title', 'description', 'scheme'])
			),

			response: everywhere,
		},

		read: {
			org: (subj, org) => inSubtree(subj, org),
			user: (subj, user) => inSubtree(subj, user),
			form: (subj, form) => inSubtree(subj, form),
			response: (subj, response) => (
				inSubtree(subj, response) || isOwner(subj, response)
			),
		},

		update: {
			org: (subj, org, props) => (
				( // update another organization
					inSubtree(subj, org) && !isSameOrg(subj, org)
						&& isSubset(props, ['email', 'active', 'info'])
				)
				|| ( // update his org
					isSameOrg(subj, org) && isSubset(props, ['email', 'info'])
				)
			),

			user: (subj, user, props) => (
				( // update another user in subtree
					inSubtree(subj, user) && !isSameUser(subj, user)
						&& isSubset(props, ['email', 'active', 'info', 'role', 'password'])
				)
				|| ( // or update himself
					isSameUser(subj, user) && isSubset(props, ['email', 'info', 'password'])
				)
			),

			form: (subj, form) => inSubtree(subj, form),
			response: (subj, response) => isOwner(subj, response),
		},
	},

	// *********************************  ADMIN  ****************************** //
	admin: {
		create: {
			org: nowhere,

			user: (subj, user, params) => (
				withinOrg(subj, user)
					&& areEqualSets(params, ['email', 'orgId', 'info', 'role'])
					&& isElemOf(params.role, ['admin', 'user'])
			),
			form: (subj, form, params) => (
				areEqualSets(params, ['title', 'description', 'scheme'])
			),

			response: everywhere,
		},

		read: {
			org: (subj, org) => isSameOrg(subj, org),
			user: (subj, user) => withinOrg(subj, user),
			form: (subj, form) => withinOrg(subj, form),

			response: (subj, response) => (
				withinOrg(subj, response) || isOwner(subj, response)
			),
		},

		update: {
			org: (subj, org, props) => (
				isSameOrg(subj, org) && isSubset(props, ['email', 'info'])
			),

			user: (subj, user, props) => (
				( // update another user in subtree
					withinOrg(subj, user) && !isSameUser(subj, user)
						&& isSubset(props, ['email', 'active', 'info', 'role', 'password'])
				)
				|| ( // or update himself
					isSameUser(subj, user) && isSubset(props, ['email', 'info', 'password'])
				)
			),

			form: (subj, form, props) => isOwner(subj, form) || withinOrg(subj, form),

			response: (subj, response, props) => isOwner(subj, response),
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
			response: everywhere,
		},

		read: {
			org: (subj, org, params = {}) => (
				isSameOrg(subj, org) && isEqual(params.section, 'forms')
			),
			user: (subj, user, params) => (
				withinOrg(subj, user) && isElemOf(params.section, ['info', 'forms'])
			),
			form: (subj, form, params) => (
				isOwner(subj, form) || withinOrg(subj, form)
			),
			response: (subj, response, params) => (
				isOwner(subj, response) || isFormOwner(subj, response)
					|| withinOrg(subj, response)
			),
		},

		update: {
			org: nowhere,
			user: nowhere,
			form: isOwner,
			response: isOwner,
		},
	},
});


export default buildRoles;
