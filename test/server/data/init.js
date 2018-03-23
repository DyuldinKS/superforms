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
		'imc-forms.tmp'
	];
	// read files
	return Promise.all(
		files.map(file => (
			fsReadFile(path.join(__dirname, file))
		)),
	)
		// parse files
		.then(([imcOrgs, imcUsers, imcForms]) => {
			const { schools, kindergartens } = JSON.parse(imcOrgs);
			const orgs = [...schools.values, ...kindergartens.values];

			const [users, forms] = [imcUsers, imcForms].map(buffer => (
				buffer.toString()
					.replace(/\\\\/g, '\\')
					.split('\n')
					.slice(0, -1)
					.map(JSON.parse)
			));

			return { orgs, users, forms };
		})
};


const getBot = () => db.query('SELECT min(id) AS id FROM users;');
const getSystem = () => db.query('SELECT min(id) AS id FROM organizations;');


const createUsers = (org, users) => (
	Promise.all(users.map(data => new User({
		...data,
		orgId: org.id,
	})
		.save(root.id)
	))
);


const createForms = (users, forms, ids) => (
	Promise.all(forms.map((form) => new Form({
		...form,
		owner_id: ids[form.author_id],
		author_id: root,
	})))
)


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
			.then(() => User.findByEmail(record.email)
			.then(user => {
				if(user) {
					if(user.orgId !== imc.id) {
						throw new Error(`User (${user.email}) is not in IMC.`)
					}
					return user;
				}

				record.orgId = imc.id;
				return new User(record).save(author.id);
			})
			.then(user => {
				imc.conversion.users[record.id] = user.id;
				console.log(`${record.id} -> ${user.id} (${user.email}): ok`)
			})
		)
	})
	return chain;
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
		// .then(() => createIMCForms({ author }))
		// .then(() => createIMCResponses({ author }))
		.then(() => console.log('\nSuccess! All organizations have been saved.'))
		.catch(console.error);
};


run();
