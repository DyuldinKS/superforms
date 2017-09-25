const config = {
	port : 3000,
	domain : 'http://gf.imc-mosk.ru:40080/',
	pg: {
		host: 'localhost',
		user: 'postgres',
		password: 'postgres',
		database: 'sf2'
	},
	session: {
		secret: 'absolute mystery',
		cookie: { 
			maxAge: null
		},
		resave: false,
		saveUninitialized: false
	},
	nodemailer: {
		from: 'Form Generator <g-f@mosk.spb.ru>',
		smtp: {
			host: 'mail.mosk.spb.ru',
			port: 465,
			secure: true,
			auth: {
				user: 'g-f@mosk.spb.ru',
				pass: 'U3z9O0z4'
			},
			tls:{ rejectUnauthorized: false	}
		},
	},
	// first user with absolute rights
	root: {
		email: 'root@',
		password: 'superroot',
		roleInfo: { value: 'root', label: 'Администратор ИС' },
	}

	// hash : {
	// 	user : { salt : Salt is used to, length : 8 },
	// 	regConfirm : { length : 128 },
	// 	form : { salt : generate unique alphabets., length : 9	},
	// 	response : { salt : The alphabet is also, length : 10 },
	// 	report : { salt : shuffled based on salt., length : 11 }
	// },

	// pageReloadTimeout : {
	// 	responses: 30000
	// },
	
	// multer : {
	// 	destination : './public/uploads',
	// 	limits : { fileSize: 4096 },
	// 	fields : files,
	// 	maxCount : 5
	// }
}


export default config;