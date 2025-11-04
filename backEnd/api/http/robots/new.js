const Robot = require(process.cwd() + "/schemas/Robot.js")
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

async function setupEndPoint(app, mqttClient) {
	app.post("/api/robots/new", verifyJWT, async function(req, res) {
		let robotData

		try {
			robotData = await Robot.findOne({ robot_id: req.body.robotId })
		} catch (error) {
			console.error("Error updating robot status in database:", error)

			res.status(500).send({
				error: "Internal server error"
			})
			
			return
		}

		if (!robotData) {
			res.status(404).send({
				error: "Robot not found"
			})

			return
		}

		if (robotData.owned_by_user_id) {
			res.status(403).send({
				error: "Robot already owned"
			})

			return
		}

		try {
			await Robot.updateOne({
				robot_id: req.body.robotId
			},
			{
				$set: {
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