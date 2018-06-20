const toCamelCase = str => (
	str.replace(/[-_]+(.)?/g, (match, g) => (g ? g.toUpperCase() : ''))
);


const toSnakeCase = str => (
	str.replace(/([A-Z]+)/g, ([...upper]) => {
		const lower = upper.join('').toLowerCase();
		return lower.length > 1
			// example: customHTTPError -> custom_http_error
			? `_${lower.slice(0, -1)}_${lower.slice(-1)}`
			: `_${lower}`;
	})
);


function isObject(obj) {
	const unwanted = [Function, Array, Date];
	return (obj instanceof Object) && !unwanted.includes(obj.constructor);
}


const createCaseConverter = (caseType = 'camel') => {
	const converter = caseType === 'snake' ? toSnakeCase : toCamelCase;
	const convertKeys = obj => (
		Object.keys(obj).reduce(
			(cc, key) => {
				cc[converter(key)] = isObject(obj[key]) ? convertKeys(obj[key]) : obj[key];
				return cc;
			},
			{},
		)
	);

	return convertKeys;
};


export { toCamelCase, toSnakeCase, createCaseConverter };
