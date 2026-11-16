#!/usr/bin/env python3
"""Kokoro TTS for tts_say.py --cmd: reads one take (one line per paragraph) and writes a WAV,
with a clear pause between lines so split_takes.py can cut them apart.

  python3 kokoro_say.py --model DIR --voice am_michael --speed 1.0 {txt} {out}

Model files (kokoro-v1.0.onnx, voices-v1.0.bin) come from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
"""
import argparse
import pathlib

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--voice", default="am_michael")
ap.add_argument("--speed", type=float, default=1.0)
ap.add_argument("--gap", type=float, default=0.75, help="seconds of silence between lines")
ap.add_argument("txt")
ap.add_argument("out")
a = ap.parse_args()

m = pathlib.Path(a.model)
tts = Kokoro(str(m / "kokoro-v1.0.onnx"), str(m / "voices-v1.0.bin"))
text = pathlib.Path(a.txt).read_text()
lines = [p.strip().replace("\n", " ") for p in text.split("\n\n") if p.strip()]
if len(lines) == 1 and "\n" in text.strip():
    lines = [l.strip() for l in text.splitlines() if l.strip()]

parts, sr = [], 24000
for line in lines:
    audio, sr = tts.create(line, voice=a.voice, speed=a.speed, lang="en-us")
    parts += [audio, np.zeros(int(sr * a.gap), dtype=audio.dtype)]
sf.write(a.out, np.concatenate(parts[:-1]), sr)
