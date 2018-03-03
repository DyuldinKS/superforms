import bcrypt from 'bcrypt';
import config from '../config';
import consts from './consts';
import db from '../db';


function fillTable({ tableName, values }) {
	return db.queryAll(
		`INSERT INTO ${tableName}(id, name)
		SELECT key::int, value::text
		FROM json_each_text($1::json) pair
		WHERE value NOT IN (
			SELECT name FROM ${tableName}
		)
		RETURNING *;`,
		[values],
	);
}


function createRootWithOrg() {
	const { email, password } = config.root;
	const org = {
		email: '1984@org',
		info: {
			label: '1984',
			slogan: 'Big Brother is watching you',
		},
	};

	const types = consts.rcptTypes.ids;
	return bcrypt.hash(password, config.bcrypt.saltRound)
		.then(hash => db.queryAll(`BEGIN;

			INSERT INTO recipients(email, type_id, author_id)
			VALUES('${email}', ${types.user}, 1);

			INSERT INTO recipients(email, type_id, author_id)
			VALUES('${org.email}', ${types.org}, 1);

			SELECT create_org(2, '${JSON.stringify(org.info)}'::jsonb, 1);

			SELECT create_user(1, 2, '{}'::jsonb, 'root', null, 1);
			SELECT update_user(1, '{ "hash": "${hash}" }'::json, 1);

			COMMIT;`));
}


function initdb() {
	// init tables with constant values
	const tables = Object.values(consts);
	Promise.all(tables.map(fillTable))
		.then(() => console.log('All constant values were written to database'))
		.then(createRootWithOrg)
		.then(() => console.log('The root-user was successfully created'))
		.catch(console.error);
}

initdb();
