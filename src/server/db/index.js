import config from '../config';
import * as queries from './query.js';
import receivers from './receivers.js';
import organizations from './organizations';
// import constTables from './constTables.js';
import users from './users.js';
// import forms from './forms.js';
// import responses from './responses.js';


// console.log(receivers, organizations)
const db = {
	receivers,
	organizations,
	users,
	// ...constTables,
}

export default db;

// function createSessionsTable() {
// 	return query(
// 			`CREATE TABLE sessions (
// 				"sid" varchar NOT NULL COLLATE "default",
// 				"sess" JSON NOT NULL,
// 				"expire" TIMESTAMP(6) NOT NULL
// 			) WITH (OIDS=FALSE);`
// 		)
// 		.then( () => query(
// 				`ALTER TABLE sessions 
// 				ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
// 				NOT DEFERRABLE INITIALLY IMMEDIATE;`
// 			)
// 		)
// 		.then( () => { logger.log('INFO', '"sessions" table has been created.') })
// 		.catch( (err) => {
// 			if(err.code !== '42P07') throw err
// 		})
// }
