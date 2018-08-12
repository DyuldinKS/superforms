export default {
	session: {
		secret: 'absolute mystery',
		cookie: {
			maxAge: null,
		},
		resave: false,
		saveUninitialized: false,
	},
	bcrypt: {
		saltRound: 10,
	},
};
