const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")
const verifyRobotOwnership = require(process.cwd() + "/middleware/verifyRobotOwnership.js")
const server = require(process.cwd() + "/server.js")

function setupEndPoint(app) {
    app.get("/api/robots/streambotstatus", verifyJWT, verifyRobotOwnership, async function(req, res) {
        server.addServerSentEvent(res, "streambotstatus/" + req.body.robotId);
    })
}

// Export the route setup
module.exports = setupEndPoint