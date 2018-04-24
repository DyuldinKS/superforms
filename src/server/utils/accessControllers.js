const controllers = {
	nowhere: () => false,
	everywhere: () => true,

	// common
	asOwner: (obj, user) => obj.ownerId === user.id,
	inHisOrg: (obj, user) => obj.parentOrgIds[0] === user.orgId,
	inSubtree: (obj, user) => obj.parentOrgIds.includes(user.orgId),

	// specific
	// only for response
	asFormOwner: (response, user) => response.formOwnerId === user.id,
	// only for org
	hisOrg: (org, user) => org.id === user.orgId,
	// withinRcptOrg: (response, user) => response.recipientId === user.orgId,
};


export default controllers;
