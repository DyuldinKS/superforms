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
		from: 'РАСККО <no-reply.rassko@yandex.ru>',
		smtp: {
			host: 'smtp.yandex.ru',
			port: 465,
			secure: true,
			auth: {
				user: 'no-reply.rassko@yandex.ru',
				pass: 'justDoIt',
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
	},
};
