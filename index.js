/* global localStorage, */
const express = require('express');
const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('./auth');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// const { transporter } = require('./mail');

const mongoClient = mongodb.MongoClient;
// const dbUrl = 'mongodb://127.0.0.1:27017';
const dbUrl =
	'mongodb+srv://admin-vishnu:vishnu123@vishnu.1nuon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const port = 3000;
const database = 'Forgot-Password';
const userCollection = 'users';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send('Password Reset Task');
});

app.get('/home', authenticate, (req, res) => {
	res.send('Home Page');
});

app.get('/api/users', async (req, res) => {
	try {
		let client = await mongoClient.connect(dbUrl);
		let db = client.db(database);
		let users = await db.collection(userCollection).find().toArray();
		client.close();
		res.json(users);
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something went wrong' });
	}
});

app.post('/api/users', async (req, res) => {
	try {
		if (req.body.email && req.body.password) {
			let client = await mongoClient.connect(dbUrl);
			let db = client.db(database);
			let salt = await bcrypt.genSalt(10);
			let hash = await bcrypt.hash(req.body.password, salt);
			req.body.password = hash;
			await db.collection(userCollection).insertOne(req.body);
			client.close();
			// res.redirect('http://127.0.0.1:5500/frontend/login.html');
		} else {
			res.json({ message: 'Detaisl Shouldnot be empty' });
		}
		res.json({ message: 'User Added' });
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something went wrong' });
	}
});

app.post('/api/users/:id', async (req, res) => {
	try {
		let client = await mongoClient.connect(dbUrl);
		let db = client.db(database);
		let id = mongodb.ObjectID(req.params.id);
		let user = await db.collection(userCollection).findOne({ _id: id });
		console.log(user.email);
		console.log(process.env.EMAIL, process.env.PASSWORD);
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD,
			},
		});
		let mailOptions = {
			from: 'chilamakurvishnu@gmail.com',
			to: user.email,
			subject: 'Reset Password',
			text: 'click here to reset password',
			html:
				'<h3>Reset your password Here</h3><a href="http://127.0.0.1:5500/frontend/reset.html">Click Here</a>',
		};
		transporter.sendMail(mailOptions, (err, data) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Email Sent');
			}
		});
		client.close();
		res.json(user);
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something went wrong' });
	}
});

app.post('/api/login', async (req, res) => {
	try {
		let client = await mongoClient.connect(dbUrl);
		let db = client.db(database);
		let user = await db.collection(userCollection).findOne({ email: req.body.email });
		// console.log(user);
		client.close();
		if (user) {
			let result = await bcrypt.compare(req.body.password, user.password);
			// console.log(result);
			if (result) {
				console.log(user);
				jwt.sign({ user }, 'secret', { expiresIn: 30 }, (err, token) => {
					if (err) {
						res.json({ message: 'something went wrong in authentication' });
					} else {
						console.log('token assigned');
						res.json({ token });
					}

					console.log(token);
					console.log(typeof token);
					if (token !== 'undefined') {
						localStorage.setItem('token', 'token');
						res.redirect('/');
						console.log('token in local storage');
					}
				});
			} else {
				res.json({ message: 'Access not Alloud' });
			}
		} else {
			res.json({ message: 'User not found' });
		}
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something went wrong' });
	}
});

app.put('/api/users/:id', async (req, res) => {
	try {
		console.log(req.body);
		let client = await mongoClient.connect(dbUrl);
		let db = client.db(database);
		let id = mongodb.ObjectID(req.params.id);
		let user = await db.collection(userCollection).findOne({ _id: id });
		let salt = await bcrypt.genSalt(10);
		let hash = await bcrypt.hash(req.body.password, salt);
		req.body.password = hash;
		if (user) {
			let updatePassword = await db
				.collection(userCollection)
				.updateOne(
					{ _id: mongodb.ObjectID(req.params.id) },
					{ $set: { password: req.body.password } }
				);
		}
		console.log('user Updated');
		client.close();
		res.json({ message: 'Password Updated' });
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something went wrong' });
	}
});

app.listen(port, () => console.log(`Server started on port : ${port}`));
