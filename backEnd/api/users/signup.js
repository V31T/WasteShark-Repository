const bcrypt = require("bcrypt")
const User = require(process.cwd() + "/schemas/User.js")
const jwt = require("jsonwebtoken")

const authCookie = require(process.cwd() + "/middleware/authCookie.js")
const method = "post"

async function setupEndPoint(app, route) {
	// authCookie(app, route, method)
	console.log("setup route	")
	app[method](route, async function(req, res) {
		try {
			const userExists = await User.exists({ email: req.body.email })

			if (userExists) {
				return res.status(409).send({
					error: "Account already exists"
				})
			}

			const hash = await bcrypt.hash(req.body.password, 10)

			const newUser = await User.create({
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				password: hash
			})

			const token = jwt.sign(
				{
					id: newUser._id,
					email: newUser.email
				},
				process.env.JWT_SECRET,
				{
					expiresIn: process.env.JWT_EXPIRES_IN || "7d"
				}
			)

			res.cookie("authToken", token, {
				httpOnly: true, // prevents JS access (XSS protection)
				secure: process.env.NODE_ENV === "production", // only send over HTTPS
				sameSite: "strict", // CSRF protection
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})

			res.send({
				success: true,
				user: {
					id: newUser._id,
					email: newUser.email,
					first_name: newUser.first_name,
					last_name: newUser.last_name,
					token: token,
				}
			})
			
		} catch (error) {
			// Handle duplicate key error (e.g., email already exists)
			if (error.code == 11000) {
				return res.status(409).send({
					error: "Account already exists"
				})
			}

			console.error("Error creating account:", error)

			return res.status(500).send({
				error: "Internal Server Error"
			})
		}

		res.send({
			success: true
		})
	})
}

module.exports = setupEndPoint