const jwt = require('jsonwebtoken')

function verifyJWT(req, res, next) {
	// Authorization: Bearer <token>
	const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization)
	let token

	if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
		token = authHeader.slice(7).trim()
	}

	// If no bearer token found, no token provided
	if (!token) {
		return res.status(401).send({ error: 'No token provided' })
	}

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		req.user = decoded
		return next()
	} catch (err) {
		// Distinguish expired vs invalid
		if (err && err.name === 'TokenExpiredError') {
			return res.status(401).send({ error: 'TokenExpired', message: 'Access token expired' })
		}
		return res.status(401).send({ error: 'InvalidToken', message: 'Invalid access token' })
	}
}

module.exports = verifyJWT
