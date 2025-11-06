#!/usr/bin/env python3
"""
Autonomous Rover with YOLOv5 Object Detection
Detects bottles/trash and navigates toward them
"""

import argparse
import csv
import os
import platform
import sys
import threading
import time
import asyncio
import paho.mqtt.client as mqtt
import ssl
import json
from collections import deque
from pathlib import Path

import torch
import cv2
from pymavlink import mavutil

# YOLOv5 imports
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))

from ultralytics.utils.plotting import Annotator, colors, save_one_box
from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    check_requirements,
    colorstr,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.torch_utils import select_device, smart_inference_mode


# GLOBAL SHARED STATE

detection_queue = deque(maxlen=1)  # Stores latest detections
rover_active = threading.Event()  # Controls when rover should be active
shutdown_flag = threading.Event()  # Graceful shutdown signal



# ROVER CONTROL CLASS

class RoverController:
    """Handles MAVLink communication and rover motor control"""
    
    def __init__(self, connection_string='/dev/ttyACM0', baud=115200):
        self.connection_string = connection_string
        self.baud = baud
        self.master = None
        self.connected = False
        
    def connect(self):
        """Connect to Pixhawk"""
        try:
            print(f"Connecting to Pixhawk at {self.connection_string}...")
            self.master = mavutil.mavlink_connection(self.connection_string, baud=self.baud)
            self.master.wait_heartbeat()
            print(f"Connected: system {self.master.target_system}, component {self.master.target_component}")
            self.connected = True
            return True
        except Exception as e:
            print(f"Failed to connect to Pixhawk: {e}")
            return False
    
    def set_mode(self, mode_name):
        """Set flight mode"""
        if not self.connected:
            return False
        try:
            mode_id = self.master.mode_mapping()[mode_name]
            self.master.set_mode(mode_id)
            print(f"Mode set to {mode_name}")
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Failed to set mode: {e}")
            return False
    
    def arm(self):
        """Arm the rover"""
        if not self.connected:
            return False
        try:
            print("Arming rover...")
            self.master.arducopter_arm()
            self.master.motors_armed_wait()
            print("Rover armed!")
            return True
        except Exception as e:
            print(f"Failed to arm: {e}")
            return False
    
    def disarm(self):
        """Disarm the rover"""
        if not self.connected:
            return False
        try:
            print("Disarming rover...")
            self.master.arducopter_disarm()
            self.master.motors_disarmed_wait()
            print("Rover disarmed.")
            return True
        except Exception as e:
            print(f"Failed to disarm: {e}")
            return False
    
    def send_rc(self, left_pwm, right_pwm):
        """Send RC override for differential drive (left=RC1, right=RC3)"""
        if not self.connected:
            return
        
        # Clamp PWM values to safe range
        left_pwm = max(1000, min(2000, left_pwm))
        right_pwm = max(1000, min(2000, right_pwm))
        
        self.master.mav.rc_channels_override_send(
            self.master.target_system,
            self.master.target_component,
            left_pwm,   # RC1 - left motor
            0,          # RC2 - unused
            right_pwm,  # RC3 - right motor
            0, 0, 0, 0, 0
        )
    
    def stop(self):
        """Stop all motors"""
        self.send_rc(1500, 1500)



# NAVIGATION LOGIC

class NavigationController:
    """Controls rover movement based on object detections"""
    
    def __init__(self, rover_controller, target_classes=['bottle', 'trash']):
        self.rover = rover_controller
        self.target_classes = target_classes
        
        # Control parameters
        self.base_speed = 200  # PWM offset from neutral (1500)
        self.turn_gain = 1.5   # Turning aggressiveness
        self.forward_threshold = 0.1  # How centered object must be to go straight
        self.stop_distance_ratio = 0.6  # Stop when object fills this much of frame
        
    def calculate_control(self, detections, frame_width, frame_height):
        """
        Calculate motor commands based on detections
        
        Args:
            detections: List of (xyxy, conf, cls, class_name) tuples
            frame_width: Width of the camera frame
            frame_height: Height of the camera frame
            
        Returns:
            (left_pwm, right_pwm): Motor PWM values
        """
        
        # Default: stop
        left_pwm = 1500
        right_pwm = 1500
        
        if not detections:
            # No target detected - stop
            return left_pwm, right_pwm
        
        # Find largest target object (closest/most important)
        target = None
        max_area = 0
        
        for det in detections:
            xyxy, conf, cls, class_name = det
            if class_name.lower() in self.target_classes:
                x1, y1, x2, y2 = xyxy
                area = (x2 - x1) * (y2 - y1)
                if area > max_area:
                    max_area = area
                    target = det
        
        if target is None:
            # No target class found - stop
            return left_pwm, right_pwm
        
        # Extract target bounding box
        xyxy, conf, cls, class_name = target
        x1, y1, x2, y2 = xyxy
        
        # Calculate object center
        obj_center_x = (x1 + x2) / 2
        obj_center_y = (y1 + y2) / 2
        
        # Calculate object size relative to frame
        obj_width = x2 - x1
        obj_height = y2 - y1
        size_ratio = (obj_width * obj_height) / (frame_width * frame_height)
        
        # Check if object is close enough (stop condition)
        if size_ratio > self.stop_distance_ratio:
            print(f"Target reached! ({class_name}, size ratio: {size_ratio:.2f})")
            return 1500, 1500
        
        # Calculate error from center (-1 to 1, negative = left, positive = right)
        error_x = (obj_center_x - frame_width / 2) / (frame_width / 2)
        
        # Calculate turn amount based on error
        if abs(error_x) < self.forward_threshold:
            # Object centered - go straight
            left_pwm = 1500 + self.base_speed
            right_pwm = 1500 + self.base_speed
            print(f"Moving forward toward {class_name} (centered, conf={conf:.2f})")
        else:
            # Turn toward object
            turn_amount = int(error_x * self.base_speed * self.turn_gain)
            
            # Differential steering: one side forward, other side slower/reverse
            left_pwm = 1500 + self.base_speed - turn_amount
            right_pwm = 1500 + self.base_speed + turn_amount
            
            direction = "right" if error_x > 0 else "left"
            print(f"Turning {direction} toward {class_name} (error={error_x:.2f}, conf={conf:.2f})")
        
        return left_pwm, right_pwm


# CONTROL THREAD

def control_thread(rover_controller, nav_controller):
    """
    Rover control loop - runs at fixed rate, uses latest detections
    """
    print("Control thread started")
    
    control_rate = 20  # Hz
    dt = 1.0 / control_rate
    
    while not shutdown_flag.is_set():
        if not rover_active.is_set():
            # Rover not active - keep stopped
            rover_controller.stop()
            time.sleep(dt)
            continue
        
        # Get latest detections
        if detection_queue:
            detection_data = detection_queue[-1]
            detections = detection_data['detections']
            frame_width = detection_data['frame_width']
            frame_height = detection_data['frame_height']
            
            # Calculate control commands
            left_pwm, right_pwm = nav_controller.calculate_control(
                detections, frame_width, frame_height
            )
            
            # Send to rover
            rover_controller.send_rc(left_pwm, right_pwm)
        else:
            # No detections yet - stop
            rover_controller.stop()
        
        time.sleep(dt)
    
    # Shutdown - stop and disarm
    rover_controller.stop()
    time.sleep(0.5)
    rover_controller.disarm()
    print("Control thread stopped")


# MODIFIED YOLOv5 DETECTION

@smart_inference_mode()
def run_detection(
    weights=ROOT / "runs/train_custom/exp11/last.pt",
    source=ROOT / "data/images",
    data=ROOT / "data/coco128.yaml",
    imgsz=(640, 640),
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=1000,
    device="",
    view_img=True,
    save_txt=False,
    save_format=0,
    save_csv=False,
    save_conf=False,
    save_crop=False,
    nosave=False,
    classes=None,
    agnostic_nms=False,
    augment=False,
    visualize=False,
    update=False,
    project=ROOT / "runs/detect",
    name="exp",
    exist_ok=False,
    line_thickness=3,
    hide_labels=False,
    hide_conf=False,
    half=False,
    dnn=False,
    vid_stride=1,
):
    """YOLOv5 detection with navigation integration"""
    
    source = str(source)
    save_img = not nosave and not source.endswith(".txt")
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    is_url = source.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    webcam = source.isnumeric() or source.endswith(".streams") or (is_url and not is_file)
    screenshot = source.lower().startswith("screen")
    if is_url and is_file:
        source = check_file(source)

    # Directories
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)

    # Load model
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)

    # Dataloader
    bs = 1
    if webcam:
        view_img = check_imshow(warn=True)
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
    vid_path, vid_writer = [None] * bs, [None] * bs

    # Run inference
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))
    
    print("Detection thread started")
    
    for path, im, im0s, vid_cap, s in dataset:
        if shutdown_flag.is_set():
            break
            
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)
            im = im.half() if model.fp16 else im.float()
            im /= 255
            if len(im.shape) == 3:
                im = im[None]
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # Inference
        with dt[1]:
            visualize_path = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            if model.xml and im.shape[0] > 1:
                pred = None
                for image in ims:
                    if pred is None:
                        pred = model(image, augment=augment, visualize=visualize_path).unsqueeze(0)
                    else:
                        pred = torch.cat((pred, model(image, augment=augment, visualize=visualize_path).unsqueeze(0)), dim=0)
                pred = [pred, None]
            else:
                pred = model(im, augment=augment, visualize=visualize_path)
        
        # NMS
        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        # CSV setup
        csv_path = save_dir / "predictions.csv"
        
        def write_to_csv(image_name, prediction, confidence):
            data = {"Image Name": image_name, "Prediction": prediction, "Confidence": confidence}
            file_exists = os.path.isfile(csv_path)
            with open(csv_path, mode="a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=data.keys())
                if not file_exists:
                    writer.writeheader()
                writer.writerow(data)

        # Process predictions
        for i, det in enumerate(pred):
            seen += 1
            if webcam:
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)
            save_path = str(save_dir / p.name)
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")
            s += "{:g}x{:g} ".format(*im.shape[2:])
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]
            imc = im0.copy() if save_crop else im0
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))
            
            # Collect detections for navigation
            frame_detections = []
            
            if len(det):
                # Rescale boxes
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                # Print results
                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "

                # Write results
                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)
                    label = names[c] if hide_conf else f"{names[c]}"
                    confidence = float(conf)
                    confidence_str = f"{confidence:.2f}"
                    
                    # Store detection for navigation
                    frame_detections.append((
                        [float(x) for x in xyxy],
                        confidence,
                        c,
                        names[c]
                    ))

                    if save_csv:
                        write_to_csv(p.name, label, confidence_str)

                    if save_txt:
                        if save_format == 0:
                            coords = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                        else:
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                    if save_img or save_crop or view_img:
                        c = int(cls)
                        label = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {conf:.2f}")
                        annotator.box_label(xyxy, label, color=colors(c, True))
                    if save_crop:
                        save_one_box(xyxy, imc, file=save_dir / "crops" / names[c] / f"{p.stem}.jpg", BGR=True)
            
            # Update detection queue for navigation
            detection_queue.append({
                'detections': frame_detections,
                'frame_width': im0.shape[1],
                'frame_height': im0.shape[0],
                'timestamp': time.time()
            })

            # Stream results
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux" and p not in windows:
                    windows.append(p)
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                if cv2.waitKey(1) == ord('q'):
                    shutdown_flag.set()
                    break

            # Save results
            if save_img:
                if dataset.mode == "image":
                    cv2.imwrite(save_path, im0)
                else:
                    if vid_path[i] != save_path:
                        vid_path[i] = save_path
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()
                        if vid_cap:
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        save_path = str(Path(save_path).with_suffix(".mp4"))
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                    vid_writer[i].write(im0)

            LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1e3:.1f}ms")

    # Print results
    t = tuple(x.t / seen * 1e3 for x in dt)
    LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    if update:
        strip_optimizer(weights[0])
    
    print("Detection thread stopped")


# TELEMETRY - ASYNC VERSION
async def telemetry_loop():
    """Async telemetry loop that sends data via MQTT"""
    print("🚀 Starting async telemetry loop...")

    connected = False

    def on_connect(client, userdata, flags, rc, properties=None):
        nonlocal connected
        print(f"📡 MQTT Connected: {rc}")
        connected = True

    def on_message(client, userdata, msg):
        print(f"{msg.topic} -> {msg.payload.decode()} (QoS={msg.qos})")

    # Setup MQTT client
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set("kiwi", "cutiepie1234")
    client.tls_set(cert_reqs=ssl.CERT_NONE)
    client.tls_insecure_set(True)   # disables hostname verification
    client.on_connect = on_connect
    client.on_message = on_message

    # Connect to MQTT broker
    client.connect("mqtt.waste-shark.net", 8883)
    client.loop_start()

    # Wait for MQTT connection
    for _ in range(10):
        if connected:
            break
        await asyncio.sleep(0.5)
    
    if not connected:
        print("❌ Failed to connect to MQTT broker")
        return

    # Connect to Pixhawk
    print("🔌 Connecting to Pixhawk on /dev/ttyACM0 ...")
    master = mavutil.mavlink_connection('/dev/ttyACM0', baud=115200)
    master.wait_heartbeat()
    print(f"✅ Connected (System {master.target_system}, Component {master.target_component})")

    # Request data stream rates
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
            # Non-blocking receive with timeout
            msg = master.recv_match(blocking=False)
            
            if msg:
                msg_type = msg.get_type()

                # Parse and publish telemetry packets
                if msg_type == "ATTITUDE":
                    roll = msg.roll * 57.3
                    pitch = msg.pitch * 57.3
                    yaw = msg.yaw * 57.3

                    data = {
                        "robot_id": "robot-25",
                        "authentication_key": "temporary_auth_key",
                        "telemetry": {
                            "roll": roll,
                            "pitch": pitch,
                            "yaw": yaw
                        }
                    }

                    client.publish("/robot/telemetry", json.dumps(data))
                    print(f"🧭 Attitude  Roll:{roll:.1f}°  Pitch:{pitch:.1f}°  Yaw:{yaw:.1f}°")
                
                elif msg_type == "VFR_HUD":
                    data = {
                        "robot_id": "robot-25",
                        "authentication_key": "temporary_auth_key",
                        "telemetry": {
                            "groundspeed": msg.groundspeed,
                            "airspeed": msg.airspeed,
                            "altitude": msg.alt
                        }
                    }

                    client.publish("/robot/telemetry", json.dumps(data))
                    print(f"⚙️ Airspeed:{msg.airspeed:.1f} m/s  Groundspeed:{msg.groundspeed:.1f} m/s  Alt:{msg.alt:.1f} m")

            # Async sleep to allow other tasks to run
            await asyncio.sleep(0.2)
    
    except asyncio.CancelledError:
        print("🛑 Telemetry loop cancelled")
    finally:
        client.loop_stop()
        client.disconnect()
        print("✅ Telemetry disconnected")


def run_async_telemetry():
    """Wrapper to run async telemetry in a thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(telemetry_loop())
    except KeyboardInterrupt:
        print("\n👋 Telemetry interrupted")
    finally:
        loop.close()


# MAIN PROGRAM


def main():

    # Start async telemetry in background thread
    telemetry_thread = threading.Thread(
        target=run_async_telemetry,
        daemon=True
    )
    telemetry_thread.start()
    print("🚀 Telemetry thread started in background")
    
    parser = argparse.ArgumentParser(description="Rover Object Detection & Navigation")
    
    # YOLOv5 arguments
    parser.add_argument("--weights", type=str, default="yolov5s.pt", help="model path")
    parser.add_argument("--source", type=str, default="0", help="source (0 for webcam)")
    parser.add_argument("--data", type=str, default="data/coco128.yaml", help="dataset yaml")
    parser.add_argument("--imgsz", nargs="+", type=int, default=[640], help="inference size")
    parser.add_argument("--conf-thres", type=float, default=0.25, help="confidence threshold")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--device", default="", help="cuda device or cpu")
    parser.add_argument("--view-img", action="store_true", help="show results")
    parser.add_argument("--save-txt", action="store_true", help="save results to txt")
    parser.add_argument("--save-csv", action="store_true", help="save results to csv")
    parser.add_argument("--classes", nargs="+", type=int, help="filter by class")
    parser.add_argument("--project", default="runs/detect", help="save results to project/name")
    parser.add_argument("--name", default="exp", help="save results to project/name")
    
    # Rover arguments
    parser.add_argument("--pixhawk", type=str, default="/dev/ttyACM0", help="Pixhawk connection")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate")
    parser.add_argument("--target-classes", nargs="+", default=["bottle", "trash"], help="Classes to navigate toward")
    parser.add_argument("--no-rover", action="store_true", help="Run detection only (no rover control)")
    
    args = parser.parse_args()
    args.imgsz *= 2 if len(args.imgsz) == 1 else 1
    
    print("="*60)
    print("ROVER OBJECT DETECTION & NAVIGATION SYSTEM")
    print("="*60)
    print(f"Target classes: {args.target_classes}")
    print(f"Detection confidence threshold: {args.conf_thres}")
    
    # Initialize rover controller
    rover = None
    nav = None
    
    if not args.no_rover:
        rover = RoverController(args.pixhawk, args.baud)
        if rover.connect():
            rover.set_mode("MANUAL")
            if rover.arm():
                nav = NavigationController(rover, args.target_classes)
                rover_active.set()  # Activate rover control
                print("Rover ready! Starting autonomous navigation...")
            else:
                print("Failed to arm rover. Running in detection-only mode.")
        else:
            print("Failed to connect to rover. Running in detection-only mode.")
    else:
        print("Running in detection-only mode (--no-rover flag set)")
    
    # Start control thread if rover is active
    control_thread_handle = None
    if nav is not None:
        control_thread_handle = threading.Thread(
            target=control_thread,
            args=(rover, nav),
            daemon=True
        )
        control_thread_handle.start()
    
    # Start detection (runs in main thread)
    try:
        run_detection(
            weights=args.weights,
            source=args.source,
            data=args.data,
            imgsz=args.imgsz,
            conf_thres=args.conf_thres,
            iou_thres=args.iou_thres,
            device=args.device,
            view_img=args.view_img,
            save_txt=args.save_txt,
            save_csv=args.save_csv,
            classes=args.classes,
            project=args.project,
            name=args.name,
        )
    except KeyboardInterrupt:
        print("\nShutdown requested by user...")
    finally:
        print("\nShutting down...")
        shutdown_flag.set()
        
        # Wait for control thread to finish
        if control_thread_handle is not None:
            control_thread_handle.join(timeout=5)
        
        print("Shutdown complete!")


if __name__ == "__main__":
    main()
