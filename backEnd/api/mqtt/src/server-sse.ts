import type { Response } from "express";

const registry = new Map<string, Set<Response>>();

/** Register an SSE connection for a key (e.g., "streamtelemetry/wasteshark-01"). */
export function addSSE(key: string, res: Response) {
  if (!registry.has(key)) registry.set(key, new Set());
  registry.get(key)!.add(res);
  res.on("close", () => {
    registry.get(key)!.delete(res);
    if (registry.get(key)!.size === 0) registry.delete(key);
  });
}

/** Get all SSE connections for a key. */
export function getSSE(key: string): Set<Response> {
  return registry.get(key) ?? new Set();
}
