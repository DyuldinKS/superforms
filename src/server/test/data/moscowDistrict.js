import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Org from '../../models/Org';
import User from '../../models/User';
import db from '../../db/index';

const fsReadFile = promisify(fs.readFile);

let root;


const getRoot = () => (
	db.query('SELECT * FROM users WHERE id = (SELECT min(id) FROM users);')
		.then(data => new User(data))
);


const createOrg = orgData => (
	new Org(orgData).save(root.id)
		.then(org => org.setParentOrg(orgData.parentId))
);


const createUsers = (org, users) => (
	Promise.all(users.map(data => new User({
		...data,
		orgId: org.id,
	})
		.save(root.id)))
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
		parentId: root.orgId,
	})
		.then((org) => { edDep = org; })
		.then(() => fsReadFile(path.join(__dirname, 'educationDepartmentUsers.json')))
		.then(JSON.parse)
		.then(users => createUsers(edDep, users))
		.then(() => edDep)
		.catch((err) => {
			if(edDep) return edDep;
			throw err;
		});
};


const createIMC = parentOrg => (
	createOrg({
		email: 'info@imc-mosk.ru',
		info: {
			label: 'ИМЦ Московского района',
			shortName: 'ГБУ ДППО ЦПКС ИМЦ Московского района Санкт-Петербурга',
			fullName: 'Государственное бюджетное учреждение дополнительного профессионального педагогического образования центр повышения квалификации специалистов «Информационно-методический центр» Московского района Санкт-Петербурга',
		},
		parentId: parentOrg.id,
	})
);


const createSchoolsAndKindergartens = imc => (
	fsReadFile(path.join(__dirname, 'mscDistrictOrgs.json'))
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
					parentId: imc.id,
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
	.catch(console.error);
