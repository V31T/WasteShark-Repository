import Robot from "../schemas/Robot";
import { getSSE } from "../server-sse";

export interface RobotTelemetry {
  robotId: string;
  status: Record<string, unknown>;
}

const path = "/robot/telemetry";

async function run(_client: unknown, data: RobotTelemetry) {
  console.log("got telemetry", data, "for robot", data.robotId);

  // stream to any listeners
  const sse = getSSE("streamtelemetry/" + data.robotId);
  const payload = JSON.stringify(data);
  for (const res of sse) res.write(`data: ${payload}\n\n`);

  // upsert + granular set each leaf under status.<leaf>
  const sets: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data.status)) {
    sets[`status.${k}`] = v;
  }
  sets["updated_at"] = new Date();

  try {
    await Robot.updateOne(
      { robot_id: data.robotId },
      { $set: sets },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error updating robot status in database:", err);
  }
}

export default { run, path };
