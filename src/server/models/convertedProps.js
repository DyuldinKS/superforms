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


function build() {
	const toCamelCase = {};
	const toSnakeCase = {};

	let prop;
	pgProps.forEach((pgProp) => {
		prop = convertToCamelCase(pgProp);
		toCamelCase[pgProp] = prop;
		toSnakeCase[prop] = pgProp;
	});

	return { toCamelCase, toSnakeCase };
}


export default build();
