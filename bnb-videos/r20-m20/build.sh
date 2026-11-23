#!/bin/sh
# Env: TIMING (default timing.json), AUDIO, OUT; e.g. michael: TIMING=timing_michael.json AUDIO=audio/michael_vo/final_mix.wav OUT=out/R20_m20_michael.mp4 ./build.sh
# Render all frames in 4 parallel chunks, then encode with the final audio mix.
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
export PATH="/root/.local/bin:$PATH"
rm -rf frames && mkdir -p frames out
export TIMING=${TIMING:-timing.json}
TOTAL=$(python3 -c "import json;print(json.load(open('$TIMING'))['total'])")
CHUNKS=$(mktemp)
python3 - "$TOTAL" <<'PY' > "$CHUNKS"
import sys; t=float(sys.argv[1]); n=4
for i in range(n): print(f"{t*i/n:.4f} {t*(i+1)/n:.4f}")
PY
while read a b; do node render.mjs --from $a --to $b & done < "$CHUNKS"
wait
rm -f "$CHUNKS"
AUDIO=${AUDIO:-audio/final_mix.wav}; [ -f "$AUDIO" ] || AUDIO=audio/narration.wav
OUT=${OUT:-out/R20_m20_v1.mp4}
ffmpeg -y -loglevel error -framerate 30 -i frames/f%05d.png -i "$AUDIO" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
