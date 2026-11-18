#!/bin/sh
# YT01 hook: render frames in 4 parallel chunks, then encode with the final audio mix (adapted from r05-curing/build.sh).
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
mkdir -p frames out
TOTAL=$(python3 -c "import json;print(json.load(open('timing.json'))['total'])")
python3 -c "
t=$TOTAL; n=4
for i in range(n): print(f'{t*i/n:.4f} {t*(i+1)/n:.4f}')" > frames/_chunks
while read a b; do node render.mjs --from $a --to $b & done < frames/_chunks
wait
ffmpeg -y -loglevel error -framerate 30 -i frames/f%05d.png -i audio/final_mix.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/YT01_hook_code_v1.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt -of compact out/YT01_hook_code_v1.mp4
