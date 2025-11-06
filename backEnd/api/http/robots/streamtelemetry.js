const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const server = require(process.cwd() + "/server.js")

function setupEndPoint(app) {
    app.get("/api/robots/streamtelemetry", verifyJWT, verifyRobotOwnership, async function(req, res) {
        const robotId = req.query.robotId || req.body.robotId;
        server.addServerSentEvent(res, "streamtelemetry/" + robotId);
    })
}

// Export the route setup
module.exports = setupEndPoint