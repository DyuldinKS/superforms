import initdb from './init';
import pool from './pool';
import queries from './queries';
import recipients from './recipients';
import organizations from './organizations';
import users from './users';
import roles from './roles';
// import rights from './rights';
// import forms from './forms.js';
// import responses from './responses.js';

initdb();

export default {
	pool,
	...queries,
	recipients,
	organizations,
	users,
	roles,
};
