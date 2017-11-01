const recipientTypes = {
	name: 'recipient_types',
	column: 'type',
	values: ['unregistered', 'user', 'organization'],
};

const states = {
	name: 'states',
	column: 'value',
	values: [
		'created',
		'updated',
		'deleted',
		'waiting',
		'active',
		'blocked',
		'notAvailable',
	],
};

const shareableTables = {
	name: 'shareable_tables',
	column: 'name',
	values: [
		'organizations',
		'users',
		'forms',
		'responses',
		'roles',
		'recipients',
		'recipients_lists',
	],
};


export default {
	recipientTypes,
	states,
	shareableTables,
};
