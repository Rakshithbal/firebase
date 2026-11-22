#!/bin/sh
# mux.sh <sample_dir> <out_name> "<t1> <t2> ... t6"   -> out/<name>.mp4 + out/<name>_contact.png
set -e; export PATH=/root/.local/bin:$PATH; cd "$(dirname "$0")/.."
D=$1; O=out/$2
ffmpeg -y -loglevel error -framerate 30 -i $D/frames/f%05d.png -i $D/audio/final_mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -t 10 -movflags +faststart $O.mp4
FR=""; for t in $3; do FR="$FR $D/frames/f$(printf %05d $(python3 -c "print(round($t*30))")).png"; done
/root/lemo-opuscar/.venv/bin/python tools/tile.py ${O}_contact.png $FR
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt -of compact $O.mp4
ffmpeg -hide_banner -nostats -i $O.mp4 -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "I:|Peak:" | tr -s ' '
