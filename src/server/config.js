export default {
	port: 3000,
	get domain() { return `localhost:${this.port}`; },
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
		from: 'Your Name <your-email@domain.com>',
		smtp: {
			host: 'smtp.domain.com',
			port: 465,
			secure: true,
			auth: {
				user: 'your-email@domain.com',
				pass: 'yourPass',
			},
			tls: { rejectUnauthorized: false },
		},
	},
	bcrypt: {
		saltRound: 10,
	},
	root: {
		email: 'root@',
		password: 'justDoIt',
		org: {
			email: 'root@org',
			info: {
				label: '1984',
				slogan: 'Big Brother is watching you',
			},
		},
	},
};
