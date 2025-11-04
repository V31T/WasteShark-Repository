const Robot = require(process.cwd() + "/schemas/Robot.js")

const path = "/robot/updatestatus"

async function run(client, data) {
	console.log("set status to", data.status, "for robot", data.robotId)

	// Use a server sent event to update the frontend @Tavishi

	try {
		await Robot.updateOne({
			robot_id: data.robotId
		},
		{
			$set: {
				status: data.status
			}
		})
	} catch (error) {
		console.error("Error updating robot status in database:", error)
	}
}

module.exports = {
	run: run,
	path: path
}