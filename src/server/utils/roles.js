import controllers from './accessControllers';

const {
	nowhere,
	asOwner,
	asFormOwner,
	inHisOrg,
	inSubtree,
	everywhere,
} = controllers;


const root = {
	create: {
		org: inSubtree,
		user: inSubtree,
		form: inHisOrg,
		response: everywhere,
	},
	read: {
		org: inSubtree,
		user: inSubtree,
		form: [asOwner, inSubtree],
		response: [asOwner, asFormOwner, inSubtree],
	},
	update: {
		org: inSubtree,
		user: inSubtree,
		form: [asOwner, inHisOrg, inSubtree],
		response: asOwner,
	},
};

const admin = {
	create: {
		org: nowhere,
		user: inHisOrg,
		form: inHisOrg,
		responses: everywhere,
	},
	read: {
		org: inHisOrg,
		user: inHisOrg,
		form: [asOwner, inHisOrg],
		response: [asOwner, asFormOwner, inHisOrg],
	},
	update: {
		org: inHisOrg,
		user: inHisOrg,
		form: [asOwner, inHisOrg],
		response: asOwner,
	},
};

const user = {
	create: {
		org: nowhere,
		user: nowhere,
		form: inHisOrg,
		responses: everywhere,
	},
	read: {
		org: inHisOrg,
		user: inHisOrg,
		form: [asOwner, inHisOrg],
		response: [asOwner, asFormOwner],
	},
	update: {
		org: nowhere,
		user: nowhere,
		form: asOwner,
		response: asOwner,
	},
};


export default {
	root,
	admin,
	user,
};
