import { Router } from "express";
import { addSSE } from "../server-sse";

const router = Router();

/** Browser can connect to:
 *   GET /streamtelemetry/:robotId
 * and will receive live `data: { ... }` events.
 */
router.get("/streamtelemetry/:robotId", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(": ok\n\n");

  addSSE(`streamtelemetry/${req.params.robotId}`, res);
});

export default router;
