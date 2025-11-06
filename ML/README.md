🧠 WasteShark — Machine Learning Module

The Machine Learning (ML) module is the computer vision brain of the WasteShark autonomous trash-collecting boat. It uses a custom-trained YOLOv5s model running locally on the Raspberry Pi 5 to detect and classify floating debris in real time. Detections are streamed via MQTT to the navigation subsystem (Pixhawk) for autonomous steering toward targets.

🔍 Model Architecture

Model: YOLOv5s (Small)
Framework: PyTorch
Training Dataset: COCO dataset (pretrained) and a custom marine trash dataset (plastic bottles, cups, Styrofoam, cans, etc.)
Key Specs: 213 layers, 7.2M parameters, 16.4 GFLOPs, 640×640 input, confidence threshold 0.25, IOU threshold 0.45.

⚙️ Raspberry Pi 5 Configuration

The Raspberry Pi 5 acts as the onboard ML processor.
OS: Raspberry Pi OS 64-bit (Debian Bookworm)
Python: 3.11
Torch: 2.9 (CPU build)
OpenCV: opencv-python-headless (to avoid GUI / Qt errors)
MQTT Broker: Mosquitto (127.0.0.1:1883)
Networking: Tailscale for secure remote access

Environment Setup
cd ~/Theta-Tau-Project/Project/WasteShark-Repository
python3 -m venv mainEnv
source mainEnv/bin/activate
pip install -r ML/yolov5/requirements.txt
pip install paho-mqtt opencv-python-headless

🚀 Running YOLOv5 on the Pi (Headless Mode)
cd ~/Theta-Tau-Project/Project/WasteShark-Repository/ML/yolov5
source ~/Theta-Tau-Project/Project/WasteShark-Repository/mainEnv/bin/activate

export QT_QPA_PLATFORM=offscreen
export MPLBACKEND=Agg
export OPENCV_VIDEOIO_PRIORITY_V4L2=1

python3 detect.py \
  --weights runs/train_custom/exp11/last.pt \
  --source 0 \
  --device cpu \
  --imgsz 320 \
  --save-csv \
  --allow-fallback


Results and CSV logs are stored under runs/detect/.

📡 Telemetry & Communication

All detections are published over MQTT to the topic ws/det/target.
Example payload:

{
  "cx": 320,
  "cy": 240,
  "w": 640,
  "h": 480,
  "conf": 0.85,
  "label": "bottle"
}

Downstream Data Flow

Camera → YOLOv5s → MQTT → Navigation (Raspberry Pi) → Pixhawk → Motors

Navigation Topics

ML → Nav: ws/det/target → Object center, width, confidence
Nav → Motors: ws/motors/cmd → {"left": 0.4, "right": 0.35}
Pixhawk → Backend: ws/telemetry/pixhawk → GPS, battery, attitude

🛰️ Pixhawk Telemetry Integration

A separate bridge (pixhawk_telem_to_mqtt.py) uses pymavlink to read MAVLink data from /dev/ttyACM0 and publish it to ws/telemetry/pixhawk.
Example output:

{
  "voltage": 15.2,
  "current": 2.8,
  "remaining": 82,
  "roll": -0.23,
  "pitch": 0.14,
  "yaw": 91.6
}

💾 Backend Integration

The Node.js backend (in backEnd/api/mqtt/) subscribes to telemetry topics and stores state in MongoDB.
The /streamtelemetry/:robotId endpoint provides real-time Server-Sent Events (SSE) for dashboards.
Supports both live monitoring and historical playback.

🧠 Summary

Camera captures live water surface feed → YOLOv5s detects floating trash → MQTT broker relays detection and telemetry data → Navigation module computes steering → Pixhawk 4 executes motor control via PWM/ESC → Backend logs telemetry and streams data live.

🧩 Key Features

• Custom YOLOv5s trained for marine debris
• Fully headless inference on Raspberry Pi 5
• Real-time MQTT communication between ML, navigation, and backend
• Telemetry feedback loop from Pixhawk sensors
• Seamless integration with MongoDB + SSE dashboard

⚡ Future Work

• Deploy model optimization (ONNX / TensorRT) for faster inference
• Add adaptive thresholding for low-light detection
• Implement multi-camera stitching for wider FOV
• Integrate cloud dashboard for remote mission monitoring
