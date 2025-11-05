const Robot = require(process.cwd() + "/schemas/Robot.js")
const server = require(process.cwd() + "/server.js")

const path = "/robot/telemetry"

async function run(client, data) {
	console.log("got telemetry", data, "for robot", data.robotId)

	const serverSentEvents = server.getServerSentEvents("streamtelemetry/" + data.robotId)
	const dataString = JSON.stringify(data)

	// If any server sent event connections exist for this robot, send the update
	for (const res of serverSentEvents) {
		res.write(`data: ${dataString}\n\n`)
	}

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