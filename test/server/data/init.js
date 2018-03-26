import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import db from '../../../src/server/db';
import Recipient from '../../../src/server/models/Recipient';
import Org from '../../../src/server/models/Org';
import User from '../../../src/server/models/User';


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


const getOrCreateEducationDepartment = ({ author }) => (
	Promise.all([
		getSystem(),
		Recipient.find({ email: educationDepartment.email }),
	])
		.then(([system, rcpt]) => {
			educationDepartment.parentId = system.id;

			if(rcpt) {
				if(rcpt.type !== 'org') {
					throw new Error('Education department is not an org.');
				}
				console.log('Education department is loaded from db.');
				educationDepartment.id = rcpt.id;
				return educationDepartment;
			}
			console.log('Creating Education department...');
			return educationDepartment.save(author.id);
		})
);


const getOrCreateIMC = ({ author }) => {
	imc.conversion = {}; // for user, form, response ids migration
	imc.parentId = educationDepartment.id;

	return Recipient.find({ email: imc.email })
		.then((rcpt) => {
			if(rcpt) {
				if(rcpt.type !== 'org') throw new Error('IMC is not an org.');
				console.log('IMC is loaded from db.');
				imc.id = rcpt.id;
				return imc;
			}

			console.log('Creating IMC...');
			return imc.save(author.id);
		})
};


const createIMCOrgs = ({ author }) => {
	console.log('\nCreating IMC subordinate organizations...')
	let chain = Promise.resolve();

	imc.orgs.forEach(([label, fullName,,,, email]) => {
		chain = chain.then(() => {
			return new Org({
				email,
				info: { label, fullName },
				parentId: imc.id,
				authorId: author.id,
			})
				.save(author.id)
				.then(() => { console.log(`${label}: ok`); })
		})
	})
	return chain.catch(console.error);
};


const getOrCreateIMCUsers = ({ author }) => {
	console.log('\nCreating IMC users...')
	imc.conversion.users = {};
	let chain = Promise.resolve();

	imc.users.forEach((record) => {
		chain = chain
			.then(() => User.findByEmail(record.email))
			.then((user) => {
				if(user) {
					if(user.orgId !== imc.id) {
						throw new Error(`User (${user.email}) is not in IMC.`)
					}
					return user;
				}

				record.orgId = imc.id;
				return new User(record).save(author.id);
			})
			.then((user) => {
				imc.conversion.users[record.id] = user.id;
				console.log(`${record.id} -> ${user.id} (${user.email}): ok`)
			})
	})
	return chain.then(() => {
		console.log(`${imc.users.length} users were exported`);
	});
};


const getOrCreateIMCForms = ({ author }) => {
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
		console.log(JSON.stringify(imc.conversion.forms));
		console.log(`${imc.forms.length} forms were exported`);
	});
};


const getOrCreateIMCResponses = ({ author }) => {
	console.log('\nCreating IMC responses...')
	imc.conversion.responses = {};

	return Promise.all(imc.responses.map((record) => (
		db.query(
			'SELECT id FROM responses WHERE created = $1',
			[record.created]
		)
			.then((response) => {
				if(response) return response;

				// replace form id with corresponding new id
				record.form_id = imc.conversion.forms[record.form_id];
				return db.query(
					'SELECT id FROM create_response($1::json, $2::int)',
					[record, author.id],
				);
			})
			.then((response) => {
				imc.conversion.responses[record.id] = response.id;
			})
	)))
		.then(() => {
			console.log(`${imc.responses.length} responses were exported`);
		});
};


const educationDepartment = new Org({
	email: 'roo@tumos.gov.spb.ru',
	info: {
		label: 'Отдел образования Московского района Санкт-Петербурга',
		shortName: '?',
		fullName: '?',
	},
});


const imc = new Org({
	email: 'info@imc-mosk.ru',
	info: {
		label: 'ИМЦ Московского района',
		shortName: 'ГБУ ДППО ЦПКС ИМЦ Московского района Санкт-Петербурга',
		fullName: 'Государственное бюджетное учреждение дополнительного профессионального педагогического образования центр повышения квалификации специалистов «Информационно-методический центр» Московского района Санкт-Петербурга',
	},
});


const run = () => {
	let author;

	loadData()
		.then(data => Object.assign(imc, data))
		// load first user and first org - root of organization tree
		.then(getBot)
		.then((bot) => { author = new User(bot); })
		.then(() => getOrCreateEducationDepartment({ author }))
		// .then(() => createEducationDepartmentUsers())
		.then(() => getOrCreateIMC({ author }))
		.then(() => createIMCOrgs({ author }))
		.then(() => getOrCreateIMCUsers({ author }))
		.then(() => getOrCreateIMCForms({ author }))
		.then(() => getOrCreateIMCResponses({ author }))
		.then(() => console.log('\nSuccess!\nGood luck with this trash!'))
		.catch(console.error);
};


run();
