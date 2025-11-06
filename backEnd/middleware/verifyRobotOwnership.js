const Robot = require(process.cwd() + "/schemas/Robot.js")

async function run(req, res, next) {
	let robotData

	// Support both body (POST) and query (GET) parameters
	const robotId = req.body.robotId || req.query.robotId

	if (!robotId) {
		res.status(400).send({
			error: "Robot ID is required"
		})
		return
	}

	try {
		robotData = await Robot.findOne({ robot_id: robotId })
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
	
	if (robotData.owned_by_user_id !== req.user.user_id) {
		res.status(403).send({
			error: "Invalid credentials"
		})

		return
	}

	req.robotData = robotData

	next()
}

module.exports = run