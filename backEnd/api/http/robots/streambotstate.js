// api/robots/streamBotState.js
const verifyJWT = require(process.cwd() + "/middleware/verifyJWT")

function setupEndPoint(app) {
    app.get("/api/robots/streambotstate", verifyJWT, async function(req, res) {
        // Proper Server-Sent Event headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let count = 0;
        const interval = setInterval(() => {
            const data = { status: "Roaming", iteration: count++ };

            // Send SSE-formatted message
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            console.log("Sent data:", data);
        }, 1000);

        // When the client disconnects
        req.on("close", () => {
            clearInterval(interval);
            console.log("Client disconnected");
        });
    })
}

// Export the route setup
module.exports = setupEndPoint