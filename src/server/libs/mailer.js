import config from '../config';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport(config.nodemailer.smtp);
const pool = nodemailer.createTransport(
	{...config.nodemailer.smtp, pool: true }
);

const send = mailOptions => {
	if( !mailOptions.from ) {
		mailOptions.from = config.nodemailer.from;
	}
	return new Promise((resolve, reject) => {
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(err, response){
			// if you don't want to use this transport object anymore, uncomment following line 
			if(err) {
				// err.__proto__ = SmtpError.prototype;
				reject(err);
			} else {
				resolve(response);
			}
		});
	})
}


const test = email => {
	send({
		to: email, // list of receivers 
		subject: 'mailer test', // Subject line 
		html: `<h3>Test</h3><b>Timestamp: ${new Date()}</b>`
	})
}


const getTime = (d=new Date()) => {
  return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
}

(function() {
	console.log('START of smtp-server verifying:', getTime());
	transporter.verify(err => {
		console.log(err || 'Server is ready to take our messages.');
		console.log('END of smtp-server verifying:', getTime());
	});
});


export {
	send
}
