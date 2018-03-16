import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Org from '../../../src/server/models/Org';
import User from '../../../src/server/models/User';
import getRootUser from './getRootUser';


const fsReadFile = promisify(fs.readFile);

let root;
let edDepUsers;
let mscDistrictOrgs;


const readFiles = () => (
	Promise.all([
		'educationDepartmentUsers.json',
		'mscDistrictOrgs.json',
	]
		.map(file => (
			fsReadFile(path.join(__dirname, file))
				.then(JSON.parse)
		))
	)
		.then(([users, orgs]) => {
			edDepUsers = users;
			mscDistrictOrgs = orgs;
		})
);


const loadRootUser = () => (
	getRootUser().then(user => {
		root = user;
	})
);


const createUsers = (org, users) => (
	Promise.all(users.map(data => new User({
		...data,
		orgId: org.id,
	})
		.save(root.id)
		.catch(console.error))
	)
);


const createEducationDepartment = () => {
	let edDep;
	return new Org({
		email: 'roo@tumos.gov.spb.ru',
		info: {
			label: 'Отдел образования Московского района Санкт-Петербурга',
			shortName: '?',
			fullName: '?',
		},
		parentId: root.orgId,
	})
		.save(root.id)
		.then((org) => { edDep = org; })
		.then(() => {
			const users = edDepUsers.map(({ email, ...info }) => (
				{	email, info, role: 'user' }
			));
			return createUsers(edDep, users);
		})
		.then(() => edDep)
};


const createIMC = parentOrg => (
	new Org({
		email: 'info@imc-mosk.ru',
		info: {
			label: 'ИМЦ Московского района',
			shortName: 'ГБУ ДППО ЦПКС ИМЦ Московского района Санкт-Петербурга',
			fullName: 'Государственное бюджетное учреждение дополнительного профессионального педагогического образования центр повышения квалификации специалистов «Информационно-методический центр» Московского района Санкт-Петербурга',
		},
		parentId: parentOrg.id,
	})
		.save(root.id)
);


const createSchoolsAndKindergartens = (imc) => {
	const { schools, kindergartens } = mscDistrictOrgs;
	const chain = Promise.resolve();
	const orgs = [...schools.values, ...kindergartens.values];

	orgs.forEach(([shortName, fullName,,,, email]) => {
		chain.then(() => (
			new Org({
				email,
				info: {
					shortName,
					fullName,
					label: shortName,
				},
				authorId: root.id,
				parentId: imc.id,
			})
				.save(root.id)
		))
	})
	return chain;
};


readFiles()
	.then(loadRootUser)
	.then(createEducationDepartment)
	.then(createIMC)
	.then(createSchoolsAndKindergartens)
	.then(() => console.log('Success! All organizations have been saved.'))
	.catch(console.error);
