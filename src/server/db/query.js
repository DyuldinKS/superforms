import config from '../config';
import { Pool } from 'pg';
const pool = new Pool(config.pg);
// const logger = require('../libs/logger');


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
	console.log(queryString, data);
	return pool.query(queryString, data)
		.then(result => result.rows)
		.catch(err => {
			// err.__proto__ = DatabaseError.prototype;
			throw err;
		}) 
}


function genWhereClausePart({column, value, values}, iterator) {
	console.log(column, values)
	return value || (typeof values === 'object')
		? column + ' ' + (
				values
				? `IN (${values.map(v => '$' + iterator.value++).join(',')})`
				: '= $' + iterator.value++
			)
		: '';
}

function genWhereClause(searchParams, iterator, operator='AND') {
	console.log(searchParams)
	return (typeof searchParams === 'object')
	? 'WHERE ' + (
		searchParams.length
		? searchParams.map(attr => genWhereClausePart(attr, iterator))
			.join(` ${operator} `)
		: genWhereClausePart(searchParams, iterator)
	)
	: '';
}


function genValuesArray(params) {
	return params
	? params.length
		? params.reduce((prev, curr) => prev.concat(curr.values || curr.value), [])
		: [params.values || params.value]
	: []
}


function select(table, searchParams, operator='AND') {
	const iterator = { value: 1 };
	return queryAll(
		`SELECT * FROM ${table} ${genWhereClause(searchParams, iterator)};`,
		genValuesArray(searchParams)
	)
}


function insert(table, insertParams, onConflict='') {
	let i = 1;
	if(onConflict) {
		if(typeof onConflict !== 'string' 
			|| ~[
				'on conflict do nothing',
				'on conflict do update'
			].indexOf( onConflict.toLowerCase() === -1)
		) {
			onConflict = '';
		}
	}

	const genColumnsPart = column => '$' + i++;
	
	const genValuesPart = valuesRow => (
		'(' + valuesRow.map( () => '$' + i++ ).join(', ') + ')'
	);

	// const columnsPart = fields.map(genColumnsPart).join(', ');
	const valuesPart = values.map(genValuesPart).join(', ');

	values = values.reduce( 
		(prev, curr) => prev.concat(curr),
		[] //[ table, ...fields ]
	);

	return query(
		`INSERT INTO ${table}(${fields.join(', ')}) VALUES${valuesPart} 
		${onConflict.toUpperCase()} RETURNING *;`,
		values
	);
}


function insert(table, fields, values, onConflict='') {
	let i = 1;
	if(onConflict) {
		if(typeof onConflict !== 'string' 
			|| ~[
				'on conflict do nothing',
				'on conflict do update'
			].indexOf( onConflict.toLowerCase() === -1)
		) {
			onConflict = '';
		}
	}

	const genColumnsPart = column => '$' + i++;
	
	const genValuesPart = valuesRow => (
		'(' + valuesRow.map( () => '$' + i++ ).join(', ') + ')'
	);

	// const columnsPart = fields.map(genColumnsPart).join(', ');
	const valuesPart = values.map(genValuesPart).join(', ');

	values = values.reduce( 
		(prev, curr) => prev.concat(curr),
		[] //[ table, ...fields ]
	);

	return query(
		`INSERT INTO ${table}(${fields.join(', ')}) VALUES${valuesPart} 
		${onConflict.toUpperCase()} RETURNING *;`,
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

	const conditions = Object.keys(searchParams)
		.map(genConditionRow)
		.join(` ${operator} `)

	const values = Object.values(updatedFields).concat( ...Object.values(searchParams) );
	// console.log(`UPDATE ${table} SET ${update} WHERE ${condition};`, values)
	return query(
		`UPDATE ${table} SET ${update} WHERE ${conditions};`,
		values
	);	
}


export { pool, query, queryAll, select, insert, update, };