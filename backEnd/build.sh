#!/bin/sh

docker buildx build --platform linux/amd64,linux/arm64 -t firsttobebear/waste-shark-backend:latest --push .