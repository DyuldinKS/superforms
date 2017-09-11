import config from '../config';
import * as db from './query.js';
// import * as a from '../libs/extraMethods'

const receivers = {

	createIfNotExists({email}) {
		return db.query(
			`WITH s AS (
			    SELECT id, email FROM receivers WHERE email = $1
			), i AS (
			    INSERT INTO receivers(email)
			    SELECT $1
			    WHERE NOT EXISTS (SELECT 1 FROM s)
			    RETURNING *
			)
			SELECT * FROM i UNION ALL SELECT * FROM s;`,
			[ email ]
		)
	},

	getBy(column, values) {
		let paramsString;
		if(typeof values === 'object') {
			paramsString = values.map( (v, i) => '$' + ++i ).join(',');
		} else {
			paramsString = '$1';
			values = [values];
		}
		return db.queryAll(
			`SELECT u.id AS user_id, 
				o.id AS org_id, 
				r.id AS receiver_id, r.email 
			FROM users u 
			FULL OUTER JOIN organizations o ON true
			JOIN receivers r ON u.receiver_id = r.id OR o.receiver_id = r.id 
			WHERE r.${column} IN (${paramsString});`,
			values
		)
	},

	getRegistered({id, email, ids, emails}) {
		return ids || id
		? this.getBy('id', ids || id)
		: this.getBy('email', emails || email)
	},

	// read({email, id}) {
	// 	const column = email? 'email' : 'id';
	// 	return db.query(
	// 		`SELECT * FROM receivers WHERE receivers.${column} = $1;`,
	// 		[ email || id ]
	// 	);
	// },

	// readAll(searchValues) {
	// 	const column = typeof searchValues[0] === 'string'? 'email' : 'id';
	// 	const set = searchValues
	// 		.map((col, i) => '$' + (i + 1))
	// 		.join(', ');
	// 	console.log(column, set, searchValues);
	// 	return db.queryAll(
	// 		`SELECT receivers.*, receiver_info.info, receiver_info.scope_id
	// 		FROM receivers LEFT JOIN receiver_info
	// 		ON receivers.id = receiver_info.receiver_id
	// 		WHERE receivers.${column} IN (${set});`,
	// 		searchValues
	// 	);
	// },

	// { column: 'id', value: '2701' }
	update(searchValue, updatedFields) {
		const column = typeof searchValue === 'string'? 'email' : 'id';
		return db.update('receivers', updatedFields, searchValue);
	},

	delete(id) {
		const column = typeof id === 'string'? 'email' : 'id';
		return db.query(
			`DELETE FROM receivers WHERE ${column} = $1`,
			[ id ]
		)
	}

}

export default receivers;