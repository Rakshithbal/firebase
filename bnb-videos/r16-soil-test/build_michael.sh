#!/bin/sh
# R16 build: 3 parallel Playwright chunks -> frames_michael/*.jpg -> out/R16_soil_test_michael.mp4 -> delete frames.
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) PATH=/root/.local/bin:$PATH FRAMES=frames_michael
mkdir -p frames_michael out
TOTAL=$(python3 -c "import json;print(json.load(open('timing_michael.json'))['total'])")
python3 -c "
import sys; t=float(sys.argv[1]); n=3
for i in range(n): print(f'{t*i/n:.4f} {t*(i+1)/n:.4f}')" "$TOTAL" > chunks.txt
while read a b; do node render.mjs --from $a --to $b & done < chunks.txt
wait
rm chunks.txt
ffmpeg -nostdin -y -loglevel error -framerate 30 -i frames_michael/f%05d.jpg -i audio_michael/final_mix.wav \
  -c:v libx264 -preset slow -crf 18 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/R16_soil_test_michael.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt -of compact out/R16_soil_test_michael.mp4
rm -r frames_michael
