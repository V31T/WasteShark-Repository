const User = require(process.cwd() + "/schemas/User.js")
const jwt = require("jsonwebtoken")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT.js") // import your JWT middleware
const method = "post"

async function stopRobot(app, route) {
	app[method](route, verifyJWT, async function (req, res) {
		try {
			res.send({
				success: true,
			})
		} catch (error) {
			console.error("Failed to Start Robot:", error)

			return res.status(500).send({
				error: "Internal Server Error",
			})
		}
	})
}

module.exports = stopRobot