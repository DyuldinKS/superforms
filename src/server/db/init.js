import bcrypt from 'bcrypt';
import config from '../config';
import User from '../models/User';
import Org from '../models/Org';
import db from '../db';


function initdb() {
	let parentId;
	let botId;


	const getSystemOrgId = () => db.query('SELECT min(id) AS id FROM organizations');
	const getSystemBotId = () => db.query('SELECT min(id) AS id FROM users');


	const createFirstOrg = () => (
		new Org({
			parentId,
			email: '1984@org',
			info: { label: '1984', slogan: 'Big Brother is watching you' },
		}).save(botId)
	);


	const createFirstUser = (org) => {
		const { email, password } = config.root;
		return bcrypt.hash(password, config.bcrypt.saltRound)
			.then(hash => (
				new User({
					email,
					hash,
					orgId: org.id,
					info: {},
					role: 'root',
				}).save(botId)
			))
			.then(() => {
				console.log('The root-user was successfully created.');
				console.log(`login: ${email}\npassword: ${password}\n`);
				console.log('Don\'t forget to change the email and password after logging in.');
			});
	};


	Promise.all([getSystemOrgId(), getSystemBotId()])
		.then((result) => { [parentId, botId] = result.map(record => record.id); })
		.then(createFirstOrg)
		.then(createFirstUser)
		.catch(console.error);
}

initdb();
