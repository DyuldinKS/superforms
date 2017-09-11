const config = {
	port : 3000,
	domain : 'http://5.17.125.174:40080/',
	pg : {
		host: 'localhost',
		user: 'postgres',
		password: 'postgres',
		database: 'new-sf'
	},
	session : {
		secret : 'forCookieSign',
		cookie: {
			path : '/',
			httpOnly : true,
			maxAge : null
		},
		resave : false,
		saveUninitialized : false
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