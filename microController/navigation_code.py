#!/usr/bin/env python3
"""
navigation_code.py
High-level navigation: turn/drive the boat toward the detected target.

MQTT TOPICS (change if your setup differs)
- Subscribes:  ws/det/target
  Payload:     {"cx": <int>, "cy": <int>, "w": 640, "h": 480, "conf": 0.85}
               cx,cy are pixel center of the target; w,h are frame size.

- Publishes:   ws/motors/cmd
  Payload:     {"left": <0..1>, "right": <0..1>}   # normalized throttle
"""

import json
import math
import signal
import sys
import time
from dataclasses import dataclass

import paho.mqtt.client as mqtt


BROKER_HOST = "127.0.0.1"
BROKER_PORT = 1883
TOPIC_DET   = "ws/det/target"
TOPIC_CMD   = "ws/motors/cmd"


@dataclass
class CtrlParams:
    base: float      # forward base throttle
    kp_yaw: float    # proportional gain for yaw/heading correction
    max_throttle: float = 1.0


def clip(x, lo, hi):
    return lo if x < lo else hi if x > hi else x


class Navigator:
    def __init__(self, params: CtrlParams):
        self.params = params
        self.last_cmd_ts = 0.0

        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="navigator")
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.connect(BROKER_HOST, BROKER_PORT, keepalive=30)

    # MQTT callbacks
    def _on_connect(self, client, userdata, flags, rc, props=None):
        print(f"[nav] MQTT connected rc={rc}, subscribing {TOPIC_DET}")
        client.subscribe(TOPIC_DET, qos=0)

    def _on_message(self, client, userdata, msg):
        try:
            det = json.loads(msg.payload.decode("utf-8"))
            self._handle_detection(det)
        except Exception as e:
            print(f"[nav] bad payload on {msg.topic}: {e}")

    # Core logic
    def _handle_detection(self, det):
        # Expect cx, cy in pixels and frame size w,h
        cx = float(det.get("cx", 0))
        w  = float(det.get("w", 640))

        # Normalize horizontal error: -1 (far left) .. +1 (far right)
        err = ((cx / max(w, 1.0)) * 2.0) - 1.0

        # Yaw correction -> differential thrust
        yaw = self.params.kp_yaw * err
        left  = clip(self.params.base - yaw, 0.0, self.params.max_throttle)
        right = clip(self.params.base + yaw, 0.0, self.params.max_throttle)

        cmd = {"left": round(left, 3), "right": round(right, 3)}
        self.client.publish(TOPIC_CMD, json.dumps(cmd), qos=0, retain=False)
        self.last_cmd_ts = time.time()
        print(f"[nav] err={err:+.3f} -> cmd {cmd}")

    def loop_forever(self):
        print("[nav] running… Ctrl+C to exit")
        self.client.loop_start()
        try:
            while True:
                # Safety: if no detections for a while, stop motors
                if time.time() - self.last_cmd_ts > 1.0:
                    self.client.publish(TOPIC_CMD, json.dumps({"left": 0.0, "right": 0.0}), qos=0)
                    self.last_cmd_ts = time.time()
                time.sleep(0.1)
        finally:
            self.client.loop_stop()
            self.client.disconnect()


def main():
    params = CtrlParams(
        base=0.35,   # forward thrust; tune for your boat
        kp_yaw=0.6,  # heading correction gain; tune as needed
        max_throttle=0.8
    )
    nav = Navigator(params)
    nav.loop_forever()


if __name__ == "__main__":
    # Graceful exit
    def _sig(_s, _f):
        print("\n[nav] shutting down")
        sys.exit(0)
    signal.signal(signal.SIGINT, _sig)
    signal.signal(signal.SIGTERM, _sig)
    main()
