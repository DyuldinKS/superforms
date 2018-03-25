import User from '../../../src/server/models/User';
import db from '../../../src/server/db';


const getRootUser = () => (
	db.query(`SELECT * FROM get_user((SELECT min(id) FROM users));`)
		.then(data => new User(data))
);


export default getRootUser;
