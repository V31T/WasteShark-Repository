# Ultralytics 🚀 AGPL-3.0 License - https://ultralytics.com/license
"""
YOLOv5 detect.py tuned for Raspberry Pi USB camera
- Defaults to webcam 0
- Uses V4L2 backend on Linux
- Headless-safe: QT_QPA_PLATFORM=offscreen
- Optional --allow-fallback to use a sample image if the camera isn't available
"""

import argparse
import csv
import os
import platform
import sys
from pathlib import Path

import torch

# Headless Qt (avoid "xcb" plugin errors on Pi)
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
# Prefer V4L2 for OpenCV on Linux (best with USB cams)
os.environ.setdefault("OPENCV_VIDEOIO_PRIORITY_V4L2", "1")

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
    cv2,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.torch_utils import select_device, smart_inference_mode


def ensure_webcam_available(index: int, allow_fallback: bool, root_path: Path) -> str:
    """
    Ensure the webcam device opens. If not and allow_fallback is False, raise.
    If allow_fallback is True, return a valid sample image path.
    """
    backend = cv2.CAP_V4L2 if platform.system() == "Linux" else 0
    cap = cv2.VideoCapture(index, backend)
    if cap.isOpened():
        # Try a couple of practical defaults for many USB cams
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.release()
        return str(index)

    cap.release()
    if allow_fallback:
        LOGGER.warning(f"Webcam '{index}' not available, falling back to sample image.")
        return str(root_path / "data/images/bus.jpg")
    else:
        raise RuntimeError(
            f"Webcam '{index}' could not be opened. "
            f"Check that it appears as /dev/video0 and that your user is in the 'video' group."
        )


@smart_inference_mode()
def run(
    weights=ROOT / "yolov5n.pt",      # light model for Pi tests
    source="0",                       # default: USB camera (video0)
    data=ROOT / "data/coco128.yaml",
    imgsz=(640, 640),
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=1000,
    device="",
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
    half=False,
    dnn=False,
    vid_stride=1,
    allow_fallback=False,            # NEW: only use fallback if you ask for it
):
    # Resolve the source for camera testing
    s = str(source)
    if s.isnumeric():  # webcam index
        s = ensure_webcam_available(int(s), allow_fallback, ROOT)

    save_img = not nosave and not s.endswith(".txt")
    is_file = Path(s).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    is_url = s.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    webcam = s.isnumeric() or s.endswith(".streams") or (is_url and not is_file)
    screenshot = s.lower().startswith("screen")
    if is_url and is_file:
        s = check_file(s)  # download

    # Output directory
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)

    # Model
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)

    # Data loader
    bs = 1
    try:
        if webcam:
            view_img = check_imshow(warn=True)
            # LoadStreams will use OpenCV and should honor the V4L2 backend we set
            dataset = LoadStreams(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            bs = len(dataset)
            # Trigger a read to validate pipeline early
            _ = next(iter(dataset))
        elif screenshot:
            dataset = LoadScreenshots(s, img_size=imgsz, stride=stride, auto=pt)
        else:
            dataset = LoadImages(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            if not getattr(dataset, "files", []):
                raise RuntimeError(f"No input files found for source: {s}")
    except Exception as e:
        if allow_fallback:
            LOGGER.warning(f"Primary dataloader failed for source '{s}' ({e}). Using sample image instead.")
            s = str(ROOT / "data/images/bus.jpg")
            dataset = LoadImages(s, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
            webcam = False
        else:
            raise

    vid_path, vid_writer = [None] * bs, [None] * bs

    # Warmup & profiling
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))

    # Inference loop
    for path, im, im0s, vid_cap, s_log in dataset:
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)
            im = im.half() if model.fp16 else im.float()
            im /= 255.0
            if len(im.shape) == 3:
                im = im[None]

        with dt[1]:
            vis_dir = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            pred = model(im, augment=augment, visualize=vis_dir)

        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        csv_path = save_dir / "predictions.csv"

        def write_to_csv(image_name, prediction, confidence):
            row = {"Image Name": image_name, "Prediction": prediction, "Confidence": confidence}
            file_exists = os.path.isfile(csv_path)
            with open(csv_path, "a", newline="") as f:
                w = csv.DictWriter(f, fieldnames=row.keys())
                if not file_exists:
                    w.writeheader()
                w.writerow(row)

        for i, det in enumerate(pred):
            seen += 1
            if webcam:
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s_log += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)
            save_path = str(save_dir / p.name)
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")
            s_log += "{:g}x{:g} ".format(*im.shape[2:])
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]
            imc = im0.copy() if save_crop else im0
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))

            if len(det):
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()
                    s_log += f"{n} {names[int(c)]}{'s' * (n > 1)}, "

                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)
                    conf_f = float(conf)
                    if save_csv:
                        write_to_csv(p.name, names[c], f"{conf_f:.2f}")

                    if save_txt:
                        if save_format == 0:
                            coords = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                        else:
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                    if not hide_labels or not hide_conf or save_img:
                        label = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {conf_f:.2f}")
                        annotator.box_label(xyxy, label, color=colors(c, True))

                    if save_crop:
                        save_one_box(xyxy, imc, file=save_dir / "crops" / names[c] / f"{p.stem}.jpg", BGR=True)

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

        LOGGER.info(f"{s_log}{'' if len(det) else '(no detections), '}{dt[1].dt * 1e3:.1f}ms")

    t = tuple(x.t / max(seen, 1) * 1e3 for x in dt)
    LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    if update:
        strip_optimizer(weights if isinstance(weights, (list, tuple)) else [weights])


def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, default=ROOT / "yolov5n.pt", help="model path or triton URL")
    parser.add_argument("--source", type=str, default="0", help="file/dir/URL/glob/screen/0(webcam)")
    parser.add_argument("--data", type=str, default=ROOT / "data/coco128.yaml", help="(optional) dataset.yaml path")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640], help="inference size h,w")
    parser.add_argument("--conf-thres", type=float, default=0.25, help="confidence threshold")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--max-det", type=int, default=1000, help="maximum detections per image")
    parser.add_argument("--device", default="", help="cuda device, i.e. 0 or 0,1,2,3 or cpu")
    parser.add_argument("--view-img", action="store_true", help="show results")
    parser.add_argument("--save-txt", action="store_true", help="save results to *.txt")
    parser.add_argument("--save-format", type=int, default=0, help="YOLO(0) or Pascal-VOC(1) when save-txt is True")
    parser.add_argument("--save-csv", action="store_true", help="save results in CSV format")
    parser.add_argument("--save-conf", action="store_true", help="save confidences in --save-txt labels")
    parser.add_argument("--save-crop", action="store_true", help="save cropped prediction boxes")
    parser.add_argument("--nosave", action="store_true", help="do not save images/videos")
    parser.add_argument("--classes", nargs="+", type=int, help="filter by class: --classes 0 2 3")
    parser.add_argument("--agnostic-nms", action="store_true", help="class-agnostic NMS")
    parser.add_argument("--augment", action="store_true", help="augmented inference")
    parser.add_argument("--visualize", action="store_true", help="visualize features")
    parser.add_argument("--update", action="store_true", help="update all models")
    parser.add_argument("--project", default=ROOT / "runs/detect", help="save results to project/name")
    parser.add_argument("--name", default="exp", help="save results to project/name")
    parser.add_argument("--exist-ok", action="store_true", help="existing project/name ok, do not increment")
    parser.add_argument("--line-thickness", default=3, type=int, help="bounding box thickness (pixels)")
    parser.add_argument("--hide-labels", default=False, action="store_true", help="hide labels")
    parser.add_argument("--hide-conf", default=False, action="store_true", help="hide confidences")
    parser.add_argument("--half", action="store_true", help="use FP16 half-precision inference")
    parser.add_argument("--dnn", action="store_true", help="use OpenCV DNN for ONNX inference")
    parser.add_argument("--vid-stride", type=int, default=1, help="video frame-rate stride")
    parser.add_argument("--allow-fallback", action="store_true", help="if webcam fails, use sample image")
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1
    print_args(vars(opt))
    return opt


def main(opt):
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))
    run(**vars(opt))


if __name__ == "__main__":
    opt = parse_opt()
    main(opt)
