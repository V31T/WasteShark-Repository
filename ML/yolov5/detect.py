#!/usr/bin/env python3
# Ultralytics YOLOv5 🚀 AGPL-3.0 License - https://ultralytics.com/license
"""
WasteShark - YOLOv5 detection (Raspberry Pi USB cam)
----------------------------------------------------
- Uses your custom weights: runs/train_custom/exp11/last.pt
- Prefers V4L2 backend for OpenCV on Linux (more reliable on Pi)
- Headless-safe (no GUI required)
- Optional --allow-fallback to use a sample image if the webcam can't be opened
"""

import argparse
import csv
import os
import platform
import sys
from pathlib import Path
import time

import torch

# --- Headless + V4L2 preferences (before importing cv2 through utils.general) ---
# Prevent Qt/X11 errors on headless systems
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
# Prefer V4L2 instead of GStreamer on Linux for USB UVC cams
os.environ.setdefault("OPENCV_VIDEOIO_PRIORITY_V4L2", "1")

# --- YOLOv5 repo paths ---
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # YOLOv5 root (this directory)
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # make path relative for logs

# --- YOLOv5 imports (match repo structure) ---
from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.plots import Annotator, colors, save_one_box
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    check_requirements,
    colorstr,
    cv2,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.torch_utils import select_device, smart_inference_mode


def _open_webcam_once(index: int) -> bool:
    """
    Try opening a V4L2 webcam and grab a single frame to verify the pipeline.
    Returns True if a valid frame is captured; otherwise False.
    """
    backend = cv2.CAP_V4L2 if platform.system() == "Linux" else 0
    cap = cv2.VideoCapture(index, backend)
    ok = False
    if cap.isOpened():
        # Set conservative defaults most UVC cams accept
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        # Warm up a few reads; some cams need 2–3 frames before giving non-None
        for _ in range(5):
            ret, frame = cap.read()
            if ret and frame is not None:
                ok = True
                break
            time.sleep(0.02)
    cap.release()
    return ok


def _resolve_source_for_webcam(s: str, allow_fallback: bool) -> str:
    """
    If the source is numeric (webcam index), verify it's producing frames.
    - If OK: return the same numeric string (e.g., "0")
    - If NOT OK and allow_fallback: return a sample image path
    - If NOT OK and no fallback: raise with an actionable message
    """
    if s.isnumeric():
        idx = int(s)
        if _open_webcam_once(idx):
            return s  # numeric index is valid
        if allow_fallback:
            LOGGER.warning(f"Webcam index {idx} not producing frames; falling back to sample image.")
            return str(ROOT / "data/images/bus.jpg")
        raise RuntimeError(
            f"Webcam index {idx} could not produce frames.\n"
            f"Tips:\n"
            f"  • Ensure the device exists (ls /dev/video*) and your user is in the 'video' group\n"
            f"  • Set a safe format: v4l2-ctl -d /dev/video{idx} --set-fmt-video=width=640,height=480,pixelformat=YUYV\n"
            f"  • Try: export OPENCV_VIDEOIO_PRIORITY_V4L2=1 and re-run"
        )
    return s


@smart_inference_mode()
def run(
    # --- Defaults tailored to your project ---
    weights=ROOT / "runs/train_custom/exp11/last.pt",  # custom weights (➡️ change here if needed)
    source="0",                                        # default to webcam index 0
    data=ROOT / "data/coco128.yaml",                   # class names/config (ok to keep coco128.yaml)
    imgsz=(640, 640),                                  # network input size
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=1000,
    device="",                                         # '' picks best; 'cpu' to force CPU
    view_img=False,
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
    half=False,                                        # FP16 off on CPU (safe)
    dnn=False,
    vid_stride=1,
    allow_fallback=False,                              # set True to auto-fallback to a sample image
):
    """
    Standard YOLOv5 detection loop with Raspberry Pi webcam robustness.
    """
    # --- Resolve & validate source (especially for webcams) ---
    s = _resolve_source_for_webcam(str(source), allow_fallback)

    # --- Output directory setup ---
    save_img = not nosave and not s.endswith(".txt")
    is_file = Path(s).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    is_url = s.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    webcam = s.isnumeric() or s.endswith(".streams") or (is_url and not is_file)
    screenshot = s.lower().startswith("screen")
    if is_url and is_file:
        s = check_file(s)  # download

    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)

    # --- Model load ---
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)

    # --- Data loaders (guard against empty streams) ---
    bs = 1
    try:
        if webcam:
            view_img = check_imshow(warn=True)
            dataset = LoadStreams(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            bs = len(dataset)
            # Trigger a read early to surface bad streams quickly
            _ = next(iter(dataset))
        elif screenshot:
            dataset = LoadScreenshots(s, img_size=imgsz, stride=stride, auto=pt)
        else:
            dataset = LoadImages(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            if not getattr(dataset, "files", []):
                raise RuntimeError(f"No input files found for source: {s}")
    except Exception as e:
        if allow_fallback:
            LOGGER.warning(f"Primary dataloader failed ({e}); using sample image instead.")
            s = str(ROOT / "data/images/bus.jpg")
            dataset = LoadImages(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            webcam = False
        else:
            raise

    vid_path, vid_writer = [None] * bs, [None] * bs

    # --- Warmup and timers ---
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))

    # --- CSV output helper (optional) ---
    csv_path = save_dir / "predictions.csv"

    def write_to_csv(image_name: str, label: str, confidence: float):
        row = {"Image Name": image_name, "Prediction": label, "Confidence": f"{confidence:.2f}"}
        exists = os.path.isfile(csv_path)
        with open(csv_path, "a", newline="") as f:
            w = csv.DictWriter(f, fieldnames=row.keys())
            if not exists:
                w.writeheader()
            w.writerow(row)

    # --- Inference loop ---
    for path, im, im0s, vid_cap, s_log in dataset:
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)
            im = im.half() if model.fp16 else im.float()  # uint8 → fp16/32
            im /= 255.0
            if len(im.shape) == 3:
                im = im[None]  # add batch dimension
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # --- Forward pass ---
        with dt[1]:
            vis_path = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            if model.xml and im.shape[0] > 1:
                pred = None
                for image in ims:
                    out = model(image, augment=augment, visualize=vis_path).unsqueeze(0)
                    pred = out if pred is None else torch.cat((pred, out), dim=0)
                pred = [pred, None]
            else:
                pred = model(im, augment=augment, visualize=vis_path)

        # --- NMS ---
        with dt[2]:
            pred = non_max_suppression(
                pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det
            )

        # --- Process predictions per image ---
        for i, det in enumerate(pred):
            seen += 1
            if webcam:
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s_log += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)
            save_path = str(save_dir / p.name)  # output image path
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")
            s_log += "{:g}x{:g} ".format(*im.shape[2:])
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain [w,h,w,h]
            imc = im0.copy() if save_crop else im0
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))

            if len(det):
                # Rescale boxes from model dims to original image
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                # Log class counts (nice for debugging)
                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()
                    s_log += f"{n} {names[int(c)]}{'s' * (n > 1)}, "

                # Draw boxes / save outputs
                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)
                    label_name = names[c]
                    conf_f = float(conf)

                    if save_txt:
                        # Save predictions to a YOLO or Pascal-VOC-like text file
                        if save_format == 0:
                            # YOLO normalized xywh
                            coords = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                        else:
                            # Absolute xyxy
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                    if save_csv:
                        write_to_csv(p.name, label_name, conf_f)

                    # Draw annotation
                    if save_img or save_crop or view_img:
                        disp = None if hide_labels else (label_name if hide_conf else f"{label_name} {conf_f:.2f}")
                        annotator.box_label(xyxy, disp, color=colors(c, True))

                    if save_crop:
                        save_one_box(xyxy, imc, file=save_dir / "crops" / label_name / f"{p.stem}.jpg", BGR=True)

            # Show or save frames
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux" and p not in windows:
                    windows.append(p)
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)

            if save_img:
                if dataset.mode == "image":
                    cv2.imwrite(save_path, im0)
                else:
                    # For video/stream, maintain a cv2.VideoWriter per index
                    if vid_path[i] != save_path:
                        vid_path[i] = save_path
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()
                        if vid_cap:  # video file
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:  # stream
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        save_path = str(Path(save_path).with_suffix(".mp4"))
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                    vid_writer[i].write(im0)

        # Per-iter timing (preprocess / inference / NMS)
        LOGGER.info(f"{s_log}{'' if len(det) else '(no detections), '}{dt[1].dt * 1e3:.1f}ms")

    # Summary timings
    t = tuple(x.t / max(seen, 1) * 1e3 for x in dt)
    LOGGER.info(f"Speed: {t[0]:.1f}ms pre-process, {t[1]:.1f}ms inference, {t[2]:.1f}ms NMS "
                f"per image at shape {(1, 3, *imgsz)}")

    # Final logs
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    if update:
        # If weights is a single Path, wrap for strip_optimizer
        strip_optimizer(weights if isinstance(weights, (list, tuple)) else [weights])


def parse_opt():
    """
    CLI argument parsing with safe defaults for the Pi.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, default=ROOT / "runs/train_custom/exp11/last.pt",
                        help="model path or triton URL")
    parser.add_argument("--source", type=str, default="0", help="file/dir/URL/glob/screen/0(webcam)")
    parser.add_argument("--data", type=str, default=ROOT / "data/coco128.yaml", help="dataset.yaml path (for class names)")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640],
                        help="inference size h,w")
    parser.add_argument("--conf-thres", type=float, default=0.25)
    parser.add_argument("--iou-thres", type=float, default=0.45)
    parser.add_argument("--max-det", type=int, default=1000)
    parser.add_argument("--device", default="", help="cuda device or 'cpu'")
    parser.add_argument("--view-img", action="store_true")
    parser.add_argument("--save-txt", action="store_true")
    parser.add_argument("--save-format", type=int, default=0,
                        help="0=YOLO (xywh normalized), 1=Pascal-VOC (xyxy abs)")
    parser.add_argument("--save-csv", action="store_true")
    parser.add_argument("--save-conf", action="store_true")
    parser.add_argument("--save-crop", action="store_true")
    parser.add_argument("--nosave", action="store_true")
    parser.add_argument("--classes", nargs="+", type=int)
    parser.add_argument("--agnostic-nms", action="store_true")
    parser.add_argument("--augment", action="store_true")
    parser.add_argument("--visualize", action="store_true")
    parser.add_argument("--update", action="store_true")
    parser.add_argument("--project", default=ROOT / "runs/detect")
    parser.add_argument("--name", default="exp")
    parser.add_argument("--exist-ok", action="store_true")
    parser.add_argument("--line-thickness", default=3, type=int)
    parser.add_argument("--hide-labels", default=False, action="store_true")
    parser.add_argument("--hide-conf", default=False, action="store_true")
    parser.add_argument("--half", action="store_true")
    parser.add_argument("--dnn", action="store_true")
    parser.add_argument("--vid-stride", type=int, default=1)
    parser.add_argument("--allow-fallback", action="store_true",
                        help="if webcam fails, fallback to sample image")
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # expand single number to (h,w)
    print_args(vars(opt))
    return opt


def main(opt):
    # If requirements.txt is missing, YOLOv5 logs a warning; safe to proceed on Pi
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))
    run(**vars(opt))


if __name__ == "__main__":
    opt = parse_opt()
    main(opt)
