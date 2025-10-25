const jwt = require("jsonwebtoken")

function verifyJWT(req, res, next) {
	const token = req.cookies.authToken

	if (!token) {	
		return res.status(401).send({ error: "No token provided" })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (err) {
		return res.status(403).send({ error: "Invalid or expired token" })
	}
}

module.exports = verifyJWT
