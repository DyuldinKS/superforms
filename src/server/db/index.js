import pool from './pool';
import queries from './queries';
import recipients from './recipients';
import organizations from './organizations';
import users from './users';
import roles from './roles';
import constants from './constants';
// import rights from './rights';
// import forms from './forms.js';
// import responses from './responses.js';

export default {
	...queries,
	...constants,
	pool,
	recipients,
	organizations,
	users,
	roles,
};
