// api/robots/streamTelemetry.js
const mqtt = require("mqtt");

const { client } = require(process.cwd() + "/server.js");

function setupEndPoint(app) {
  app.get("/api/robots/streamtelemetry", async function (req, res) {
    console.log("Incoming GET request to /api/robots/streamtelemetry");

    // Setup SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Subscribe to telemetry topic
    const topic = "robot/telemetry";
    client.subscribe(topic, (err) => {
      if (err) {
        console.error("Failed to subscribe to telemetry topic:", err);
        res.write(`data: ${JSON.stringify({ error: "Subscription failed" })}\n\n`);
        return;
      }
      console.log(`Subscribed to ${topic}`);
    });

    // Handle incoming telemetry messages
    client.on("message", (receivedTopic, payload) => {
      if (receivedTopic === topic) {
        const message = payload.toString();
        console.log("Received telemetry from MQTT:", message);

        // Forward the message through the SSE connection
        res.write(`data: ${message}\n\n`);
      }
    });

    // Cleanup when client disconnects
    req.on("close", () => {
      client.unsubscribe(topic, () => {
        console.log(`Client disconnected — unsubscribed from ${topic}`);
      });
      res.end();
    });
  });
}

module.exports = setupEndPoint;