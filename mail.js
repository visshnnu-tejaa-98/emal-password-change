const nodemailer = require('nodemailer');

// step 1

const transporter = nodemailer.createTransport({
	// host: 'smtp.gmail.com',
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

// // step 2

// let mailOptions = {
// 	from: 'chilamakurvishnu@gmail.com',
// 	to: 'visshnnutejaa@gmail.com',
// 	subject: 'Reset Password',
// 	text: 'click here to reset password',
// 	html: '<a href="./reset.html">Click Here</a>',
// };

// // step 3

// transporter.sendMail(mailOptions, (err, data) => {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('Email Sent');
// 	}
// });

// module.exports = { transporter };
