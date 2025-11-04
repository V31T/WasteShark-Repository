const Robot = require(process.cwd() + "/schemas/Robot.js")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/robots/fetch", verifyJWT, async function(req, res) {
		let robots

		try {
			robots = await Robot.find({
				owned_by_user_id: req.body.userId
			}).select('robot_id name location -_id') // Makes it return only these fields without the _id field
		} catch (error) {
			console.error("Error fetching robots from database:", error)

			res.status(500).send({
				error: "Internal server error"
			})
			
			return
		}

		res.send({
			success: true,
			robots: robots
		})
	})
}

module.exports = setupEndPoint