import argparse
import os
import time
import torch
import yaml
import random
import numpy as np
from pathlib import Path
from copy import deepcopy
from tqdm import tqdm
from models.yolo import Model
from models.experimental import attempt_load
from utils.dataloaders import create_dataloader
from utils.general import (
    LOGGER,
    check_dataset,
    check_img_size,
    increment_path,
    colorstr,
    one_cycle,
    strip_optimizer,
)
from utils.loss import ComputeLoss
from utils.metrics import fitness
from utils.plots import plot_evolve
from utils.torch_utils import (
    ModelEMA,
    select_device,
    de_parallel,
)

def train(opt):
    save_dir = Path(opt.project) / opt.name
    save_dir = increment_path(save_dir, exist_ok=opt.exist_ok)
    save_dir.mkdir(parents=True, exist_ok=True)
    last, best = save_dir / "last.pt", save_dir / "best.pt"
    device = select_device(opt.device)

    with open(opt.hyp, errors="ignore") as f:
        hyp = yaml.safe_load(f)

    data_dict = check_dataset(opt.data)
    train_path, val_path = data_dict["train"], data_dict["val"]
    nc = int(data_dict["nc"])
    names = data_dict["names"]

    pretrained = opt.weights.endswith(".pt")
    if pretrained:
        ckpt = torch.load(opt.weights, map_location="cpu")
        model = Model(opt.cfg or ckpt["model"].yaml, ch=3, nc=nc).to(device)
        state_dict = ckpt["model"].float().state_dict()
        model_state_dict = model.state_dict()
        filtered_state_dict = {
            k: v for k, v in state_dict.items()
            if k in model_state_dict and v.shape == model_state_dict[k].shape
        }
        missing, unexpected = model.load_state_dict(filtered_state_dict, strict=False)
        LOGGER.info(f"Loaded pretrained weights from {opt.weights}. Skipped {len(model_state_dict) - len(filtered_state_dict)} incompatible layers.")
    else:
        model = Model(opt.cfg, ch=3, nc=nc).to(device)

    ema = ModelEMA(model)
    gs = max(int(model.stride.max()), 32)
    imgsz = check_img_size(opt.imgsz, gs)
    train_loader, dataset = create_dataloader(
        train_path, imgsz, opt.batch_size, gs, single_cls=False, hyp=hyp, rank=-1, workers=opt.workers
    )

    optimizer = torch.optim.SGD(
        model.parameters(),
        lr=hyp["lr0"],
        momentum=hyp["momentum"],
        weight_decay=hyp["weight_decay"]
    )
    lf = one_cycle(1, hyp["lrf"], opt.epochs)
    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda=lf)
    model.hyp = hyp
    compute_loss = ComputeLoss(model)

    nb = len(train_loader)
    best_fitness = 0.0
    for epoch in range(opt.epochs):
        model.train()
        mloss = torch.zeros(3, device=device)
        pbar = tqdm(enumerate(train_loader), total=nb, bar_format="{l_bar}{bar:10}{r_bar}{bar:-10b}")
        for i, (imgs, targets, paths, _) in pbar:
            imgs = imgs.to(device).float() / 255.0
            targets = targets.to(device)
            pred = model(imgs)
            loss, loss_items = compute_loss(pred, targets)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            ema.update(model)
            mloss = (mloss * i + loss_items) / (i + 1)
            pbar.set_description(f"Epoch [{epoch+1}/{opt.epochs}] Loss: {mloss.sum():.4f}")
        scheduler.step()
        LOGGER.info(f"Epoch {epoch+1} complete. Avg loss: {mloss.sum():.4f}")
        ckpt = {"model": deepcopy(de_parallel(model)).half(), "ema": deepcopy(ema.ema).half()}
        torch.save(ckpt, last)
        if mloss.sum() < best_fitness or epoch == 0:
            best_fitness = mloss.sum()
            torch.save(ckpt, best)
    strip_optimizer(best)
    LOGGER.info(f"Training done. Best model saved to {best}")

def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="data/data.yaml", help="dataset.yaml path")
    parser.add_argument("--cfg", type=str, default="models/yolov5s.yaml", help="model.yaml path")
    parser.add_argument("--weights", type=str, default="yolov5s.pt", help="initial weights path")
    parser.add_argument("--hyp", type=str, default="data/hyps/hyp.scratch-low.yaml", help="hyperparameters path")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--project", default="runs/train_custom")
    parser.add_argument("--name", default="exp")
    parser.add_argument("--exist-ok", action="store_true", help="overwrite existing results")
    return parser.parse_args()

if __name__ == "__main__":
    opt = parse_opt()
    train(opt)
