#!/usr/bin/env bash
# BNB editorial build: gen -> check -> render -> mux final mix -> delivery encode -> contact sheet.
# usage: bash build.sh [project_dir] [--draft] [--skip-render]
#   --draft        fast x264 preset + draft HyperFrames quality (for smoke tests / reviews)
#   --skip-render  reuse renders/<slug>_raw.mp4 (only re-mux, re-encode, re-sheet)
# Outputs (project/out/):  <slug>_master.mp4   CRF 17 x264 High, AAC 192k 48 kHz (archive / YouTube upload)
#                          <slug>_<ig|yt>.mp4  delivery encode CRF 20, maxrate 12M (the grain makes masters huge)
#                          <slug>_contact.png  12 evenly spaced frames, 6x2
set -euo pipefail
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 PATH="/root/.local/bin:$PATH"
DIR="."; DRAFT=0; SKIP=0
for a in "$@"; do case "$a" in --draft) DRAFT=1;; --skip-render) SKIP=1;; *) DIR="$a";; esac; done
cd "$DIR"
HF="npx --yes hyperframes@0.9.58"
ffv=$(ffmpeg -version | head -1 | sed -E 's/^ffmpeg version n?([0-9]+).*/\1/')
[[ "$ffv" =~ ^[0-9]+$ && "$ffv" -ge 7 ]] || { echo "build.sh: need ffmpeg >= 7 on PATH (got: $(ffmpeg -version | head -1))"; exit 1; }
SLUG=$(python3 -c "import json;print(json.load(open('project.json'))['slug'])")
FMT=$(python3 -c "import json;print(json.load(open('project.json')).get('format','9:16'))")
TOTAL=$(python3 -c "import json;print(json.load(open('timing.json'))['total'])")
mkdir -p renders out
echo "== gen";   python3 tools/gen.py
echo "== check"
$HF check --json > renders/check.json 2>/dev/null || true
ERR=$(python3 -c "import json,sys
d=json.load(open('renders/check.json'))
def walk(x):
    n=0
    if isinstance(x,dict):
        if x.get('severity')=='error' or x.get('level')=='error': n+=1
        for v in x.values(): n+=walk(v)
    elif isinstance(x,list):
        for v in x: n+=walk(v)
    return n
e=d.get('errorCount', d.get('errors') if isinstance(d.get('errors'),int) else None)
print(e if isinstance(e,int) else walk(d))" 2>/dev/null || echo "?")
echo "check errors: $ERR"
if [ "$ERR" != "0" ]; then $HF check || true; echo "build.sh: fix check errors first (see renders/check.json)"; exit 1; fi
RAW="renders/${SLUG}_raw.mp4"
if [ "$SKIP" = 0 ]; then
  echo "== render ($( [ $DRAFT = 1 ] && echo draft || echo looks ))"
  t0=$(date +%s)
  $HF render --quiet --output "$RAW" $( [ $DRAFT = 1 ] && echo "--quality draft" ) .
  echo "render: $(( $(date +%s) - t0 )) s"
fi
AUDIO=assets/audio/final_mix.wav; [ -f "$AUDIO" ] || AUDIO=assets/audio/narration.wav
PRESET=slow; [ $DRAFT = 1 ] && PRESET=veryfast
echo "== mux ($AUDIO)"
ffmpeg -y -loglevel error -i "$RAW" -i "$AUDIO" -map 0:v:0 -map 1:a:0 -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 17 -preset $PRESET -r 30 \
  -c:a aac -b:a 192k -ar 48000 -t "$TOTAL" -movflags +faststart "out/${SLUG}_master.mp4"
TAG=ig; [ "$FMT" = "16:9" ] && TAG=yt
echo "== delivery encode ($TAG)"
ffmpeg -y -loglevel error -i "out/${SLUG}_master.mp4" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -maxrate 12M -bufsize 24M -preset $PRESET \
  -c:a copy -movflags +faststart "out/${SLUG}_${TAG}.mp4"
echo "== contact sheet"
if [ "$FMT" = "16:9" ]; then SC="480:270"; TILE=4x3; else SC="270:480"; TILE=6x2; fi
ffmpeg -y -loglevel error -i "out/${SLUG}_master.mp4" -vf "fps=12/${TOTAL},scale=${SC},tile=${TILE}:padding=6:color=0x06162a" -frames:v 1 "out/${SLUG}_contact.png"
for f in "out/${SLUG}_master.mp4" "out/${SLUG}_${TAG}.mp4"; do
  printf "%s  %s  %s\n" "$f" "$(du -h "$f" | cut -f1)" "$(ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of csv=p=0 "$f" | tr '\n' ' ')"
done
ffmpeg -hide_banner -nostats -i "out/${SLUG}_${TAG}.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' '
echo "out/${SLUG}_contact.png"
