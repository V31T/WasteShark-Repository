const bcrypt = require("bcrypt")
const User = require(process.cwd() + "/schemas/User.js")

const authCookie = require(process.cwd() + "/middleware/authCookie.js")
const method = "post"

async function setupEndPoint(app, route) {
	// authCookie(app, route, method)

	app[method](route, async function(req, res) {
		try {
			const userExists = await User.exists({ email: req.body.email })

			if (userExists) {
				return res.status(409).send({
					error: "Account already exists"
				})
			}

			const hash = await bcrypt.hash(req.body.password, 10)

			await User.create({
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				password: hash
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