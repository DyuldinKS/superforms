import config from '../config';
import * as db from './query.js';
import constTables from './constTables.js'; 

const users = {

	create() {

	},

	getByReceiver({email, id}) {
		const column = id? 'id' : 'email';
		return db.query(
			`SELECT users.*, receivers.email as email, (
				SELECT json_object_agg(action_id, scope_id) 
				FROM role_actions
				WHERE role_id = users.role_id
				GROUP by role_id
			) AS actions,
			(SELECT info FROM roles WHERE id = users.role_id) AS role
			FROM users 
			JOIN receivers ON users.receiver_id = receivers.id 
			WHERE receivers.${column} = $1
			;`,
			[ id || email ]
		);
	},

	readAll() {
	
	},

	update() {

	},


}

// users.getByReceiver({ id: 1 })
// 	.then(console.log)
// 	.catch(console.log)

export default users;