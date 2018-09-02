import './envLoader';
import db from 'Server/db';


const tables = [
	'recipients', // users and organizations too
	'forms',
	'responses',
	'logs',
];

const sequences = {};

// get the last id of the each sequence from db
before(() => (
	Promise.all(tables.map((table) => (
		db.query(`SELECT * FROM ${table}_id_seq;`)
			.then(seq => { sequences[table] = seq; })
	)))
		.then(() => { console.log('Start:', new Date()); })
));

// delete all test data from db
after(() => {
	console.log('End:', new Date());

	// avoid violations of foreign key constraint
	tables.reverse();
	let chain = Promise.resolve();

	tables.forEach((table) => {
		const { is_called: isCalled, last_value } = sequences[table];
		const lastValue = +last_value;
		const more = isCalled ? '>' : '>=';
		const restartVal = isCalled ? lastValue + 1 : lastValue;

		chain = chain.then(() => (
			db.query(
				table !== 'recipients' 
					? `DELETE FROM ${table} WHERE id ${more} $1;`
					// delete users, orgs, recipients in one transaction
					: `WITH deleted_users AS (DELETE FROM users WHERE id ${more} $1 RETURNING *),
						deleted_orgs AS (DELETE FROM organizations WHERE id ${more} $1 RETURNING *)
					DELETE FROM recipients WHERE id ${more} $1 RETURNING *;`,
				[lastValue],
			)
				.then(() => (
					db.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH ${restartVal};`)
				))
				// if error occured do not prevent deleting data in other tables
				.catch(console.error)
		))
	})

	return chain.then(() => { console.log('sequences:', sequences); });
})
