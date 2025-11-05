import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import sseRouter from "./routes/sse";
import { startMqttTelemetry } from "./mqtt-telemetry";

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wasteshark";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("[mongo] connected");

  const app = express();

  // health
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  // SSE
  app.use(sseRouter);

  // start MQTT bridge
  startMqttTelemetry();

  app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
