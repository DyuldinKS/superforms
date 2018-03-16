import User from '../../../src/server/models/User';
import db from '../../../src/server/db';


const getRootUser = () => (
	db.query(`SELECT * FROM get_user((
		SELECT min(id) FROM (SELECT id FROM users ORDER BY id OFFSET 1) AS ordered
	));`)
		.then(data => new User(data))
);


export default getRootUser;
