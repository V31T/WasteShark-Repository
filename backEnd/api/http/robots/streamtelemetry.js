const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const server = require(process.cwd() + "/server.js")

function setupEndPoint(app) {
    app.get("/api/robots/streamtelemetry", verifyJWT, verifyRobotOwnership, async function(req, res) {
        server.addServerSentEvent(res, "streamtelemetry/" + req.body.robotId);
    })
}

// Export the route setup
module.exports = setupEndPoint