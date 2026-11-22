#!/bin/sh
# usage: finish.sh <sample_dir> <NN_slug>   -> ../out/<NN_slug>.mp4 (+ _contact.png), two-pass loudnorm -14 LUFS / TP <= -1.5
set -e
export PATH=/root/.local/bin:$PATH
D=$1; NAME=$2; OUT=$(cd "$D/.." && pwd)/out; mkdir -p "$OUT"
V=$D/out/video.mp4; A=$D/audio/mix.wav
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-2.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -y -loglevel error -i "$V" -i "$A" -map 0:v -map 1:a -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -profile:v high -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-14:TP=-2.0:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest "$OUT/$NAME.mp4"
ffmpeg -hide_banner -nostats -i "$OUT/$NAME.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:"
ffmpeg -y -loglevel error -i "$OUT/$NAME.mp4" -vf "select='eq(n\,15)+eq(n\,60)+eq(n\,120)+eq(n\,180)+eq(n\,240)+eq(n\,290)',scale=360:640,tile=6x1:padding=6:color=0x222222" -frames:v 1 -fps_mode vfr "$OUT/${NAME}_contact.png"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,pix_fmt,r_frame_rate -of compact "$OUT/$NAME.mp4"
