// api/robots/streamTelemetry.js

function setupEndPoint(app) {
    app.get("/api/robots/streamtelemetry", async function (req, res) {
    console.log("Incoming GET request to /api/robots/streamtelemetry");

    // Proper Server-Sent Events (SSE) headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let count = 0;

    // Simulated telemetry stream
    const interval = setInterval(() => {
        const data = {
            robotId: "WSHARK-01",
            timestamp: new Date().toISOString(),
            telemetry: {
                battery: (100 - count).toFixed(1) + "%",
                temperature: (20 + Math.random() * 5).toFixed(2) + "°C",
                position: {
                    x: (Math.random() * 100).toFixed(2),
                    y: (Math.random() * 100).toFixed(2),
                },
            },
        };

        // Send SSE-formatted telemetry data
        res.write(`data: ${JSON.stringify(data)}\n\n`);

        console.log("Sent telemetry data:", data);

        count++;

        // Stop after 10 messages for testing
        if (count >= 10) {
            clearInterval(interval);
            res.end();
            console.log("Telemetry stream ended after 10 updates");
        }
    }, 1000);

    // Handle client disconnect
    req.on("close", () => {
        clearInterval(interval);
        console.log("Client disconnected from /api/robots/streamtelemetry");
    });
    });
}

// Export for manual route registration
module.exports = setupEndPoint;