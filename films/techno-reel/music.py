#!/usr/bin/env python3
"""Synthesise the reel's soundtrack in code (no samples, nothing to license) and mix in the voiceover.

Timeline (seconds), matching the script:
  0.0-2.0  silence, one hard kick at 1.8 (hook)
  2.0-5.0  muffled "commercial club" pop loop
  5.0      bass drops in full: 128 BPM techno
  14-19    filtered breakdown (no kick)
  19-24    riser
  24       drop again
  END      the track cuts dead on the beat

  python3 music.py VO.mp3 OUT.wav
"""
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 128.0
BEAT = 60.0 / BPM
DROP1 = 5.0
BREAK_T = 14.0
RISE_T = 19.0
DROP2 = 24.0
END = DROP1 + 58 * BEAT          # 32.1875 s: lands exactly on a beat
TOTAL = END + 0.8                # a beat of silence after the cut

rng = np.random.default_rng(7)
N = int(TOTAL * SR)


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, f, order=4):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


def saw(f, t):
    return 2.0 * ((f * t) % 1.0) - 1.0


# ---------- instruments
def kick(hard=1.0):
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.35
    return np.tanh((body + click) * 1.6 * hard)


def hat(open_=False):
    t = t_arr(0.25 if open_ else 0.06)
    n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.35


def clap():
    t = t_arr(0.3)
    n = bp(rng.standard_normal(len(t)), 900, 3000)
    env = np.exp(-t * 18)
    for d in (0.0, 0.012, 0.024):
        env += np.where(t > d, np.exp(-(t - d) * 120), 0) * 0.6
    return n * env * 0.4


def bass_note(f, dur=BEAT * 0.45):
    t = t_arr(dur)
    s = saw(f, t) * 0.6 + np.sin(2 * np.pi * f * t) * 0.6
    s = lp(s, 380)
    env = np.minimum(1, t * 200) * np.exp(-t * 7)
    return s * env


def stab(freqs, dur=0.22, cutoff=1800):
    t = t_arr(dur)
    s = sum(saw(f, t) + saw(f * 1.006, t) for f in freqs) / (2 * len(freqs))
    s = lp(s, cutoff, 2)
    return s * np.exp(-t * 11)


def pluck(freqs, dur=0.5):  # bright "pop" chord
    t = t_arr(dur)
    s = sum(np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) for f in freqs) / len(freqs)
    return s * np.exp(-t * 4) * 0.5


def note(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------- arrangement
drums = np.zeros(N)
bass = np.zeros(N)
synth = np.zeros(N)
pad = np.zeros(N)
fx = np.zeros(N)
pop = np.zeros(N)

# hook: one hard kick
place(drums, kick(1.4), 1.8, 1.0)

# 2-5 s: muffled commercial pop (C G Am F at ~110 bpm), lowpassed hard later
pb = 60 / 110
chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
k = 0
tt = 2.0
while tt < DROP1 - 0.05:
    place(pop, pluck([note(n + 12) for n in chords[(k // 2) % 4]]), tt, 0.7)
    place(pop, kick(0.6), tt, 0.5)
    tt += pb
    k += 1
pop = lp(pop, 450, 2) * 0.55

# techno sections
beat_times = [DROP1 + i * BEAT for i in range(int((END - DROP1) / BEAT) + 1)]
riff = [45, 45, 57, 45, 48, 45, 52, 43]  # A1 minor-ish offbeat bassline
for bi, bt in enumerate(beat_times):
    if bt >= END - 1e-6:
        break
    in_break = BREAK_T <= bt < DROP2
    if not in_break:
        place(drums, kick(), bt)
        place(drums, hat(), bt + BEAT / 2)
        if bi % 2 == 1:
            place(drums, clap(), bt, 0.8)
        if bi % 4 == 3:
            place(drums, hat(True), bt + BEAT / 2, 0.6)
    place(bass, bass_note(note(riff[bi % 8])), bt + BEAT / 2, 0.9 if not in_break else 0.5)
    if bi % 2 == 0:
        place(synth, stab([note(69), note(72), note(76)]), bt + BEAT * 0.75, 0.35)
    # 16th hats in the second drop
    if bt >= DROP2:
        place(drums, hat(), bt + BEAT / 4, 0.4)
        place(drums, hat(), bt + 3 * BEAT / 4, 0.4)

# pad under breakdown and riser
t = np.arange(N) / SR
padsig = sum(saw(note(n), t) + saw(note(n) * 1.004, t) for n in (57, 60, 64, 69)) / 8
pad_env = np.clip((t - BREAK_T + 0.5) / 1.5, 0, 1) * np.clip((DROP2 + 0.3 - t) / 0.3, 0, 1)
pad = lp(padsig, 900, 2) * pad_env * 0.55

# riser: noise sweep + rising sine, 19 -> 24
rt = t_arr(DROP2 - RISE_T)
prog = rt / rt[-1]
noise = rng.standard_normal(len(rt))
sweep = np.zeros(len(rt))
for a in range(0, len(rt), 2048):  # block-wise rising bandpass
    c = 400 + 7000 * prog[a] ** 2
    seg = noise[a:a + 4096]
    sweep[a:a + 2048] = bp(seg, c * 0.7, min(c * 1.3, 20000))[:2048][: len(sweep[a:a + 2048])]
rise = sweep * prog ** 1.5 * 0.5 + np.sin(2 * np.pi * np.cumsum(200 + 800 * prog ** 2) / SR) * prog ** 2 * 0.15
place(fx, rise, RISE_T)
# snare roll in the last 2 s of the riser
for i in range(32):
    tt = DROP2 - 2.0 + i * (2.0 / 32)
    place(fx, clap(), tt, 0.15 + 0.5 * i / 32)
# impact on each drop
for d in (DROP1, DROP2):
    imp_t = t_arr(1.5)
    place(fx, lp(rng.standard_normal(len(imp_t)), 3000) * np.exp(-imp_t * 3) * 0.4, d)

# breakdown filter on the beat-driven parts (14-19 muffled, opening through the riser)
def filtered_section(x):
    y = x.copy()
    a, b = int(BREAK_T * SR), int(DROP2 * SR)
    muff = lp(x, 350, 2)
    opening = lp(x, 1400, 2)
    w = np.clip((t[a:b] - RISE_T) / (DROP2 - RISE_T), 0, 1)  # 0 in break, ->1 at drop
    y[a:b] = muff[a:b] * (1 - w) + opening[a:b] * w
    return y


bass = filtered_section(bass)
synth = filtered_section(synth)

# sidechain: duck bass, synth and pad on every kick
duck = np.ones(N)
for bt in beat_times:
    if (bt < BREAK_T or bt >= DROP2) and bt < END:
        i = int(bt * SR)
        L = int(0.25 * SR)
        j = min(N, i + L)
        duck[i:j] = np.minimum(duck[i:j], 0.35 + 0.65 * (np.arange(j - i) / L))

music = drums * 0.9 + (bass * 0.9 + synth + pad) * duck + fx + pop
# the track cuts dead on the beat
music[int(END * SR):] = 0
music[: int(1.75 * SR)] *= 0  # true silence before the first kick

# ---------- voiceover: three lines from one ElevenLabs take, placed on the script's slots
vo_path, out_path = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", vo_path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
vo_src = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
cuts = [(0.0, 7.60, 7.05), (8.60, 12.95, 19.30), (14.05, 16.20, 29.35)]  # (src start, src end, place at)
vo = np.zeros(N)
vo_env = np.zeros(N)
for s, e, at in cuts:
    seg = vo_src[int(s * SR):int(e * SR)]
    fade = int(0.02 * SR)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    place(vo, seg, at)
    i, j = int((at - 0.15) * SR), int((at + (e - s) + 0.25) * SR)
    vo_env[i:j] = 1
vo_env = lp(vo_env, 6, 1)
vo = hp(vo, 90) * 1.0
mix = music * (1 - 0.55 * vo_env) + vo * 1.25

mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
stereo = np.stack([mix, mix], axis=1).astype(np.float32)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", "48000", out_path],
               input=stereo.tobytes(), check=True)
print(f"wrote {out_path}  {TOTAL:.2f}s  (cut at {END:.3f}s)")
