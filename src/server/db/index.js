import pool from './pool';
import queries from './queries';
import recipients from './recipients';
import orgs from './organizations';
import users from './users';
import tokens from './tokens';
import staticTables from './staticTables.json';
// import rights from './rights';
// import forms from './forms.js';
// import responses from './responses.js';


export default {
	...queries,
	...staticTables,
	pool,
	recipients,
	orgs,
	users,
	tokens,
};
