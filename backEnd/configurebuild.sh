#!/bin/sh

docker buildx create --name mbuilder --driver docker-container --use
docker buildx inspect --bootstrap    # starts it; enables QEMU emulation