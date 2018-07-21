import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import db from '../../../src/server/db';
import passwordGenerator from '../../../src/server/libs/passwordGenerator';


const fsReadFile = promisify(fs.readFile);


const loadData = () => {
	const files = [
		'mscDistrictOrgs.json',
		'imc-users.tmp',
		'imc-forms.tmp',
		'imc-responses.tmp',
	];

	// read files
	return Promise.all(
		files.map(file => (
			fsReadFile(path.join(__dirname, file))
		)),
	)
		// parse files
		.then(([imcOrgs, ...imcData]) => {
			const { schools, kindergartens } = JSON.parse(imcOrgs);
			const orgs = [...schools.values, ...kindergartens.values];

			const [users, forms, responses] = imcData.map(buffer => (
				buffer.toString()
					.trim()
					.replace(/\\\\/g, '\\') // replace '\\' with '\'
					.split('\n')
					.map(JSON.parse)
			));

			return { orgs, users, forms, responses };
		})
};


const getBot = () => db.query('SELECT min(id) AS id FROM users;');
const getSystem = () => db.query('SELECT min(id) AS id FROM organizations;');


const getOrCreateOrg = (org, parent, author) => (
	db.query('SELECT * FROM get_or_create_rcpt($1, $2)', [org, author.id])
		.then((rcpt) => {
			org.parentId = parent.id;
			org.id = rcpt.id;

			switch (rcpt.type) {
				case 'org': {
					console.log(`Loading '${org.info.label}'`);
					return db.query('SELECT * FROM get_org($1)', [org.id]);
				}
				case 'rcpt': {
					console.log(`Creating '${org.info.label}'`);
					return db.query(
						'SELECT * FROM create_org($1::int, $2::json, $3::int);',
						[org.id, org, author.id],
					);
				}
				default: throw new Error(`Unexpected rcpt_type of '${org.info.label}'.`);
			}
		})
);


const createIMCOrgs = (author) => {
	console.log('\nCreating IMC subordinate organizations...')
	let chain = Promise.resolve();

	imc.orgs.forEach(([label, fullName,,,, email]) => {
		chain = chain.then(() => {
			const org = {
				email,
				info: { label, fullName },
				parentId: imc.id,
				authorId: author.id,
			};

			return getOrCreateOrg(org, imc, author);
		})
	})
	return chain.catch(console.error);
};


const getOrCreateIMCUsers = (author) => {
	console.log('\nCreating IMC users...')
	imc.conversion.users = {};

	return db.queryAll(
		`SELECT rcpt.* FROM json_array_elements($1::json) user_data,
			LATERAL get_or_create_rcpt(user_data, $2) rcpt;`,
		[JSON.stringify(imc.users), author.id],
	)
		.then((recipients) => {
			const newUsers = [];
			let oldId;

			imc.users.forEach((user, i) => {
				oldId = user.id;
				user.id = recipients[i].id;
				imc.conversion.users[oldId] = user.id;

				if(recipients[i].type === 'rcpt') {
					console.log(`new user: ${oldId} -> ${user.id} (${user.email})`);
					user.org_id = imc.id;
					newUsers.push(user);
				} else {
					console.log(`stored: ${oldId} -> ${user.id} (${user.email})`);
				}
			})

			return db.queryAll(
				`SELECT usr.id FROM json_array_elements($1::json) user_data,
					LATERAL create_user((user_data->>'id')::int, user_data, $2) usr;`,
				[JSON.stringify(newUsers), author.id],
			)
		})
		.then(() => {
			console.log(`${imc.users.length} users were exported`);
		});
};


const getOrCreateIMCForms = (author) => {
	console.log('\nCreating IMC forms...')
	imc.conversion.forms = {};
	let chain = Promise.resolve();

	imc.forms.forEach((record) => {
		chain = chain
			.then(() => db.query(
				'SELECT id FROM forms WHERE created = $1',
				[record.created]
			))
			.then((form) => {
				if(form) return form;

				// replace owner id with corresponding new id
				record.owner_id = imc.conversion.users[record.owner_id];
				if(record.collecting && record.collecting.start) {
					const shared = passwordGenerator(8, 8, ['numbers', 'lowercase']);
					record.collecting.shared = shared;
				}

				const { items, order } = record.scheme;
				Object.assign(record.scheme, {
					itemCount: order.length,
					questionCount: order.filter(id => items[id].itemType === 'input').length,
				});

				return db.query(
					'SELECT id FROM create_form($1::json, $2::int)',
					[record, author.id],
				);
			})
			.then((form) => {
				imc.conversion.forms[record.id] = form.id;
			})
	})

	return chain.then(() => {
		console.log(`${imc.forms.length} forms were exported`);
	});
};


const getOrCreateIMCResponses = (author) => {
	console.log('\nCreating IMC responses...')
	// imc.conversion.responses = {};
	const { responses } = imc;
	responses.forEach((rspn) => {
		rspn.form_id = imc.conversion.forms[rspn.form_id];
		rspn.respondent = {};
	})

	return db.queryAll(
		`WITH _merged AS (
			SELECT responses.id, props
			FROM json_array_elements($1::json) props
			LEFT JOIN responses
			ON (props->>'created')::timestamptz = responses.created
		)
		SELECT created.id
		FROM _merged,
		LATERAL create_response(_merged.props, $2) created
		WHERE _merged.id IS NULL;`,
		[JSON.stringify(responses), author.id],
	)
		.then((created) => {
			console.log(`new responses: ${created.length}/${responses.length}`);
		});
};

// education department
const eDep = {
	email: 'roo@tumos.gov.spb.ru',
	info: {
		label: 'Отдел образования Московского района Санкт-Петербурга',
		shortName: '?',
		fullName: '?',
	},
};


const imc = {
	email: 'info@imc-mosk.ru',
	info: {
		label: 'ИМЦ Московского района',
		shortName: 'ГБУ ДППО ЦПКС ИМЦ Московского района Санкт-Петербурга',
		fullName: 'Государственное бюджетное учреждение дополнительного профессионального педагогического образования центр повышения квалификации специалистов «Информационно-методический центр» Московского района Санкт-Петербурга',
	},
	conversion: {},
};


const run = () => {
	let author;

	loadData()
		.then(data => Object.assign(imc, data))
		// load first user and first org - root of organization tree
		.then(getBot)
		.then((bot) => { author = bot; })
		.then(() => getSystem())
		.then((system) => getOrCreateOrg(eDep, system, author))
		// .then(() => createEducationDepartmentUsers())
		.then(() => getOrCreateOrg(imc, eDep, author))
		.then(() => createIMCOrgs(author))
		.then(() => getOrCreateIMCUsers(author))
		.then(() => getOrCreateIMCForms(author))
		.then(() => getOrCreateIMCResponses(author))
		.then(() => console.log('\nSuccess!\nGood luck with this trash!'))
		.catch(console.error);
};


run();
