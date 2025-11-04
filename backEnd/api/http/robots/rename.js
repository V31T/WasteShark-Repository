const Robot = require(process.cwd() + "/schemas/Robot.js")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/robots/rename", verifyRobotOwnership, verifyJWT, async function(req, res) {
		const newName = {
			name: req.body.name
		}

		// User can optionally provide a location
		if (req.body.location) {
			newName.location = req.body.location
		}

		try {
			await Robot.updateOne({
				robot_id: req.body.robotId
			},
			{
				$set: newName
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