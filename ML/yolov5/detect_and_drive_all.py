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


# ============================================================================
# GLOBAL SHARED STATE
# ============================================================================
detection_queue = deque(maxlen=1)  # Stores latest detections
rover_active = threading.Event()  # Controls when rover should be active
shutdown_flag = threading.Event()  # Graceful shutdown signal


# ============================================================================
# LED CONTROLLER
# ============================================================================
try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False
    print("Warning: RPi.GPIO not available. LED control disabled.")

class LEDController:
    """Controls RGB status LEDs using PWM for target detection and battery status"""
    
    def __init__(self, 
                 status_r_pin=29, status_g_pin=31, status_b_pin=36,
                 battery_r_pin=38, battery_g_pin=40, battery_b_pin=33,
                 use_gpio=True):
        # Status LED pins (LED1) - Shows detection/movement state
        self.status_r_pin = status_r_pin
        self.status_g_pin = status_g_pin
        self.status_b_pin = status_b_pin
        
        # Battery LED pins (LED2) - Shows battery level
        self.battery_r_pin = battery_r_pin
        self.battery_g_pin = battery_g_pin
        self.battery_b_pin = battery_b_pin
        
        self.enabled = use_gpio and GPIO_AVAILABLE
        self.battery_voltage = 100.0  # Default to full battery
        
        # PWM objects
        self.status_r_pwm = None
        self.status_g_pwm = None
        self.status_b_pwm = None
        self.battery_r_pwm = None
        self.battery_g_pwm = None
        self.battery_b_pwm = None
        
        if self.enabled:
            try:
                GPIO.setmode(GPIO.BOARD)  # Use physical pin numbering
                GPIO.setwarnings(False)
                
                # Setup status LED (LED1)
                GPIO.setup([self.status_r_pin, self.status_g_pin, self.status_b_pin], GPIO.OUT)
                self.status_r_pwm = GPIO.PWM(self.status_r_pin, 1000)
                self.status_g_pwm = GPIO.PWM(self.status_g_pin, 1000)
                self.status_b_pwm = GPIO.PWM(self.status_b_pin, 1000)
                
                # Setup battery LED (LED2)
                GPIO.setup([self.battery_r_pin, self.battery_g_pin, self.battery_b_pin], GPIO.OUT)
                self.battery_r_pwm = GPIO.PWM(self.battery_r_pin, 1000)
                self.battery_g_pwm = GPIO.PWM(self.battery_g_pin, 1000)
                self.battery_b_pwm = GPIO.PWM(self.battery_b_pin, 1000)
                
                # Start all PWM at 0%
                self.status_r_pwm.start(0)
                self.status_g_pwm.start(0)
                self.status_b_pwm.start(0)
                self.battery_r_pwm.start(0)
                self.battery_g_pwm.start(0)
                self.battery_b_pwm.start(0)
                
                # Initial state: Status=Red (no target), Battery=Green (good)
                self.set_status_led(False, False)
                self.set_battery_led(100.0)
                
                print(f"LED Controller initialized (PWM):")
                print(f"  Status LED: R={status_r_pin}, G={status_g_pin}, B={status_b_pin}")
                print(f"  Battery LED: R={battery_r_pin}, G={battery_g_pin}, B={battery_b_pin}")
            except Exception as e:
                print(f"LED initialization failed: {e}")
                self.enabled = False
        else:
            print("LED Controller running in simulation mode (no GPIO)")
    
    def _map(self, x, in_min, in_max, out_min, out_max):
        """Map value from one range to another (for RGB 0-255 to PWM 0-100)"""
        return int((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)
    
    def _set_color(self, r_pwm, g_pwm, b_pwm, r_val, g_val, b_val):
        """
        Set RGB color using PWM duty cycle
        
        Args:
            r_pwm, g_pwm, b_pwm: PWM objects
            r_val, g_val, b_val: RGB values (0-255)
        """
        if r_pwm and g_pwm and b_pwm:
            r_pwm.ChangeDutyCycle(self._map(r_val, 0, 255, 0, 100))
            g_pwm.ChangeDutyCycle(self._map(g_val, 0, 255, 0, 100))
            b_pwm.ChangeDutyCycle(self._map(b_val, 0, 255, 0, 100))
    
    def set_status_led(self, target_detected, moving):
        """
        Set status LED based on target detection and movement
        
        Args:
            target_detected (bool): True if target detected
            moving (bool): True if rover is moving toward target
        """
        if self.enabled:
            if target_detected and moving:
                # Green: Detected and moving toward target (RGB: 52, 168, 83)
                self._set_color(self.status_r_pwm, self.status_g_pwm, self.status_b_pwm, 
                               52, 168, 83)
            elif target_detected and not moving:
                # Blue: Target reached (RGB: 0, 201, 204)
                self._set_color(self.status_r_pwm, self.status_g_pwm, self.status_b_pwm, 
                               0, 201, 204)
            else:
                # Red: No target detected (RGB: 247, 120, 138)
                self._set_color(self.status_r_pwm, self.status_g_pwm, self.status_b_pwm, 
                               247, 120, 138)
        else:
            # Simulation mode
            if target_detected and moving:
                status = "🟢 GREEN (Moving to Target)"
            elif target_detected and not moving:
                status = "🔵 BLUE (Target Reached)"
            else:
                status = "🔴 RED (Searching)"
            print(f"Status LED: {status}")
    
    def set_battery_led(self, battery_percent):
        """
        Set battery LED based on battery percentage
        
        Args:
            battery_percent (float): Battery percentage (0-100)
        """
        self.battery_voltage = battery_percent
        
        if self.enabled:
            if battery_percent > 50:
                # Green: Good battery (RGB: 52, 168, 83)
                self._set_color(self.battery_r_pwm, self.battery_g_pwm, self.battery_b_pwm, 
                               52, 168, 83)
            elif battery_percent > 20:
                # Yellow/Orange: Medium battery (RGB: 255, 200, 0)
                self._set_color(self.battery_r_pwm, self.battery_g_pwm, self.battery_b_pwm, 
                               255, 200, 0)
            else:
                # Red: Low battery (RGB: 247, 120, 138)
                self._set_color(self.battery_r_pwm, self.battery_g_pwm, self.battery_b_pwm, 
                               247, 120, 138)
        else:
            # Simulation mode
            if battery_percent > 50:
                status = "🟢 GREEN (Good Battery)"
            elif battery_percent > 20:
                status = "🟡 YELLOW (Medium Battery)"
            else:
                status = "🔴 RED (Low Battery)"
            print(f"Battery LED: {status} ({battery_percent:.1f}%)")
    
    def update_battery_from_mavlink(self, master):
        """
        Read battery voltage from Pixhawk and update LED
        
        Args:
            master: MAVLink connection object
        """
        if not self.enabled:
            return
        
        try:
            # Request battery status
            msg = master.recv_match(type='BATTERY_STATUS', blocking=False, timeout=0.1)
            if msg:
                # Calculate percentage (assuming 3S LiPo: 12.6V full, 9.9V empty)
                voltage = msg.voltages[0] / 1000.0  # Convert from mV to V
                battery_percent = ((voltage - 9.9) / (12.6 - 9.9)) * 100.0
                battery_percent = max(0, min(100, battery_percent))  # Clamp 0-100
                
                self.set_battery_led(battery_percent)
        except Exception as e:
            # If can't read battery, assume good
            pass
    
    def cleanup(self):
        """Clean up GPIO on shutdown"""
        if self.enabled:
            try:
                # Stop all PWM
                for pwm in [self.status_r_pwm, self.status_g_pwm, self.status_b_pwm,
                           self.battery_r_pwm, self.battery_g_pwm, self.battery_b_pwm]:
                    if pwm:
                        pwm.stop()
                
                # Cleanup GPIO
                GPIO.cleanup()
                print("LED GPIO cleaned up")
            except Exception as e:
                print(f"LED cleanup error: {e}")


# ============================================================================
# ROVER CONTROL CLASS
# ============================================================================
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


# ============================================================================
# NAVIGATION LOGIC
# ============================================================================
class NavigationController:
    """Controls rover movement based on object detections"""
    
    def __init__(self, rover_controller, led_controller=None, target_classes=['bottle', 'trash']):
        self.rover = rover_controller
        self.led = led_controller
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
        is_moving = False
        
        if not detections:
            # No target detected - stop
            if self.led:
                self.led.set_status_led(False, False)
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
            if self.led:
                self.led.set_status_led(False, False)
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
            if self.led:
                self.led.set_status_led(True, False)  # Target detected but not moving
            return 1500, 1500
        
        # Target found and moving toward it
        is_moving = True
        
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
        
        # Update LED to show moving toward target
        if self.led:
            self.led.set_status_led(True, is_moving)
        
        return left_pwm, right_pwm


# ============================================================================
# CONTROL THREAD
# ============================================================================
def control_thread(rover_controller, nav_controller, led_controller):
    """
    Rover control loop - runs at fixed rate, uses latest detections
    """
    print("Control thread started")
    
    control_rate = 20  # Hz
    dt = 1.0 / control_rate
    battery_update_counter = 0
    
    while not shutdown_flag.is_set():
        if not rover_active.is_set():
            # Rover not active - keep stopped
            rover_controller.stop()
            if led_controller:
                led_controller.set_status_led(False, False)
            time.sleep(dt)
            continue
        
        # Update battery LED every 2 seconds (every 40 iterations at 20Hz)
        battery_update_counter += 1
        if led_controller and battery_update_counter >= 40:
            if rover_controller.connected and rover_controller.master:
                led_controller.update_battery_from_mavlink(rover_controller.master)
            battery_update_counter = 0
        
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


# ============================================================================
# MODIFIED YOLOv5 DETECTION
# ============================================================================
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


# ============================================================================
# TELEMETRY - ASYNC VERSION
# ============================================================================
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
    master = mavutil.mavlink_
