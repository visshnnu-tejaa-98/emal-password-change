const jwt = require('jsonwebtoken');

let authenticate = async (req, res, next) => {
	try {
		const bearer = await req.headers['authorization'];
		if (bearer !== 'undefined') {
			jwt.verify(bearer, 'secret', (err, res) => {
				if (res) {
					next();
				} else {
					res.json({ message: 'Forbidden' });
				}
			});
		} else {
			res.json({ message: 'Forbidden' });
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = { authenticate };
