import fs from 'fs';
import { promisify } from 'util';
import Org from '../../models/Org';
import User from '../../models/User';
import db from '../../db/index';

const fsReadFile = promisify(fs.readFile);

let root;


const getRoot = () => (
	db.query('SELECT * FROM users WHERE id = (SELECT MIN(id) FROM users);')
		.then(data => new User(data))
);


const createOrg = orgData => (
	new Org(orgData).save()
		.then(org => org.setChiefOrg(orgData.chiefOrgId))
);


const createUsers = (org, users) => (
	Promise.all(users.map(data => new User({
		...data,
		orgId: org.id,
		authorId: root.id,
	}).save()))
);


const createEducationDepartment = () => {
	let edDep;
	return createOrg({
		email: 'roo@tumos.gov.spb.ru',
		info: {
			label: 'Отдел образования Московского района Санкт-Петербурга',
			shortName: '?',
			fullName: '?',
		},
		chiefOrgId: root.orgId,
		authorId: root.id,
	})
		.then((org) => { edDep = org; })
		.then(() => fsReadFile('educationDepartmentUsers.json'))
		.then(JSON.parse)
		.then(users => createUsers(edDep, users))
		.then(() => edDep)
		.catch((err) => {
			if(edDep) return edDep;
			throw err;
		});
};


const createIMC = chiefOrg => (
	createOrg({
		email: 'info@imc-mosk.ru',
		info: {
			label: 'ИМЦ Московского района',
			shortName: 'ГБУ ДППО ЦПКС ИМЦ Московского района Санкт-Петербурга',
			fullName: 'Государственное бюджетное учреждение дополнительного профессионального педагогического образования центр повышения квалификации специалистов «Информационно-методический центр» Московского района Санкт-Петербурга',
		},
		authorId: root.id,
		chiefOrgId: chiefOrg.id,
	})
);


const createSchoolsAndKindergartens = imc => (
	fsReadFile('mscDistrictOrgs.json')
		.then(JSON.parse)
		.then(({ schools, kindergartens }) => {
			const chain = Promise.resolve();
			[
				...schools.values,
				...kindergartens.values,
			].forEach(([shortName, fullName,,,, email]) => {
				chain.then(() => createOrg({
					email,
					info: {
						shortName,
						fullName,
						label: shortName,
					},
					authorId: root.id,
					chiefOrgId: imc.id,
				}));
			});
			return chain;
		})
);


getRoot()
	.then((user) => { root = user; })
	.then(createEducationDepartment)
	.then(createIMC)
	.then(createSchoolsAndKindergartens)
	.then(() => console.log('Success! All organizations have been saved.'))
	.catch(console.log);