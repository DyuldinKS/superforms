import db from 'Server/db';


const orgs = {
	entity: 'org',
	table: 'organizations',
	flags: ['--orgs', '-o'],
	queries: [
		/******************************** GET ONE *********************************/
		
		// GOOD
		'EXPLAIN ANALYZE SELECT * FROM get_org(117)',
		'EXPLAIN ANALYZE SELECT * FROM get_orgs(array[117])',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (org::org_short).* FROM get_org(117) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_short).* FROM get_orgs(array[117]) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_full).* FROM get_org(117) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_full).* FROM get_orgs(array[117]) org',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT org.* FROM to_org_short(get_org(117)) org',
		'EXPLAIN ANALYZE SELECT org.* FROM to_org_full(get_org(117)) org',
		// 'EXPLAIN ANALYZE SELECT org_full.* FROM get_org(117) org, to_org_full(org) org_full',
		// 'EXPLAIN ANALYZE SELECT org_full.* FROM get_orgs(array[117]) org, to_org_full(org) org_full',


		/******************************** GET ALL *********************************/
		// BAD: use get_org() with LATERAL
		// 'EXPLAIN ANALYZE SELECT * FROM organizations, get_org(id)',
		// GOOD: use get_orgs() with pgarray
		'EXPLAIN ANALYZE SELECT * FROM get_orgs((SELECT array_agg(id) FROM organizations))',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (org::org_short).* FROM organizations, get_org(id) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_short).* FROM get_orgs((SELECT array_agg(id) FROM organizations)) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_full).* FROM organizations, get_org(id) org',
		// 'EXPLAIN ANALYZE SELECT (org::org_full).* FROM get_orgs((SELECT array_agg(id) FROM organizations)) org',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT org_short.* FROM get_orgs((SELECT array_agg(id) FROM organizations)) org, to_org_short(org) org_short',
		// 'EXPLAIN ANALYZE SELECT org.* FROM organizations, to_org_full(get_org(id)) org',
		// 'EXPLAIN ANALYZE SELECT org_full.* FROM organizations, get_org(id) org, to_org_full(org) org_full',
		'EXPLAIN ANALYZE SELECT org_full.* FROM get_orgs((SELECT array_agg(id) FROM organizations)) org, to_org_full(org) org_full',


		// /******************************* FIND ORGS ********************************/

		'EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2)',
		// with specified depth of subtree
		// `EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"minDepth":1}')`,
		// `EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(3, '{"maxDepth":1}')`,
		// `EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(4, '{"minDepth":1,"maxDepth":2')`,
		// by info
		`EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"info":"школа:*"}')`,
		`EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"info":"сад&детский:*"}')`,
		// by email
		`EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"email":"%school507%"}')`,
		// by email domain
		`EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"email":"%yandex.ru%"}')`,
		// by status
		`EXPLAIN ANALYZE SELECT * FROM find_orgs_in_subtree(2, '{"active":true}')`,
	],
};


const users = {
	entity: 'user',
	table: 'users',
	flags: ['--users', '-u'],
	queries: [
		/******************************** GET ONE *********************************/

		// GOOD
		'EXPLAIN ANALYZE SELECT * FROM get_user(117)',
		'EXPLAIN ANALYZE SELECT * FROM get_users(array[117])',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (usr::user_short).* FROM get_user(117) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_short).* FROM get_users(array[117]) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_full).* FROM get_user(117) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_full).* FROM get_users(array[117]) usr',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT usr.* FROM to_user_short(get_user(117)) usr',
		'EXPLAIN ANALYZE SELECT usr.* FROM to_user_full(get_user(117)) usr',
		// 'EXPLAIN ANALYZE SELECT user_full.* FROM get_user(117) usr, to_user_full(usr) user_full',
		// 'EXPLAIN ANALYZE SELECT user_full.* FROM get_users(array[117]) usr, to_user_full(usr) user_full',


		/******************************** GET ALL *********************************/

		// BAD: use get_user() with LATERAL
		// 'EXPLAIN ANALYZE SELECT * FROM users, get_user(id)',
		// GOOD: use get_users() with pgarray
		'EXPLAIN ANALYZE SELECT * FROM get_users((SELECT array_agg(id) FROM users))',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (usr::user_short).* FROM users, get_user(id) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_short).* FROM get_users((SELECT array_agg(id) FROM users)) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_full).* FROM users, get_user(id) usr',
		// 'EXPLAIN ANALYZE SELECT (usr::user_full).* FROM get_users((SELECT array_agg(id) FROM users)) usr',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT user_short.* FROM get_users((SELECT array_agg(id) FROM users)) usr, to_user_short(usr) user_short',
		// 'EXPLAIN ANALYZE SELECT usr.* FROM users, to_user_full(get_user(id)) usr',
		// 'EXPLAIN ANALYZE SELECT user_full.* FROM users, get_user(id) usr, to_user_full(usr) user_full',
		'EXPLAIN ANALYZE SELECT user_full.* FROM get_users((SELECT array_agg(id) FROM users)) usr, to_user_full(usr) user_full',


		/****************************** FIND USERS ********************************/

		'EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2)',
		// by info
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"info":"Ири:*"}')`,
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"info":"Ханило&Вячеслав:*"}')`,
		// by email
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"email":"%dyuldin_kirill%"}')`,
		// by email domain
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"email":"%mail.ru%"}')`,
		// by status
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"active":true}')`,
		// by role 
		`EXPLAIN ANALYZE SELECT * FROM find_users_in_subtree(2, '{"role":"admin"}')`,
	],
};


const forms = {
	entity: 'form',
	table: 'forms',
	flags: ['--forms', '-f'],
	queries: [
		/******************************** GET ONE *********************************/

		// GOOD
		'EXPLAIN ANALYZE SELECT * FROM get_form(56)',
		'EXPLAIN ANALYZE SELECT * FROM get_forms(array[56])',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (form::form_short).* FROM get_form(117) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_short).* FROM get_forms(array[117]) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_full).* FROM get_form(117) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_full).* FROM get_forms(array[117]) form',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT form.* FROM to_form_short(get_form(389)) form',
		'EXPLAIN ANALYZE SELECT form.* FROM to_form_full(get_form(389)) form',
		// 'EXPLAIN ANALYZE SELECT form_full.* FROM get_form(117) form, to_form_full(form) form_full',
		// 'EXPLAIN ANALYZE SELECT form_full.* FROM get_forms(array[117]) form, to_form_full(form) form_full',


		/******************************** GET ALL *********************************/

		// BAD: use get_form() with LATERAL
		// 'EXPLAIN ANALYZE SELECT * FROM forms, get_form(id)',
		// GOOD: use get_forms() with pgarray
		'EXPLAIN ANALYZE SELECT * FROM get_forms((SELECT array_agg(id) FROM forms))',

		// BAD: cast type in SELECT clause
		// 'EXPLAIN ANALYZE SELECT (form::form_short).* FROM forms, get_form(id) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_short).* FROM get_forms((SELECT array_agg(id) FROM forms)) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_full).* FROM forms, get_form(id) form',
		// 'EXPLAIN ANALYZE SELECT (form::form_full).* FROM get_forms((SELECT array_agg(id) FROM forms)) form',

		// GOOD: cast type with LATERAL
		'EXPLAIN ANALYZE SELECT form_short.* FROM get_forms((SELECT array_agg(id) FROM forms)) form, to_form_short(form) form_short',
		// 'EXPLAIN ANALYZE SELECT form.* FROM forms, to_form_full(get_form(id)) form',
		// 'EXPLAIN ANALYZE SELECT form_full.* FROM forms, get_form(id) form, to_form_full(form) form_full',
		'EXPLAIN ANALYZE SELECT form_full.* FROM get_forms((SELECT array_agg(id) FROM forms)) form, to_form_full(form) form_full',


		// /************************* FIND FORMS BY ORG ****************************/

		'EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4)',
		// by user info
		`EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4, '{"info":"Ири:*"}')`,
		`EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4, '{"info":"Ханило&Вячеслав:*"}')`,
		`EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4, '{"info":"Смоленский:*"}')`,
		// by form info
		`EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4, '{"email":"заболеваемость:*"}')`,
		// deleted
		`EXPLAIN ANALYZE SELECT * FROM find_forms_in_org(4, '{"deleted":false}')`,


		// /************************* FIND FORMS BY USER ***************************/

		'EXPLAIN ANALYZE SELECT * FROM find_user_forms(118)',
		// by info
		`EXPLAIN ANALYZE SELECT * FROM find_user_forms(127, '{"info":"отчет|отчёт:*"}')`,
		// deleted
		`EXPLAIN ANALYZE SELECT * FROM find_user_forms(2, '{"deleted":false}')`,
	],
};


const log = {
	red: (str) => { console.log(`\x1b[31m${str}\x1b[0m`); },
	green: (str) => { console.log(`\x1b[32m${str}\x1b[0m`); },
	yellow: (str) => { console.log(`\x1b[33m${str}\x1b[0m`); },
	blue: (str) => { console.log(`\x1b[34m${str}\x1b[0m`); },
	magenta: (str) => { console.log(`\x1b[35m${str}\x1b[0m`); },
	cyan: (str) => { console.log(`\x1b[36m${str}\x1b[0m`); },
	white: (str) => { console.log(`\x1b[37m${str}\x1b[0m`); },
};



const init = () => {
	const argv = [...process.argv];

	if(argv.length === 2 || argv.includes('--all') || argv.includes('-a')) {
		return [orgs, users, forms];
	} else {
		const queriesByEntities = [];

		return [orgs, users, forms].filter(({ flags }) => (
			flags.some(flag => argv.includes(flag))
		))

		return queriesByEntities;
	}
};


const runEntityQueries = (queries, fullOutput) => {
	let chain = Promise.resolve();

	queries.forEach((query, i) => {
		let start;
		let end;

		chain = chain.then(() => {
			start = Date.now();
			return db.queryAll(query);
		})
			.then(res => {
				end = Date.now();
				const output = fullOutput ? res : res.slice(-2);
				return output.map(record => record['QUERY PLAN']).join('\n');
			})
			.then(res => {
				log.cyan(`${query}:`);
				log.white(`${res}`)
				log.yellow(`Actual time: ${end - start} ms\n`);
			})
	});

	return chain;
}


const run = (queriesByEntities, fullOutput) => {
	let chain = Promise.resolve();

	queriesByEntities.forEach(({ entity, table, queries }) => {
		// acceleration for the actual result
		chain = chain.then(() => Promise.all(queries.map(q => db.query(q))))
			.then(() => db.query(`SELECT array_agg(id) AS ids FROM ${table}`))
			.then(({ ids }) => {
				log.blue(`\n# ${table.toUpperCase()}: ${ids.length}\n`);
			});

		chain = chain.then(() => runEntityQueries(queries, fullOutput));
	})

	chain.catch(console.error);
}


const queriesByEntities = init();
const fullOutput = process.argv.includes('--full');
run(queriesByEntities, fullOutput);
