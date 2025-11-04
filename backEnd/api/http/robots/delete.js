const Robot = require(process.cwd() + "/schemas/Robot.js")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/robots/delete", verifyRobotOwnership, verifyJWT, async function(req, res) {
		try {
			await Robot.updateOne({
				robot_id: req.body.robotId
			},
			{
				$unset: {
					owned_by_user_id: req.body.userId
				}
			})
		} catch (error) {
			console.error("Error updating robot status in database:", error)

			res.status(500).send({
				error: "Internal server error"
			})
			
			return
		}

		res.send({
			success: true
		})
	})
}

module.exports = setupEndPoint