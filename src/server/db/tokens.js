import db from './queries';


const tokens = {
	table: 'user_tokens',

	upsert({ id, token }) {
		return db.query(
			`INSERT INTO user_tokens(user_id, token)
			VALUES($1, $2)
			ON CONFLICT(user_id) DO UPDATE
			SET token = $2 WHERE user_tokens.user_id = $1
			RETURNING *;`,
			[id, token],
		);
	},

	select({ id, token }) {
		const searchBy = id ? 'user_id' : 'token';

		return db.query(
			`SELECT rcpt.id, rcpt.email, tokens.token
			FROM user_tokens tokens
			JOIN recipients rcpt ON rcpt.id = tokens.user_id
			WHERE tokens.${searchBy} = $1;`,
			[id || token],
		);
	},

	delete({ id, token }) {
		const searchBy = id ? 'user_id' : 'token';

		return db.query(
			`DELETE FROM user_tokens WHERE ${searchBy} = $1;`,
			[id || token],
		);
	},
};

export default tokens;
