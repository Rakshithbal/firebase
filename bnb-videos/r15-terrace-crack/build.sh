#!/bin/sh
# Render all frames in 4 parallel chunks, then encode with the final audio mix.
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
rm -rf frames && mkdir -p frames out
TOTAL=$(python3 -c "import json;print(json.load(open('timing.json'))['total'])")
python3 - "$TOTAL" <<'PY' > /tmp/r15_chunks
import sys; t=float(sys.argv[1]); n=4
for i in range(n): print(f"{t*i/n:.4f} {t*(i+1)/n:.4f}")
PY
while read a b; do node render.mjs --from $a --to $b & done < /tmp/r15_chunks
wait
AUDIO=audio/final_mix.wav; [ -f "$AUDIO" ] || AUDIO=audio/narration.wav
/root/.local/bin/ffmpeg -y -loglevel error -framerate 30 -i frames/f%05d.png -i "$AUDIO" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/R15_terrace_crack_v1.mp4
/root/.local/bin/ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact out/R15_terrace_crack_v1.mp4
