const roles = {
	tableName: 'roles',
	records: {
		1: 'root',
		2: 'admin',
		3: 'user',
		4: 'respondent',
	},
};


function deepFreeze(obj) {
	let prop;
	// Freeze properties before freezing self
	Object.getOwnPropertyNames(obj)
		.forEach((name) => {
			prop = obj[name];
			// Freeze prop if it is an object
			if(typeof prop === 'object' && prop !== null) {
				deepFreeze(prop);
			}
		});

	// Freeze self (no-op if already frozen)
	return Object.freeze(obj);
}


const consts = Object.entries({ roles })
	.reduce(
		(conv, [label, { tableName, records }]) => {
			const ids = Object.entries(records)
				.reduce(
					(prev, [id, value]) => Object.assign(prev, { [value]: id }),
					{},
				);

			return Object.assign(
				conv,
				{
					[label]: {
						tableName,
						ids,
						values: records,
					},
				},
			);
		},
		{},
	);


deepFreeze(consts);


export default consts;
