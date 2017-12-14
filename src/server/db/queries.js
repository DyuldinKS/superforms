import pool from './pool';
import { PgError } from '../libs/errors';


function queryAll(queryString, values) {
	if(process.env.NODE_ENV === 'development') {
		// console.log(queryString, values);
	}
	return pool.query(queryString, values)
		.then(result => result.rows)
		.catch((err) => {
			throw new PgError(err);
		});
}

function query(queryString, values) {
	return queryAll(queryString, values)
		.then(result => result[0]);
}


class Query {
	constructor() {
		this.query = '';
		this.values = [];
	}


	select(columns) {
		const selected = columns ? `${columns.join(',')}` : '*';
		this.query += `SELECT ${selected}`;
		return this;
	}


	update(table) {
		this.query += `UPDATE ${table}`;
		return this;
	}


	set(props) {
		let queryPart = ' SET';
		Object.entries(props).forEach(([prop, value]) => {
			this.values.push(value);
			queryPart += ` ${prop} = $${this.values.length},`;
		});
		this.query += queryPart.slice(0, -1);
		return this;
	}


	from(table) {
		this.query += ` FROM ${table}`;
		return this;
	}


	join(table) {
		this.query += ` JOIN ${table}`;
	}


	// on() {

	// }

	// equals() {

	// }

	// less() {

	// }


	where(props) {
		if(typeof props === 'object') {
			let queryPart = ' WHERE';
			Object.entries(props).forEach(([prop, value]) => {
				this.values.push(value);
				queryPart += ` ${prop} = $${this.values.length},`;
			});
			this.query += queryPart.slice(0, -1);
			return this;
		}
		this.query += ` WHERE ${props}`;
		return this;
	}


	in(values, type) {
		this.values.push(JSON.stringify(values));
		const typecast = type ? `::${type}` : '';
		this.query += ` IN (SELECT json_array_elements_text($${this.values.length})${typecast})`;
	}


	returning(columns) {
		const selected = columns ? `${columns.join(',')}` : '*';
		this.query += `RETURNING ${selected}`;
		return this;
	}


	run() {
		return queryAll(this.query, this.values);
	}
}


function createQuery() {
	return new Query();
}


export default {
	createQuery,
	query,
	queryAll,
};
