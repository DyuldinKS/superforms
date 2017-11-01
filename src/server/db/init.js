import fs from 'fs';
import { promisify } from 'util';
import config from '../config';
import db from './queries';
import Rights from '../libs/rights';
import initialValues from './initialValues';
import logger from '../libs/logger';


const toCamelCase = str => (
	str.replace(/[-_]+(.)?/g, (match, g) => (g ? g.toUpperCase() : ''))
);

function fillTable({ name, column, values }) {
	return db.query(
		`WITH values_list AS (
			SELECT * FROM json_array_elements_text($1)
		), inserted AS (
			INSERT INTO ${name}(${column})
			SELECT value FROM values_list WHERE value NOT IN (
				SELECT value from ${name}
			)
			RETURNING *
		)
		SELECT json_object_agg(${column}, id) AS "${toCamelCase(name)}"
		FROM (
			SELECT * FROM ${name} UNION ALL SELECT * FROM inserted
		) AS selected;`,
		[JSON.stringify(values)],
	);
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
		],
	);
}

const fsWriteFile = promisify(fs.writeFile);

function initdb() {
	const path = './src/server/db/storedConstValues.json';

	Promise.all(Object.values(initialValues).map(fillTable))
		.then(stored => fsWriteFile(
			path,
			JSON.stringify(Object.assign({}, ...stored)),
		))
		.then(() => logger.info(`all constant values were writted to '${path}'\n`))
		.then(() => db.query('SELECT * FROM recipients;'))
		.then(recs => (recs ? null : createRoot(config.root)))
		.catch(logger.error);
}

initdb();
