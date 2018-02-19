import staticTables from '../db/staticTables.json';

const { states, rcptTypes, roles } = staticTables;
const pgProps = [
	'status_id',
	'type_id',
	'role_id',
	'author_id',
	'user_id',
	'org_id',
	'chief_org_id',
];


const convertToCamelCase = str => (
	str.replace(/[-_]+(.)?/g, (match, g) => (g ? g.toUpperCase() : ''))
);


const camelCasedProps = {};
const snakeCasedProps = {};

let camelCased;
pgProps.forEach((pgProp) => {
	camelCased = convertToCamelCase(pgProp);
	camelCasedProps[pgProp] = camelCased;
	snakeCasedProps[camelCased] = pgProp;
});

// for static ids properties convertion
const staticValuesProps = {
	statusId: {
		propName: 'status',
		convert: status => states.values[status],
	},
	typeId: {
		propName: 'type',
		convert: type => rcptTypes.values[type],
	},
	roleId: {
		propName: 'role',
		convert: role => roles.values[role],
	},
};

// for static values properties convertion
const staticIdsProps = {
	status: {
		propName: 'statusId',
		convert: status => states.ids[status],
	},
	type: {
		propName: 'typeId',
		convert: type => rcptTypes.ids[type],
	},
	role: {
		propName: 'roleId',
		convert: role => roles.ids[role],
	},
};

// const toCamelCase = prop => camelCasedProps[prop] || prop;
// const toSnakeCase = prop => snakeCasedProps[prop] || prop;
// const toIdProp = prop => idsProps[prop];


export {
	camelCasedProps,
	snakeCasedProps,
	staticValuesProps,
	staticIdsProps,
};
