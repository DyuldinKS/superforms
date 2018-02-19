import fs from 'fs';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import config from '../config';
import db from './queries';
import logger from '../libs/logger';


function fillTable({
	name,
	label,
	column,
	values,
}) {
	return db.query(
		`WITH inserted AS (
			INSERT INTO ${name}(${column})
			SELECT value
			FROM (
				SELECT json_array_elements_text($1) AS value
			) AS default_values
			WHERE value NOT IN (
				SELECT ${column} FROM ${name}
			)
			RETURNING *
		),
		all_entries AS (
			SELECT * FROM ${name} UNION ALL SELECT * FROM inserted
		)
		SELECT json_build_object(
			'ids', (
				SELECT json_object_agg(${column}, id) FROM all_entries
			),
			'values', (
				SELECT json_object_agg(id, ${column}) FROM all_entries
			)
		)	AS "${label || name}";`,
		[JSON.stringify(values)],
	);
}


function createRootWithOrg({
	email,
	password,
	info = {},
	org,
}) {
	return bcrypt.hash(password, config.bcrypt.saltRound)
		.then(hash => db.query(
			`WITH rcpt_user_i AS (
				INSERT INTO recipients(email, type_id)
				VALUES(
					$1,
					(SELECT id FROM recipient_types WHERE name='user')
				)
				RETURNING id
			),
			rcpt_org_i AS (
				INSERT INTO recipients(email, type_id)
				VALUES(
					$2,
					(SELECT id FROM recipient_types WHERE name='org')
				)
				RETURNING id
			),
			org_i AS (
				INSERT INTO organizations(id, info, author_id)
				VALUES(
					(SELECT id FROM rcpt_org_i),
					$3,
					(SELECT id FROM rcpt_user_i)
				)
				RETURNING id
			)
			INSERT INTO users(id, org_id, info, role_id, hash, author_id)
			VALUES(
				(SELECT id FROM rcpt_user_i),
				(SELECT id FROM rcpt_org_i),
				$4,
				(SELECT id FROM roles WHERE name = 'root'),
				$5,
				(SELECT id FROM rcpt_user_i)
			)
			RETURNING *;`,
			[
				email,
				org.email,
				org.info,
				info,
				hash,
			],
		));
}


const fsWriteFile = promisify(fs.writeFile);

const rcptTypes = {
	name: 'recipient_types',
	label: 'rcptTypes',
	column: 'name',
	values: ['unregistered', 'user', 'org'],
};

const states = {
	name: 'states',
	label: 'states',
	column: 'name',
	values: [
		'created',
		'updated',
		'deleted',
		'waiting',
		'active',
		'blocked',
		'notAvailable',
	],
};

const tables = {
	name: 'tables',
	column: 'name',
	values: [
		'orgs',
		'users',
		'forms',
		'responses',
		'roles',
		'rcpttLists',
	],
};

const roles = {
	name: 'roles',
	column: 'name',
	values: [
		'root',
		'admin',
		'user',
		'respondent',
	],
};


function initdb() {
	const path = './src/server/db/staticTables.json';

	// init tables with constant values
	Promise.all(Object.values({
		rcptTypes,
		states,
		roles,
		tables,
	})
		// write all values to json
		.map(fillTable))
		.then(stored => fsWriteFile(
			path,
			JSON.stringify(Object.assign({}, ...stored)),
		))
		.then(() => logger.info(`All constant values were writted to '${path}'`))
		// create the root-user
		.then(() => createRootWithOrg(config.root))
		.then(() => logger.info('The root-user was successfully created'))
		.catch(logger.error);
}

initdb();
