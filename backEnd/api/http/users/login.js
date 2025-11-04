const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const User = require(process.cwd() + "/schemas/User.js")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/users/login", async function(req, res) {
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

		const accessToken = jwt.sign(
			{
				user_id: user.user_id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name
			},
			process.env.ACCESS_TOKEN_SECRET,
			{
				expiresIn: "15m",
			}
		);

		const refreshToken = jwt.sign(
			{
				user_id: user.user_id
			},
			process.env.REFRESH_TOKEN_SECRET,
			{
				expiresIn: "7d",
			}
		);

		res.cookie("jwt", refreshToken, {
			httpOnly: true,                // prevents JS access (XSS protection)
			secure: process.env.NODE_ENV === 'production', // only HTTPS in production
			sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // None in prod (cross-site), Lax for dev
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		})

		res.send({
			success: true,
			token: accessToken,
			user_id: user.user_id
		})
	})
}

module.exports = setupEndPoint