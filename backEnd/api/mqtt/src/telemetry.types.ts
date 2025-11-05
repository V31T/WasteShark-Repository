import { z } from "zod";

export type TelemetryTopic =
  | "pose"
  | "attitude"
  | "velocity"
  | "battery"
  | "heartbeat"
  | "gps"
  | "health"
  | "nav";

const basePayload = z.object({
  ts: z.string().optional(), // ISO timestamp from the Pi (optional)
});

export const posePayload = basePayload.extend({
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  alt_rel: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
});

export const attitudePayload = basePayload.extend({
  roll: z.number().nullable().optional(),
  pitch: z.number().nullable().optional(),
  yaw: z.number().nullable().optional(),
});

export const velocityPayload = basePayload.extend({
  vx: z.number().nullable().optional(),
  vy: z.number().nullable().optional(),
  vz: z.number().nullable().optional(),
});

export const batteryPayload = basePayload.extend({
  voltage: z.number().nullable().optional(),
  current: z.number().nullable().optional(),
  remaining: z.number().nullable().optional(), // %
});

export const heartbeatPayload = basePayload.extend({
  mode: z.string().nullable().optional(),
  armed: z.boolean().nullable().optional(),
  failsafe: z.boolean().nullable().optional(),
});

export const gpsPayload = basePayload.extend({
  fix_type: z.number().nullable().optional(),
  sats: z.number().nullable().optional(),
  hdop: z.number().nullable().optional(),
});

export const healthPayload = basePayload.extend({
  load: z.number().nullable().optional(),          // CPU load or autopilot load
  drop_rate_comm: z.number().nullable().optional(),
  errors_comm: z.number().nullable().optional(),
});

export const navPayload = basePayload.extend({
  wp_num: z.number().nullable().optional(),
  wp_dist: z.number().nullable().optional(),       // meters to next waypoint/target
});

export type PosePayload = z.infer<typeof posePayload>;
export type AttitudePayload = z.infer<typeof attitudePayload>;
export type VelocityPayload = z.infer<typeof velocityPayload>;
export type BatteryPayload = z.infer<typeof batteryPayload>;
export type HeartbeatPayload = z.infer<typeof heartbeatPayload>;
export type GpsPayload = z.infer<typeof gpsPayload>;
export type HealthPayload = z.infer<typeof healthPayload>;
export type NavPayload = z.infer<typeof navPayload>;
