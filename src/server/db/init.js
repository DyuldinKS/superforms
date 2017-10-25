import config from '../config';
import db from './queries';
import { recipientTypes, states, shareableTables } from './initialValues';
import Rights from '../libs/rights';
import logger from '../libs/logger';


function fillTable({ name, column, values }) {
	return db.queryAll(`SELECT ${column} FROM ${name};`)
		.then((dbRows) => {
			if(dbRows.length === values.length) return null;
			const newValues = values.filter(val => (
				!dbRows.find(row => row[column] === val)
			));
			return newValues.length > 0
				? db.query(
					`INSERT INTO ${name}(${column})
					SELECT * FROM json_array_elements_text($1);`,
					[JSON.stringify(newValues)],
				)
				: null;
		});
}


function createRoot({
	email,
	password,
	role,
	info = {},
}) {
	return db.query(
		`WITH rcp_i AS (
			INSERT INTO recipients(email, type_id, status_id)
			VALUES(
				$1,
				(SELECT id FROM recipient_types WHERE type='user'),
				(SELECT id FROM states WHERE value='active')
			)
			RETURNING id
		), 
		role_i AS (
			INSERT INTO roles(label, info, author_id)
			VALUES(
				$4,
				$5,
				(SELECT id FROM rcp_i)
			)
			RETURNING id
		), 
		user_i AS (
			INSERT INTO users(id, info, role_id, hash, author_id)
			VALUES(
				(SELECT rcp_i.id FROM rcp_i),
				$3,
				(SELECT id FROM role_i),
				$2,
				(SELECT id FROM rcp_i)
			)
		)
		INSERT INTO role_rights 
		SELECT 
			id as table_id, 
			(SELECT id FROM role_i) as role_id, 
			$6 as rights 
		FROM shareable_tables;`,
		[
			email,
			password,
			info,
			role.label,
			role.info,
			new Rights('ggggg').toInt(),
		]
	);
}

// init db
function initdb() {
	Promise.all([recipientTypes, states, shareableTables].map(fillTable))
		.then(() => db.query('SELECT * FROM recipients;'))
		.then(recs => (recs ? null : createRoot(config.root)))
		.catch(logger.error);
}

export default initdb;
