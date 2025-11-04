const Robot = require(process.cwd() + "/schemas/Robot.js")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/robots/stop", verifyRobotOwnership, verifyJWT, async function(req, res) {
		try {
			await Robot.updateOne({
				robot_id: req.body.robotId
			},
			{
				$set: {
					status: "stopping"
				}
			})
		} catch (error) {
			console.error("Error updating robot status in database:", error)

			res.status(500).send({
				error: "Internal server error"
			})
			
			return
		}

		mqttClient.publish(`/robot/${req.body.robotId}/command`, JSON.stringify({
			status: "stopping"
		}))

		res.send({
			success: true
		})
	})
}

module.exports = setupEndPoint