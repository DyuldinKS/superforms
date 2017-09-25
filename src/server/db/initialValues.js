const recipientTypes = {
	name: 'recipient_types',
	columns: { 
		type: ['unregistered', 'user', 'organization']
	},
}

const states = {
	name: 'states',
	columns: {
		value: [
			'created',
			'updated',
			'deleted',
			'waiting',
			'active',
			'banned',
			'not_available'
		]
	}
}

const shareableTables = {
	name: 'shareable_tables',
	columns: { 
		name: [
			'organizations',
			'users',
			'forms',
			'responses',
			'roles',
			'receivers',
			'receiver_lists'
		]
	},
}


export {
	recipientTypes,
	states,
	shareableTables
}