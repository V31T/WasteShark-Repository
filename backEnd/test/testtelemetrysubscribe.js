// test/testTelemetrySubscribe.js
const EventSource = require("eventsource");

console.log("SUBSCRIBE - robot/telemetry");

const eventSource = new EventSource("http://localhost:3000/api/robots/streamtelemetry");

eventSource.onopen = () => {
    console.log("Connected to telemetry stream");
};

eventSource.onmessage = (event) => {
    console.log("Received telemetry:", event.data);
};

eventSource.onerror = (err) => {
    console.error("Telemetry stream error or closed:", err);
    eventSource.close();
};