export default {
	port: 3000,
	domain: 'your.domain',
	pg: {
		host: 'localhost',
		user: 'postgres',
		password: 'postgres',
		database: 'sf2',
	},
	session: {
		secret: 'absolute mystery',
		cookie: {
			maxAge: null,
		},
		resave: false,
		saveUninitialized: false,
	},
	nodemailer: {
		from: 'Your Name <your@email.com>',
		smtp: {
			host: 'smtp.your@email.com',
			port: 465,
			secure: true,
			auth: {
				user: 'your@email.com',
				pass: 'yourPass',
			},
			tls: { rejectUnauthorized: false },
		},
	},
	bcrypt: {
		saltRound: 10,
	},
	// first user with absolute rights
	root: {
		email: 'root@',
		password: 'passForRoot',
		role: {
			label: 'System admin',
			info: { description: 'user with absolute CRUD rights' },
		},
	},
};
