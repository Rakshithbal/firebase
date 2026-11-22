#!/bin/sh
# contact6.sh <video.mp4> <out.png> t1 t2 t3 t4 t5 t6  -> 6 frames tiled (uses tile.py)
V=$1; O=$2; shift 2; D=$(mktemp -d); i=0
for t in "$@"; do i=$((i+1)); /root/.local/bin/ffmpeg -v error -y -ss $t -i "$V" -frames:v 1 $D/f$i.png; done
/root/lemo-opuscar/.venv/bin/python $(dirname $0)/tile.py "$O" $D/f*.png
