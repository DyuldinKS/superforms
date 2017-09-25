import config from '../config';
import * as db from './query';
import { recipientTypes, states, shareableTables } from './initialValues';
import rights from './rights';
import logger from '../libs/logger';


function fillTable({name, columns}) {
	const colsList = Object.keys(columns),
		rowsNum = columns[ colsList[0] ].length;
	let dataRows = new Array(rowsNum);

	for(let i = 0; i < rowsNum; i++) {
		dataRows[i] = colsList.map(colName => columns[colName][i])
	}
	return db.insert(name, colsList, dataRows, 'on conflict do nothing');
}


function createRoot({
	email, 
	password, 
	info={}, 
	roleInfo={},
}) {
	return db.query(
		`WITH rec_i AS (
			INSERT INTO recipients(email, type_id, status_id)
			VALUES(
				$1,
				(SELECT id FROM recipient_types WHERE type='user'),
				(SELECT id FROM states WHERE value='active')
			)
			RETURNING id
		), 
		role_i AS (
			INSERT INTO roles(info, author_id)
			VALUES(
				$4,
				(SELECT id FROM rec_i)
			)
			RETURNING id
		), 
		user_i AS (
			INSERT INTO users(id, info, role_id, hash, author_id)
			VALUES(
				(SELECT rec_i.id FROM rec_i),
				$3,
				(SELECT id FROM role_i),
				$2,
				(SELECT id FROM rec_i)
			)
		)
		INSERT INTO role_rights 
		SELECT 
			id as table_id, 
			(SELECT id FROM role_i) as role_id, 
			${rights.encode('ggggg')} as rights 
		FROM shareable_tables;`,
		[ email, password, info, roleInfo ]
	);
}

// init db
(function() {
	Promise.all( [recipientTypes, states, shareableTables].map(fillTable) )
		.then( () => db.select('recipients') )
		.then( recs => {
			if(recs.length === 0) {
				return createRoot(config.root) 
			}
		})
		.catch(console.log)
})();

