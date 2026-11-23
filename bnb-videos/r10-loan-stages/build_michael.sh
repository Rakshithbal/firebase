#!/bin/sh
# am_michael + BNB logo version. Frames -> frames_michael/, audio from audio_michael/final_mix.wav (audio/make_audio_michael.py).
# usage: sh build_michael.sh <OUT_NAME>   e.g. R10_loan_stages_michael
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) PATH=/root/.local/bin:$PATH TIMING=timing_michael.json BRAND=1 FRAMES=frames_michael
mkdir -p frames_michael out
find frames_michael -name 'f*.png' -delete
TOTAL=$(python3 -c "import json;print(json.load(open('timing_michael.json'))['total'])")
python3 -c "
import sys; t=float(sys.argv[1]); n=3
for i in range(n): print(f'{t*i/n:.4f} {t*(i+1)/n:.4f}')" "$TOTAL" > frames_michael/chunks.txt
while read a b; do node render.mjs --from $a --to $b & done < frames_michael/chunks.txt
wait
ffmpeg -y -loglevel error -framerate 30 -i frames_michael/f%05d.png -i audio_michael/final_mix.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/$1.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt -of compact out/$1.mp4
