#!/bin/sh
# Engineer's-notebook reel build: page events -> audio mix -> 3 parallel JPG render chunks -> H.264/AAC -> delete frames -> contact sheet.
# usage: sh tools/notebook/build.sh <reel_dir> <OUT_NAME> <key G|C>     e.g. sh tools/notebook/build.sh r08-written-quote R08_written_quote_michael G
# (voice first: python3 tools/make_vo_voice.py <reel>/lines.json <reel>/audio <reel>/timing.json --voice am_michael --speed 1.0)
set -e
cd "$(dirname "$0")/../.."
R=$1; OUT=$2; KEY=${3:-G}
export NODE_PATH=$(npm root -g) PATH=/root/.local/bin:$PATH
FFMPEG="ffmpeg -nostdin -hide_banner"
node tools/notebook/render.mjs $R --ev $R/ev.json
/root/lemo-opuscar/.venv/bin/python tools/notebook/make_audio.py $R $KEY
rm -rf $R/frames_michael; mkdir -p $R/frames_michael $R/out
TOTAL=$(python3 -c "import json;print(json.load(open('$R/timing.json'))['total'])")
python3 -c "
import sys; t=float(sys.argv[1]); n=3
for i in range(n): print(f'{t*i/n:.4f} {t*(i+1)/n:.4f}')" "$TOTAL" > $R/chunks.txt
while read a b; do node tools/notebook/render.mjs $R --from $a --to $b --frames frames_michael & done < $R/chunks.txt
wait; rm -f $R/chunks.txt
$FFMPEG -y -loglevel error -framerate 30 -i $R/frames_michael/f%05d.jpg -i $R/audio/final_mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $R/out/$OUT.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt -of compact $R/out/$OUT.mp4
rm -rf $R/frames_michael
# contact sheet: 12 evenly spaced frames from the encode
$FFMPEG -y -loglevel error -i $R/out/$OUT.mp4 -vf "fps=12/$TOTAL,scale=270:-1,tile=6x2:padding=6:color=0x222222" -frames:v 1 -q:v 3 $R/out/${OUT%_michael}_contact.jpg
$FFMPEG -i $R/out/$OUT.mp4 -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
