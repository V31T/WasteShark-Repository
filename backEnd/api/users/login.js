const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const User = require(process.cwd() + "/schemas/User.js")
require("dotenv").config()


const authCookie = require(process.cwd() + "/middleware/authCookie.js")

const method = "post"

async function setupEndPoint(app, route) {
	// authCookie(app, route, method)

	app[method](route, async function(req, res) {
		let user

		try {
			user = await User.findOne({ email: req.body.email })
		} catch (error) {
			console.error("Error logging into account:", error)

			return res.status(500).send({
				error: "Internal Server Error"
			})
		}

		// Check if user exists
		if (!user) {
			return res.status(401).send({
				error: "Invalid credentials"
			})
		}

		if (bcrypt.compareSync(req.body.password, user.password) === false) {
			return res.status(401).send({
				error: "Invalid credentials"
			})
		}

		const token = jwt.sign(
			{
				id: user._id,
				email: user.email,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRES_IN || "7d",
			}
		);


		res.cookie("authToken", token, {
			httpOnly: true,                // prevents JS access (XSS protection)
			secure: process.env.NODE_ENV === "production", // only HTTPS in production
			sameSite: "strict",            // CSRF protection
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		})


		res.send({
			success: true,
			token,
		})
	})
}

module.exports = setupEndPoint