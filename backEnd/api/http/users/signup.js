const bcrypt = require("bcrypt")
const User = require(process.cwd() + "/schemas/User.js")
const jwt = require("jsonwebtoken")
const uuid = require("uuid")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/users/signup", async function(req, res) {
		try {
			const userExists = await User.exists({ email: req.body.email })

			if (userExists) {
				return res.status(409).send({
					error: "Account already exists"
				})
			}

			const hash = await bcrypt.hash(req.body.password, 10)

			const user_id = uuid.v4()

			const newUser = await User.create({
				user_id: user_id,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				password: hash
			})

			const accessToken = jwt.sign(
				{
					user_id: newUser.user_id,
					email: newUser.email,
					first_name: newUser.first_name,
					last_name: newUser.last_name,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{
					expiresIn: "15m",
				}
			);

			const refreshToken = jwt.sign(
				{
					user_id: newUser.user_id
				},
				process.env.REFRESH_TOKEN_SECRET,
				{
					expiresIn: "7d",
				}
			);

			res.cookie("jwt", refreshToken, {
				httpOnly: true,                // prevents JS access (XSS protection)
				secure: process.env.NODE_ENV === 'production', // only HTTPS in production
				sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
			})

			res.send({
				success: true,
				token: accessToken
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
	})
}

module.exports = setupEndPoint