import config from '../config';
import { Pool } from 'pg';
const pool = new Pool(config.pg);
// const logger = require('../libs/logger');


process.on('unhandledRejection', function(e) {
	console.log(e.message, e.stack)
})


function query(queryString, data) {
	console.log(queryString, data)
	return pool.query(queryString, data)
		.then(result => result.rows[0])
		.catch(err => {
			// err.__proto__ = DatabaseError.prototype;
			throw err;
		}) 
}


function queryAll(queryString, data) {
	return pool.query(queryString, data)
		.then(result => result.rows)
		.catch(err => {
			// err.__proto__ = DatabaseError.prototype;
			throw err;
		}) 
}


function insert(table, fields, values) {
	let i = 1;

	const genColumnsPart = column => '$' + i++;
	
	const genValuesPart = rowValues => (
		'(' + rowValues.map( () => '$' + i++ ).join(', ') + ')'
	);

	// const columnsPart = fields.map(genColumnsPart).join(', ');
	const valuesPart = values.map(genValuesPart).join(', ');

	values = values.reduce( 
		(prev, curr) => prev.concat(curr), []//[ table, ...fields ]
	);

	return query(
		`INSERT INTO ${table}(${fields.join(', ')})
		VALUES${valuesPart} RETURNING *;`,
		values
	);
}


function update(table, updatedFields, searchParams, operator='AND') {
	let i = 1;
	const update = Object.keys(updatedFields)
		.map(attr => attr + ' = $' + i++)
		.join(', ');

	const genConditionRow = attr  => (
		typeof(searchParams[attr]) === 'object'
		? `${attr} IN (${searchParams[attr].map(v => '$' + i++).join(',')})`
		: attr + ' = $' + i++
	);

	const condition = Object.keys(searchParams)
		.map(genConditionRow)
		.join(` ${operator} `)

	const values = Object.values(updatedFields).concat( ...Object.values(searchParams) );
	// console.log(`UPDATE ${table} SET ${update} WHERE ${condition};`, values)
	return query(
		`UPDATE ${table} SET ${update} WHERE ${condition};`,
		values
	);	
}


export { query, queryAll, insert, update, };