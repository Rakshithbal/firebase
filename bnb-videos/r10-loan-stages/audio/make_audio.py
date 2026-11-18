#!/usr/bin/env python3
"""R10 "Loan Lens: construction loans pay in stages" -- original underscore, UI sfx and final mix (all synthesized, no samples).

Run:  /root/lemo-opuscar/.venv/bin/python audio/make_audio.py
Out:  audio/music.wav      music stem, stereo, at mix balance BEFORE ducking / master gain
      audio/sfx.wav        sfx stem, stereo, at mix balance before master gain
      audio/final_mix.wav  narration + ducked music + sfx, mastered to -14 LUFS, TP <= -1.5 dBTP, 48 kHz stereo, 41.93 s
Reads audio/narration.wav (mono 48 kHz, already on the timeline) -- never modified.
Uses Lemo-Opuscar core/audio (pluck.py physical-model strings, sampler.room reverb) when present; falls back to local synthesis.
"""
import os, sys, json, subprocess, re
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d, minimum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SR = 48000
DUR = 41.93
N = int(round(DUR * SR))  # 2012640
rng = np.random.default_rng(1010)

# ---------- optional Lemo-Opuscar helpers ----------
LEMO = '/root/lemo-opuscar/core/audio'
P = None; ROOM = None
if os.path.isdir(LEMO):
    sys.path.insert(0, LEMO)
    try:
        import pluck as P
    except Exception as e:
        print('pluck.py unavailable, using local pluck:', e); P = None
    try:
        from sampler import room as ROOM
    except Exception as e:
        print('sampler.room unavailable, using local reverb:', e); ROOM = None


# ---------- small DSP helpers ----------
def t_(d): return np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(round(d * SR)))
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)


def norm(x, p=1.0):
    m = np.abs(x).max(); return x * (p / m) if m > 0 else x


def fade_edges(x, a=.002, r=.01):
    na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x


def add(buf, x, at, gain=1.0, pan=0.0):
    """mono x into stereo buf at time `at` (s), constant-power pan -1..1"""
    s = int(round(at * SR))
    if s >= len(buf) or s + len(x) <= 0: return
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x)); l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[s:e, 0] += x[:e - s] * gain * l * 1.4142; buf[s:e, 1] += x[:e - s] * gain * r * 1.4142


def reverb(st, size=.5, mix=.25, predelay=.02, damp=.5, seed=3):
    if ROOM is not None:
        return ROOM(st, size=size, mix=mix, predelay=predelay, damp=damp, seed_=seed).astype(np.float64)
    rt = .4 + 3.0 * size; n = int(rt * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed); out = np.zeros_like(st)
    for c in range(2):
        ir = lp(r.standard_normal(n), 9000 * (1 - .75 * damp) + 1500, 1) * np.exp(-6.9 * t / rt)
        ir = np.concatenate([np.zeros(int(predelay * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = fftconvolve(st[:, c], ir)[:len(st)] * .5
    return st * (1 - mix) + out * mix * 2.2


# =====================================================================
# 1. MUSIC -- D major, 86.5 BPM, bar = 24.97/9 s so the "solution" lift lands exactly on bar 9
# =====================================================================
BAR = 23.98 / 9            # 2.6644 s  (= 90.1 BPM, 4/4); bar 9 (the lift) lands on L06 "Before you sign"
BEAT = BAR / 4
def T(bar, beat=0.0): return bar * BAR + beat * BEAT


def felt_piano(m, dur, vel=.6, bright=1.0):
    """Felt/soft piano: inharmonic additive partials, 3-string detune, two-stage decay, soft felt hammer, low cutoff."""
    f0 = hz(m); tail = 1.8; n = int((dur + tail) * SR); t = np.arange(n) / SR
    B = 0.00012 * (f0 / 260) ** 1.2
    T0 = 4.0 * (260 / f0) ** .55
    y = np.zeros(n)
    for k in range(1, 16):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        ak = (1 / k ** 1.35) * np.exp(-(k - 1) * (.55 - .35 * vel))
        tau = T0 / (1 + .55 * (k - 1))
        env = .72 * np.exp(-t / (tau * .22)) + .28 * np.exp(-t / tau)
        for c in (-.9, .9):  # unison strings, a few cents apart -> slow beating / warmth
            y += ak * env * np.sin(2 * np.pi * fk * (1 + c * 1.6e-3 * .6) * t + rng.random() * 6.28) * .5
    # felt hammer thump
    L = int(.03 * SR); th = lp(rng.standard_normal(L), 900) * np.exp(-np.arange(L) / (.006 * SR))
    y[:L] += th * .08 * vel
    att = int(.006 * SR); y[:att] *= np.sin(np.linspace(0, np.pi / 2, att)) ** 2
    # damper after note-off
    d0 = int(dur * SR)
    if d0 < n: y[d0:] *= np.exp(-np.arange(n - d0) / SR / .28)
    y = lp(y, (1500 + 3800 * vel) * bright, 2)
    return fade_edges(y * vel, .0, .02)


def soft_pluck(m, dur, vel=.5):
    """Muted nylon-ish pluck for the pulse (Lemo pluck.py nylon_guitar if available)."""
    if P is not None:
        x = P.pluck('nylon_guitar', float(m), dur, vel=vel, release=.09, damp=.6, bright=.3).astype(np.float64)
        return lp(x, 3800)
    f0 = hz(m); tt = t_(dur + .1)
    x = (np.sin(2 * np.pi * f0 * tt) + .35 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / .09)
    return fade_edges(lp(x, 2200) * vel * .12, .002, .02)


def pad_voice(m, dur, att=1.0, rel=1.3, bright=1.0):
    """Warm additive pad voice: 6 harmonics, 3 detuned copies, slow LFO, returns stereo."""
    n = int((dur + rel) * SR); t = np.arange(n) / SR; f0 = hz(m)
    out = np.zeros((n, 2))
    for ci, cents in enumerate((-7, 0, 7)):
        f = f0 * 2 ** (cents / 1200)
        lfo = 1 + .0015 * np.sin(2 * np.pi * (.17 + .05 * ci) * t + ci)
        ph = 2 * np.pi * f * np.cumsum(lfo) / SR
        v = sum((1 / h ** 1.6) * np.sin(h * ph + rng.random() * 6.28) for h in range(1, 7))
        pan = (-.7, 0, .7)[ci]
        out[:, 0] += v * np.cos((pan + 1) * np.pi / 4); out[:, 1] += v * np.sin((pan + 1) * np.pi / 4)
    env = np.minimum(1, t / att) ** 2
    d0 = int(dur * SR); env[d0:] *= np.cos(np.linspace(0, np.pi / 2, n - d0)) ** 2
    out *= env[:, None]
    for c in range(2): out[:, c] = lp(out[:, c], 1500 * bright, 2)
    return out


def bass_note(m, dur, vel=.6):
    f0 = hz(m); n = int((dur + .25) * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f0 * t) + .32 * np.sin(4 * np.pi * f0 * t) + .12 * np.sin(6 * np.pi * f0 * t)
    env = np.minimum(1, t / .03) * (.75 + .25 * np.exp(-t / .5))
    d0 = int(dur * SR); env[d0:] *= np.exp(-np.arange(n - d0) / SR / .07)
    return fade_edges(lp(y * env * vel, 700), .0, .01)


def soft_kick(v=1.0):
    tt = t_(.4); f = 52 + 45 * np.exp(-tt / .03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .13)
    x += lp(rng.standard_normal(len(tt)), 1200) * np.exp(-tt / .004) * .15
    return fade_edges(x * v, .0005, .02)


def shaker(v=1.0):
    tt = t_(.07); x = bp(rng.standard_normal(len(tt)), 5000, 11000) * (tt / .012) * np.exp(-tt / .018)
    return x * v


# chord chart: bar -> (bass root, pad notes, arpeggio pool)
CH = {
    'Dmaj9': (38, [57, 61, 64, 66], [50, 57, 61, 64, 66]),
    'Bm7':   (35, [54, 57, 62, 64], [47, 54, 57, 62, 64]),
    'Gmaj7': (43, [55, 59, 62, 66], [43, 50, 54, 59, 62]),
    'Asus4': (45, [52, 57, 62, 64], [45, 52, 57, 62, 64]),
    'A':     (45, [52, 57, 61, 64], [45, 52, 57, 61, 64]),
    'Em9':   (40, [55, 59, 62, 66], [40, 47, 55, 59, 66]),
    'D':     (38, [54, 57, 62, 66], [50, 57, 62, 66, 69]),
    'A/C#':  (37, [52, 57, 61, 64], [49, 52, 57, 61, 64]),
    'D/F#':  (42, [54, 57, 62, 66], [42, 50, 57, 62, 66]),
    'Gmaj9': (43, [54, 57, 59, 62], [43, 50, 54, 57, 59]),
}
# (bar, beat, chord) -- harmonic rhythm
PROG = [(0, 0, 'Dmaj9'), (1, 0, 'Bm7'), (2, 0, 'Gmaj7'), (3, 0, 'Asus4'),
        (4, 0, 'Dmaj9'), (5, 0, 'Bm7'), (6, 0, 'Em9'), (7, 0, 'Asus4'), (7, 2, 'A'),
        (8, 0, 'Bm7'), (8, 2, 'Gmaj7'),
        (9, 0, 'D'), (10, 0, 'A/C#'), (11, 0, 'Bm7'), (12, 0, 'Gmaj7'),
        (13, 0, 'D/F#'), (14, 0, 'Asus4'), (14, 2, 'A'), (15, 0, 'Dmaj9')]
# sparse top-line melody (bar, beat, midi, beats long, vel)
MEL = [(0, 0, 69, 1.5, .42), (0, 1.5, 73, 1, .36), (0, 2.5, 76, 2.5, .40),
       (1, 0, 74, 2.5, .40), (1, 2.5, 71, 2.5, .34),
       (2, 0, 71, 1.5, .38), (2, 1.5, 74, 1, .34), (2, 2.5, 78, 2.5, .38),
       (3, 0, 76, 2, .38), (3, 2, 74, 2, .34),
       (4, 0, 69, 2.5, .36), (4, 2.5, 76, 2.5, .34),
       (5, 0, 74, 2.5, .36), (5, 2.5, 73, 2.5, .32),
       (6, 0, 71, 2.5, .36), (6, 2.5, 78, 2.5, .34),
       (7, 0, 74, 2, .36), (7, 2, 73, 2, .34),
       (8, 0, 74, 4, .30),
       (9, 0, 78, 1.5, .44), (9, 1.5, 76, 1, .38), (9, 2.5, 74, 2.5, .40),
       (10, 0, 76, 2.5, .40), (10, 2.5, 73, 2.5, .36),
       (11, 0, 74, 1.5, .40), (11, 1.5, 78, 1, .38), (11, 2.5, 76, 2.5, .38),
       (12, 0, 74, 2.5, .38), (12, 2.5, 71, 2.5, .34),
       (13, 0, 69, 1.5, .38), (13, 1.5, 74, 1, .36), (13, 2.5, 78, 2.5, .38),
       (14, 0, 76, 2, .38), (14, 2, 73, 2, .36)]


TR = -2   # R10: whole underscore a whole tone down (C major) vs R05
CH = {k: (b + TR, [n + TR for n in p], [n + TR for n in a]) for k, (b, p, a) in CH.items()}
MEL = [(b, bt, m + TR, ln, v) for b, bt, m, ln, v in MEL]


def chord_at(bar, beat=0):
    cur = PROG[0][2]
    for b, bt, c in PROG:
        if (b, bt) <= (bar, beat): cur = c
    return cur


def make_music():
    L = N + int(3 * SR)
    piano = np.zeros((L, 2)); pad = np.zeros((L, 2)); low = np.zeros((L, 2)); perc = np.zeros((L, 2)); plk = np.zeros((L, 2))

    # --- pad: one chord per PROG entry, crossfaded; brighter + fuller from the lift ---
    for i, (b, bt, c) in enumerate(PROG):
        t0 = T(b, bt); t1 = T(*PROG[i + 1][:2]) if i + 1 < len(PROG) else DUR
        lift = b >= 9
        g = (.050 if b < 1 else .060) * (1.25 if lift else 1.0)
        for m in CH[c][1]:
            v = pad_voice(m, t1 - t0 + .35, att=(1.6 if i == 0 else .7), rel=1.2, bright=(1.35 if lift else 1.0))
            s = int(t0 * SR); e = min(L, s + len(v)); pad[s:e] += v[:e - s] * g
        if lift:  # a soft high octave shimmer on top of the lift
            m = CH[c][1][-1] + 12
            v = pad_voice(m, t1 - t0 + .35, att=.9, rel=1.2, bright=1.6)
            s = int(t0 * SR); e = min(L, s + len(v)); pad[s:e] += v[:e - s] * .012

    # --- felt piano: melody + gentle left-hand broken chords ---
    for b, bt, m, ln, v in MEL:
        add(piano, felt_piano(m, ln * BEAT * .95, v), T(b, bt) + rng.normal(0, .004), .55, pan=.12 * np.sign(m - 72))
    for b in range(0, 15):
        c = chord_at(b); pool = CH[c][2]
        if b < 9:
            if b == 8:   # breath before the lift
                pat = [(0, pool[0], .30), (2, CH[chord_at(8, 2)][2][0], .26)]
            else:
                pat = [(0, pool[0], .34), (1.5, pool[2], .24), (2.5, pool[3], .22)]
                if b >= 2: pat.append((3.5, pool[1] + 12 if pool[1] + 12 < 66 else pool[1], .18))
        else:   # lift: flowing 8ths (soft), chord changes mid-bar respected
            pat = []
            for k in range(8):
                cc = chord_at(b, k / 2); pl = CH[cc][2]
                seq = [pl[0], pl[2], pl[3], pl[4], pl[2], pl[3], pl[1] + 12 if pl[1] + 12 < 70 else pl[1], pl[3]]
                pat.append((k / 2, seq[k], .26 if k % 2 == 0 else .19))
        for bt, m, v in pat:
            add(piano, felt_piano(m, BEAT * 1.6, v, bright=.85), T(b, bt) + rng.normal(0, .005), .5, pan=-.18)
    # final resolve: rolled Cmaj9 at bar 15 (39.97 s, under "building this year")
    for k, m in enumerate([38, 50, 57, 61, 64, 69, 74]):
        add(piano, felt_piano(m + TR, 2.0, .42 - .02 * k), T(15) + k * .045, .55, pan=-.3 + .1 * k)
    add(piano, felt_piano(78 + TR, 2.0, .30), T(15) + .42, .45, pan=.2)

    # --- bass (enters bar 4, fuller from the lift) ---
    for i, (b, bt, c) in enumerate(PROG):
        if b < 4: continue
        t0 = T(b, bt); t1 = T(*PROG[i + 1][:2]) if i + 1 < len(PROG) else DUR
        v = .060 if b < 9 else .085
        if b == 15: v = .07
        add(low, bass_note(CH[c][0], (t1 - t0) * .96, 1.0), t0, v)

    # --- light pulse: muted pluck quarters (bars 2-8), 8ths + soft kick + shaker in the lift (bars 9-15) ---
    for b in range(2, 15):
        if b < 9:
            steps = [0, 1, 2, 3] if b != 8 else [0, 1]
            for k in steps:
                c = chord_at(b, k); m = CH[c][2][1] + (12 if k % 2 else 0)
                add(plk, soft_pluck(m, .16, .45), T(b, k), .22 if k % 2 == 0 else .16, pan=.35)
        else:
            for k in range(8):
                c = chord_at(b, k / 2); pl = CH[c][2]; m = (pl[1] + 12) if k % 2 == 0 else pl[3]
                add(plk, soft_pluck(m, .14, .45), T(b, k / 2), .22 if k % 2 == 0 else .15, pan=.4 if k % 2 else .25)
            for k in (0, 2):
                add(perc, soft_kick(1.0), T(b, k), .10)
            for k in range(8):
                if k % 2: add(perc, shaker(1.0), T(b, k / 2) + .008, .022, pan=-.3)
    # soft swell into the lift (airy riser into 23.98)
    d = 1.1; tt = t_(d); sw = bp(rng.standard_normal(len(tt)), 1500, 6000) * (tt / d) ** 3
    add(pad, sw, 23.98 - d, .010, pan=0)

    mix = piano * 1.0 + pad * 1.0 + low * 1.0 + perc * 1.0 + plk * 1.0
    wet = reverb(mix[:N + SR], size=.45, mix=.28, predelay=.025, damp=.55, seed=11)
    out = wet[:N].copy()
    # short tail fade to silence at 41.93 s, after the final chord has spoken
    fs, fe = int(41.25 * SR), N
    out[fs:fe] *= (np.cos(np.linspace(0, np.pi / 2, fe - fs)) ** 2)[:, None]
    out[:int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))[:, None]
    out = hp_st(out, 35)
    return out


def hp_st(x, f):
    y = x.copy()
    for c in range(x.shape[1]): y[:, c] = hp(x[:, c], f)
    return y


# =====================================================================
# 2. SFX -- subtle UI foley on the key hits
# =====================================================================
def s_stamp():
    tt = t_(.35)
    body = np.sin(2 * np.pi * np.cumsum(95 + 60 * np.exp(-tt / .015)) / SR) * np.exp(-tt / .06)
    slap = bp(rng.standard_normal(len(tt)), 400, 2500) * np.exp(-tt / .012)
    paper = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt / .005) * .3
    return fade_edges(norm(body * 1.0 + slap * .45 + paper), .0005, .03)


def s_swish(d=.3, lo=1500, hi=6000, rise=True):
    """pen strike / light swish: bandpassed noise with a moving centre"""
    tt = t_(d); x = rng.standard_normal(len(tt)); out = np.zeros_like(x); blk = 480
    for i in range(0, len(x), blk):
        j = min(len(x), i + blk); p = i / len(x); p = p if rise else 1 - p
        fc = lo * (hi / lo) ** p
        out[i:j] = bp(x[max(0, i - 1500):j], fc * .75, min(fc * 1.3, 20000))[-(j - i):]
    env = np.sin(np.pi * np.minimum(1, tt / d)) ** 1.5 * (1 + .3 * np.sin(2 * np.pi * 25 * tt))
    return fade_edges(norm(out * env), .002, .02)


def s_pop(f0=520, f1=1300, d=.12):
    tt = t_(d); f = f0 + (f1 - f0) * (1 - np.exp(-tt / .02))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .035)
    x[:int(.002 * SR)] *= np.linspace(0, 1, int(.002 * SR))
    return fade_edges(norm(x), .0, .01)


def s_chime(m, d=1.1):
    tt = t_(d); f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * r * tt + rng.random()) * np.exp(-tt / tau)
            for r, a, tau in [(1, 1, .45), (2.0, .25, .25), (3.01, .10, .12), (4.2, .05, .06)])
    x[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
    return fade_edges(norm(x), .0, .05)


def s_drop(f0=900, f1=1900):
    """water-drop plink: quick upward sine glide + tiny bubble ring"""
    tt = t_(.16); f = f0 + (f1 - f0) * np.minimum(1, tt / .035) ** .7
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .03)
    x[:int(.0015 * SR)] *= np.linspace(0, 1, int(.0015 * SR))
    return fade_edges(norm(x), .0, .02)


def s_whoosh(d=.7, lo=300, hi=2200):
    tt = t_(d); x = rng.standard_normal(len(tt)); out = np.zeros_like(x); blk = 480
    for i in range(0, len(x), blk):
        j = min(len(x), i + blk); p = np.sin(np.pi * i / len(x))
        fc = lo + (hi - lo) * p
        out[i:j] = bp(x[max(0, i - 2000):j], fc * .6, fc * 1.6)[-(j - i):]
    env = np.sin(np.pi * tt / d) ** 2
    env = env * (tt / d) ** .3
    return fade_edges(norm(lp(out, 5000) * env), .01, .05)


def s_crack():
    """short crisp crack: a burst of tiny fractures + a small dry body"""
    d = .22; out = np.zeros(int(d * SR))
    times = np.sort(np.r_[0, rng.uniform(0, .07, 6)])
    for i, tm in enumerate(times):
        L = int(rng.uniform(.004, .012) * SR); s = int(tm * SR)
        z = hp(rng.standard_normal(L), 2500) * np.exp(-np.arange(L) / (.0018 * SR)) * (1 if i == 0 else rng.uniform(.25, .6))
        out[s:s + L] += z[:len(out) - s]
    tt = t_(d)
    out += bp(rng.standard_normal(len(tt)), 300, 1500) * np.exp(-tt / .02) * .35
    return fade_edges(norm(out), .0003, .03)


def s_shimmer(d=.9):
    """sun glint: a few soft high sine sparkles"""
    tt = t_(d); x = np.zeros_like(tt)
    for k, m in enumerate([86, 90, 93, 98]):
        s = k * .07; e = np.clip(tt - s, 0, None)
        x += np.sin(2 * np.pi * hz(m) * tt) * (tt >= s) * np.exp(-e / .22) * (1 - .15 * k)
    return fade_edges(norm(x), .004, .1)


def s_click(f=2400, d=.04):
    tt = t_(d)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .006) + hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt / .0015) * .4
    return fade_edges(norm(x), .0003, .01)


def s_tick(f=3200):
    tt = t_(.03)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .004) + np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt / .002) * .3
    return fade_edges(norm(x), .0002, .008)


def s_scribble(d=.75):
    """pencil scribble: graphite grit + stroke rhythm (~9 strokes/s), slightly irregular"""
    tt = t_(d); x = rng.standard_normal(len(tt))
    grit = bp(x, 2500, 9000) + .5 * bp(rng.standard_normal(len(tt)), 900, 2500)
    rate = 9 + 1.5 * np.sin(2 * np.pi * .9 * tt)
    ph = 2 * np.pi * np.cumsum(rate) / SR
    strokes = np.abs(np.sin(ph)) ** 1.6 * (.7 + .3 * rng.random(len(tt)) ** 2)
    strokes = uniform_filter1d(strokes, int(.004 * SR))
    env = np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .12)
    return fade_edges(norm(grit * strokes * env), .005, .03)


def s_paper(d=.25):
    """calendar-page flick"""
    tt = t_(d); x = bp(rng.standard_normal(len(tt)), 1800, 7000)
    flutter = .6 + .4 * np.sin(2 * np.pi * 38 * tt) ** 2
    env = np.minimum(1, tt / .015) * np.exp(-tt / .07)
    return fade_edges(norm(x * flutter * env), .002, .02)


def s_lens(d=.6):
    """magnifier zoom: soft airy swell with a faint rising tone"""
    tt = t_(d)
    air = bp(rng.standard_normal(len(tt)), 600, 3500) * (tt / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(420 + 380 * (tt / d) ** 2) / SR) * (tt / d) ** 2 * .25
    env = np.minimum(1, (d - tt) / .06)
    return fade_edges(norm((air + tone) * env), .01, .01)


def s_bookmark():
    tt = t_(.25)
    thup = np.sin(2 * np.pi * np.cumsum(180 + 140 * np.exp(-tt / .02)) / SR) * np.exp(-tt / .05)
    pop = np.zeros_like(tt); p = s_pop(650, 1500, .12); pop[:len(p)] = p * .7
    return fade_edges(norm(thup * .8 + pop), .0005, .03)


def make_sfx():
    """Cue list for R10 -- times (s) taken from timing.json word starts and the scene code (scenes/s*.js)."""
    S = np.zeros((N + SR, 2))
    C = [72, 74, 76, 79, 81, 84]          # C-major chime notes (underscore is in C)
    # ---- s1 hook: bag pops in, HOME LOAN tag, strike on "not", NOT IN ONE GO, cut lines, split into packets
    add(S, s_pop(420, 950, .14), 0.32, .22, 0); add(S, s_chime(76, .9), 0.34, .05, 0)
    add(S, s_pop(560, 1250), 1.00, .14, -.15)                      # "loan"
    add(S, s_swish(.30, 1800, 7000), 1.64, .20, .2)                # strike on "not"
    add(S, s_pop(480, 1100), 1.80, .16, 0)                         # NOT IN ONE GO
    add(S, s_swish(.5, 1200, 5000), 2.49, .08, -.1)                # dashed cut lines draw
    add(S, s_whoosh(.45, 400, 2600), 2.95, .14, 0)                 # split
    for i, m in enumerate([72, 76, 79, 84]):
        add(S, s_pop(520 + 60 * i, 1250 + 80 * i), 3.16 + i * .05, .16, -.45 + .3 * i); add(S, s_chime(m, .8), 3.17 + i * .05, .05, -.45 + .3 * i)
    # scene changes: very soft air swishes
    for tm in (3.85, 15.20, 32.35):
        add(S, s_swish(.28, 900, 3500), tm - .14, .06, 0)
    # ---- s2 stages: bank jiggle on "releases", track rows on "stages", stage builds, check -> release cycles
    for i in range(4): add(S, s_tick(2800 + 120 * i), 5.51 + i * .13, .08, .3)
    for i in range(4): add(S, s_click(2000 + 150 * i), 6.35 + i * .12, .10, .25)
    add(S, s_swish(.6, 600, 3000), 7.70, .08, -.2)                 # "goes up" ghost outline
    for tm in (9.39, 9.83, 10.15, 10.79):                          # plinth, slab, walls, finishing
        add(S, s_pop(260, 640, .12), tm, .20, -.25); add(S, s_click(1400, .05), tm + .01, .08, -.25)
    for i, c in enumerate((11.46, 12.20, 12.95, 13.70)):
        add(S, s_tick(3000), c, .14, .2)                           # check badge
        add(S, s_swish(.35, 1000, 4000), c + .2, .06, .35)         # packet leaves the bank
        add(S, s_pop(520, 1250), c + .72, .20, .35); add(S, s_chime(C[i], .9), c + .73, .07, .35)   # lands
    add(S, s_pop(600, 1400), 12.31, .10, -.3)                      # CHECK, THEN RELEASE tag
    # ---- s3 the gap: sources, bills landing, release steps, BILLS DON'T WAIT, THE GAP
    add(S, s_pop(500, 1200), 15.86, .14, -.3); add(S, s_pop(500, 1200), 16.99, .14, .3)
    for j in range(12):
        f = .04 + j * .083; add(S, s_paper(.2), 16.0 + f * 3.3 - .05, .07, .3 if j % 2 else -.3)
    for k in range(1, 5):
        add(S, s_chime(C[k + 1] if k < 4 else 84, .7), 16.0 + k / 4 * 3.3, .05, .1)
    add(S, s_pop(380, 900), 18.04, .16, -.1)                       # BILLS DON'T WAIT
    add(S, s_swish(.3, 900, 3000), 19.82, .07, 0)                  # "between": guides
    add(S, s_lens(.5), 20.10, .08, 0)                              # highlighted gap fills
    add(S, s_whoosh(.6, 250, 1500), 21.85, .10, 0)                 # "cover": all gaps shade
    add(S, s_stamp(), 22.66, .40, 0)                               # THE GAP lands
    # ---- s4 ask your bank: pen signature, card, three pips, three questions
    add(S, s_scribble(.6), 24.54, .14, .2)
    add(S, s_whoosh(.5, 400, 2200), 24.55, .08, 0)
    for i in range(3): add(S, s_tick(3000 + 200 * i), 25.79 + i * .1, .10, -.2 + .2 * i)
    for tm, m, pn in ((26.85, 79, -.25), (27.92, 81, 0), (30.28, 84, .25)):
        add(S, s_pop(520, 1250), tm, .22, pn); add(S, s_chime(m, .9), tm + .01, .07, pn)
    # ---- s5 cash plan: header, gap boxes, cash fills + checks, confirm card
    add(S, s_paper(.25), 32.75, .12, 0)
    for i in range(4): add(S, s_click(1800 + 120 * i), 32.98 + i * .12, .10, -.3 + .2 * i)
    for i in range(4):
        add(S, s_swish(.4, 700, 2600), 34.20 + i * .16, .05, -.3 + .2 * i)
        add(S, s_click(2600 + 100 * i), 34.70 + i * .16, .10, -.3 + .2 * i)
    add(S, s_pop(560, 1300), 34.91, .20, 0); add(S, s_chime(84, 1.0), 34.93, .06, 0)
    # ---- s6 CTA: paper plane whoosh on "Send", soft land chime, sign-off
    add(S, s_whoosh(.8, 300, 2400), 37.80, .22, -.3)
    add(S, s_chime(84, 1.1), 38.62, .06, .1)
    add(S, s_chime(79, 1.4), 40.46, .04, 0)
    S = reverb(S, size=.2, mix=.14, predelay=.008, damp=.6, seed=21)
    S = hp_st(S[:N], 60)
    return S


# =====================================================================
# 3. MIX + MASTER
# =====================================================================
def k_weight(x):
    # ITU-R BS.1770 K-weighting @ 48 kHz
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    from scipy.signal import lfilter
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)


def lufs(st):
    st = st if st.ndim == 2 else st[:, None]
    y = k_weight(st); blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-20)
    ms = ms[l > -70];
    if not len(ms): return -120.0
    rel = -0.691 + 10 * np.log10(ms.mean()) - 10
    l2 = -0.691 + 10 * np.log10(ms + 1e-20)
    return -0.691 + 10 * np.log10(ms[l2 > rel].mean())


def env_follow(x, att, rel):
    """one-pole peak/RMS follower on a frame-rate signal"""
    out = np.zeros_like(x); e = x[0]
    for i, v in enumerate(x):
        c = att if v > e else rel; e = c * e + (1 - c) * v; out[i] = e
    return out


def compress_voice(v, thr_db=-20, ratio=2.5, att=.005, rel=.09):
    # envelope at 1 kHz frame rate, smoothed, interpolated -> gain
    hopn = 48; fr = np.sqrt(uniform_filter1d(v ** 2, 96)[::hopn] + 1e-12)
    fr = maximum_filter1d(np.abs(v), hopn)[::hopn] * .5 + fr * .5
    a, r = np.exp(-1 / (att * 1000)), np.exp(-1 / (rel * 1000))
    e = env_follow(fr, a, r); edb = 20 * np.log10(e + 1e-9)
    gdb = np.where(edb > thr_db, (thr_db + (edb - thr_db) / ratio) - edb, 0.0)
    g = np.interp(np.arange(len(v)) / hopn, np.arange(len(gdb)), db(gdb))
    return v * g


def duck_curve(v, depth_db=9.0):
    """sidechain-style ducking gain from the narration: -depth when speech is present, lookahead 80 ms"""
    hopn = 480  # 10 ms frames
    rms = np.sqrt(uniform_filter1d(v ** 2, 1440)[::hopn] + 1e-12); ldb = 20 * np.log10(rms)
    act = np.clip((ldb - (-46)) / 12, 0, 1)        # -46 dBFS -> 0, -34 dBFS -> fully ducked
    act = maximum_filter1d(act, 25, origin=-4)      # hold ~250 ms, plus ~40 ms look-ahead (bridges word gaps)
    gdb = -depth_db * act
    a, r = np.exp(-1 / (.06 * 100)), np.exp(-1 / (.45 * 100))   # 60 ms down, 450 ms back up
    out = np.zeros_like(gdb); e = 0.0
    for i, x in enumerate(gdb):
        c = a if x < e else r; e = c * e + (1 - c) * x; out[i] = e
    out = np.roll(out, -4); out[-4:] = out[-5]      # 40 ms extra look-ahead
    return db(np.interp(np.arange(len(v)) / hopn, np.arange(len(out)), out)), out


def tp_limit(st, ceil_db=-2.0, look=.003, rel=.08):
    """true-peak (4x oversampled) look-ahead limiter, returns limited stereo"""
    ceil = db(ceil_db); n = int(look * SR)
    up = np.stack([resample_poly(st[:, c], 4, 1) for c in range(2)], 1)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(st)]
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, 2 * n + 1); g = uniform_filter1d(g, n)
    rc = 1 - np.exp(-1 / (rel * SR)); out = np.empty_like(g); y = 1.0
    gm = minimum_filter1d(g, 3)
    for i in range(len(g)):
        y = min(gm[i], y + (1 - y) * rc); out[i] = y
    return st * out[:, None]


def ffmpeg_measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); lra = float(re.findall(r'LRA:\s+(-?[\d.]+) LU', r)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r)[-1])
    return I, tp, lra


def main():
    voice, sr = sf.read(os.path.join(HERE, 'narration.wav'), always_2d=False)
    assert sr == SR, sr
    if voice.ndim > 1: voice = voice.mean(1)
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

    print('music...'); music = make_music()
    print('sfx...'); sfx = make_sfx()

    # --- voice chain: HPF 70 Hz, gentle 2.5:1 compression, back to original loudness ---
    v = hp(voice, 70)
    v0 = lufs(v); vc = compress_voice(v, -20, 2.5); vc *= db(v0 - lufs(vc))
    V = np.stack([vc, vc], 1)
    VL = lufs(V)

    # --- balance (relative to voice loudness): music bed -11 LU un-ducked (-20 LU under speech), sfx accents ---
    music *= db(VL - 11 - lufs(music))
    sfx *= db(VL - 17 - lufs(sfx))
    duck, duck_db_frames = duck_curve(vc, 9.0)
    mix = V + music * duck[:, None] + sfx

    # --- master: loudness to -14 LUFS, then true-peak limiting; iterate to land on target ---
    gain = -14.0 - lufs(mix)
    for it in range(4):
        out = tp_limit(mix * db(gain), -2.0)
        L = lufs(out); gain += -14.0 - L
        if abs(L + 14.0) < .05: break
    out = out[:N].astype(np.float32)
    assert out.shape == (N, 2)

    sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR, subtype='PCM_24')
    fm = os.path.join(HERE, 'final_mix.wav')
    sf.write(fm, out, SR, subtype='PCM_24')

    speech = duck_db_frames < -8.0
    print(f'voice {VL:.1f} LUFS | music bed {lufs(music):.1f} LUFS | sfx {lufs(sfx):.1f} LUFS | '
          f'ducking: {speech.mean() * 100:.0f}% of frames at >=8 dB, max {-duck_db_frames.min():.1f} dB')
    I, tp, lra = ffmpeg_measure(fm)
    info = sf.info(fm)
    print(f'final_mix.wav: I={I:.1f} LUFS  TP={tp:.1f} dBTP  LRA={lra:.1f} LU  {info.samplerate} Hz  {info.channels} ch  {info.frames / SR:.3f} s ({info.frames} samples)')


if __name__ == '__main__':
    main()
