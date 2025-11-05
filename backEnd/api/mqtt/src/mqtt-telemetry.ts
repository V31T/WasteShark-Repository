import mqtt from "mqtt";
import TelemetryRoute from "./routes/robotTelemetry";
import {
  posePayload, attitudePayload, velocityPayload, batteryPayload,
  heartbeatPayload, gpsPayload, healthPayload, navPayload,
  TelemetryTopic
} from "./telemetry.types";

const MQTT_URL   = process.env.MQTT_URL   || "mqtt://127.0.0.1:1883";
const ROBOT_ID   = process.env.ROBOT_ID   || "wasteshark-01";
const TOPIC_BASE = process.env.TOPIC_BASE || "ws/telemetry";

const validators: Record<TelemetryTopic, (d: unknown) => any> = {
  pose:      (d) => posePayload.parse(d),
  attitude:  (d) => attitudePayload.parse(d),
  velocity:  (d) => velocityPayload.parse(d),
  battery:   (d) => batteryPayload.parse(d),
  heartbeat: (d) => heartbeatPayload.parse(d),
  gps:       (d) => gpsPayload.parse(d),
  health:    (d) => healthPayload.parse(d),
  nav:       (d) => navPayload.parse(d),
};

export function startMqttTelemetry() {
  const client = mqtt.connect(MQTT_URL, { clean: true, reconnectPeriod: 2000 });

  client.on("connect", () => {
    console.log("[mqtt] connected:", MQTT_URL);
    client.subscribe(`${TOPIC_BASE}/#`, { qos: 0 }, (err) => {
      if (err) console.error("[mqtt] subscribe error:", err);
      else console.log(`[mqtt] subscribed to ${TOPIC_BASE}/#`);
    });
  });

  client.on("message", async (topic, buf) => {
    try {
      const raw = buf.toString("utf8").trim();
      const data = JSON.parse(raw);

      const parts = topic.split("/");
      const leaf = parts[parts.length - 1] as TelemetryTopic;
      if (!validators[leaf]) return;

      const parsed = validators[leaf](data);

      const packet = {
        robotId: ROBOT_ID,
        status: {
          [leaf]: parsed,
          last_seen: new Date().toISOString()
        }
      };

      await TelemetryRoute.run(client, packet);
    } catch (e) {
      console.error("[mqtt] message error:", e);
    }
  });

  client.on("error", (err) => {
    console.error("[mqtt] client error:", err);
  });

  return client;
}
