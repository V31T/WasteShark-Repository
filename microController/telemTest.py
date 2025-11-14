#!/usr/bin/env python3
"""
Simple Pixhawk telemetry monitor using MAVLink.
Reads and prints key telemetry messages from /dev/ttyACM0.
"""

from pymavlink import mavutil
import time

# Connect to Pixhawk (same port and baud you use elsewhere)
print("🔌 Connecting to Pixhawk on /dev/ttyACM0 ...")
master = mavutil.mavlink_connection('/dev/ttyACM0', baud=115200)
master.wait_heartbeat()
print(f"✅ Connected (System {master.target_system}, Component {master.target_component})")

# Request data stream rates (optional but helps)
master.mav.request_data_stream_send(
    master.target_system,
    master.target_component,
    mavutil.mavlink.MAV_DATA_STREAM_ALL,
    2,  # Hz
    1   # start
)

print("📡 Listening for telemetry... (Ctrl+C to stop)")
try:
    while True:
        msg = master.recv_match(blocking=True, timeout=5)
        if not msg:
            print("No data...")
            continue
        msg_type = msg.get_type()

        # Example: parse the most useful telemetry packets
        if msg_type == "HEARTBEAT":
            mode = mavutil.mode_string_v10(msg)
            print(f"❤️  Mode: {mode}, Armed: {msg.base_mode & 128 > 0}")
        elif msg_type == "SYS_STATUS":
            voltage = msg.voltage_battery / 1000.0
            current = msg.current_battery / 100.0
            remaining = msg.battery_remaining
            print(f"🔋 Battery: {voltage:.1f} V, {current:.1f} A, {remaining}%")
        elif msg_type == "ATTITUDE":
            roll = msg.roll * 57.3
            pitch = msg.pitch * 57.3
            yaw = msg.yaw * 57.3
            print(f"🧭 Attitude  Roll:{roll:.1f}°  Pitch:{pitch:.1f}°  Yaw:{yaw:.1f}°")
        elif msg_type == "GLOBAL_POSITION_INT":
            lat = msg.lat / 1e7
            lon = msg.lon / 1e7
            alt = msg.relative_alt / 1000.0
            print(f"🌍 GPS  Lat:{lat:.6f}  Lon:{lon:.6f}  Alt:{alt:.1f} m")
        elif msg_type == "VFR_HUD":
            print(f"⚙️ Airspeed:{msg.airspeed:.1f} m/s  Groundspeed:{msg.groundspeed:.1f} m/s  Alt:{msg.alt:.1f} m")

        # Throttle printing a bit
        time.sleep(0.2)

except KeyboardInterrupt:
    print("Stopping telemetry stream.")
finally:
    master.close()
