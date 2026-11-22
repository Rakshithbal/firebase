#!/usr/bin/env python3
"""Original music bed + soft SFX + mix for the BNB style samples (all synthesized, no samples, deterministic).
usage: python make_audio.py <sample_dir> <02|03|08>
reads  <dir>/audio/narration.wav (mono 48k, already on the timeline) and <dir>/timing.json
writes <dir>/audio/music.wav, sfx.wav, mix.wav (stereo 48k, pre-master; mastering = two-pass loudnorm in mux.sh)
Adapted from r05-curing/audio/make_audio.py (same DSP helpers, new instruments and cues per style)."""
import sys, os, json
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

D, STYLE = sys.argv[1], sys.argv[2]
SR = 48000
TM = json.load(open(os.path.join(D, 'timing.json')))
DUR = TM['total']; N = int(round(DUR * SR))
rng = np.random.default_rng(int(STYLE) * 101 + 7)


def t_(d): return np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)
def noise(d): return rng.standard_normal(int(round(d * SR)))


def fade(x, a=.002, r=.01):
    na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x


def add(buf, x, at, gain=1.0, pan=0.0):
    s = int(round(at * SR))
    if s >= len(buf) or s + len(x) <= 0: return
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x)); l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[s:e, 0] += x[:e - s] * gain * l * 1.4142; buf[s:e, 1] += x[:e - s] * gain * r * 1.4142


def reverb(st, rt=1.4, mix=.22, pre=.02, seed=3):
    n = int(rt * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed); out = np.zeros_like(st)
    for c in range(2):
        ir = lp(r.standard_normal(n), 5200, 1) * np.exp(-6.9 * t / rt)
        ir = np.concatenate([np.zeros(int(pre * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = fftconvolve(st[:, c], ir)[:len(st)]
    return st * (1 - mix) + out * mix * 1.6


# ---------------- instruments ----------------
def partials(m, dur, parts, bright=6000):
    f0 = hz(m); tt = t_(dur); y = np.zeros(len(tt))
    for ratio, amp, tau in parts:
        if f0 * ratio < 16000: y += amp * np.sin(2 * np.pi * f0 * ratio * tt + rng.random() * 6.28) * np.exp(-tt / tau)
    return fade(lp(y, bright), .001, .02)

def marimba(m, vel=.6, dur=1.2): return partials(m, dur, [(1, 1, .45), (3.93, .35 * vel, .07), (9.2, .12 * vel, .02)], 4200) * vel
def kalimba(m, vel=.6, dur=1.4): return partials(m, dur, [(1, 1, .6), (5.4, .28 * vel, .05), (6.1, .1, .03)], 5200) * vel
def glock(m, vel=.5, dur=2.2): return partials(m, dur, [(1, 1, 1.1), (2.76, .35, .35), (5.4, .18, .12)], 9000) * vel
def vibe(m, vel=.5, dur=2.0):
    x = partials(m, dur, [(1, 1, 1.3), (4.0, .22, .25), (10.0, .06, .05)], 5000) * vel
    return x * (1 + .25 * np.sin(2 * np.pi * 5.2 * t_(dur)))
def glass(m, vel=.4, dur=2.5): return partials(m, dur, [(1, 1, 1.6), (2.32, .4, .7), (4.25, .2, .3), (6.63, .1, .15)], 9000) * vel
def musicbox(m, vel=.4, dur=1.6): return partials(m, dur, [(1, 1, .7), (3.0, .25, .12), (5.97, .12, .05)], 9000) * vel

def bass(m, dur, vel=.6):
    f0 = hz(m); tt = t_(dur + .2)
    y = np.sin(2 * np.pi * f0 * tt) + .35 * np.sin(4 * np.pi * f0 * tt) + .15 * np.sin(6 * np.pi * f0 * tt)
    env = np.minimum(1, tt / .02) * (.7 + .3 * np.exp(-tt / .4)); d0 = int(dur * SR); env[d0:] *= np.exp(-np.arange(len(tt) - d0) / SR / .06)
    return fade(lp(y * env * vel, 900), 0, .01)

def pad(ms, dur, vel=.12, bright=1400):
    tt = t_(dur); y = np.zeros(len(tt))
    for m in ms:
        for c in (-6, 0, 6):
            f = hz(m) * 2 ** (c / 1200); y += sum((1 / h ** 1.7) * np.sin(2 * np.pi * f * h * tt + rng.random() * 6.28) for h in range(1, 6))
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.0).clip(0)
    return lp(y * env, bright) * vel / len(ms)

# ---------------- sfx ----------------
def thump(f=70, vel=1.0, dur=.45):
    tt = t_(dur); ph = 2 * np.pi * np.cumsum(f + f * 1.4 * np.exp(-tt / .03)) / SR
    y = np.sin(ph) * np.exp(-tt / .12) + lp(noise(dur), 700) * np.exp(-tt / .02) * .25
    return fade(y * vel, .001, .05)
def tick(vel=.5, f=3200):
    tt = t_(.05); return fade(bp(noise(.05), f * .7, f * 1.3) * np.exp(-tt / .006) * vel, 0, .005)
def whoosh(dur=.8, lo=300, hi=2400, vel=.5, rise=True):
    n = noise(dur); tt = t_(dur); u = tt / dur; c = (lo + (hi - lo) * (u if rise else 1 - u))
    y = np.zeros_like(n); seg = int(.02 * SR)
    for i in range(0, len(n), seg):   # stepped band-pass sweep
        cc = c[min(i, len(c) - 1)]; y[i:i + seg] = bp(n[max(0, i - 2000):i + seg], cc * .7, cc * 1.35)[-len(n[i:i + seg]):]
    env = np.sin(np.pi * u) ** 1.6
    return fade(y * env * vel, .01, .05)
def hiss(dur=.6, vel=.12): tt = t_(dur); return fade(bp(noise(dur), 3500, 7000) * np.sin(np.pi * tt / dur) * vel, .01, .03)
def plink(m, vel=.5):   # ceramic / clay plink
    return partials(m, .6, [(1, 1, .12), (2.9, .5, .05), (5.1, .3, .02)], 8000) * vel
def check_ding(m=84, vel=.45):
    a = glock(m, vel, 1.4); b = glock(m + 7, vel * .9, 1.6); out = np.zeros(len(b) + int(.09 * SR)); out[:len(a)] += a; out[int(.09 * SR):] += b; return out


music = np.zeros((N, 2)); sfx = np.zeros((N, 2))

if STYLE == '02':   # kalimba + marimba pulse, light woodblock, F major, 104 bpm
    beat = 60 / 104
    prog = [(53, [65, 69, 72]), (50, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72])]
    for b in range(int(DUR / beat) + 1):
        tb = .25 + b * beat; bar = (b // 4) % 4; root, ch = prog[bar]
        if tb > DUR - .3: break
        if b % 4 == 0: add(music, bass(root - 12 + 12, beat * 3.6, .5), tb, .55)
        if b % 4 == 0: add(music, pad(ch, beat * 4 + 1, .08), tb, 1.0, 0)
        for k, sub in enumerate((0, .5)):
            m = ch[(b * 2 + k) % 3] + 12; add(music, kalimba(m, .38 if k else .5), tb + sub * beat, .55, -.3 + .6 * ((b + k) % 2))
        if b % 2 == 1: add(music, tick(.25, 1800), tb, .5, .4)
    add(music, marimba(77, .5), .3, .5)
    # sfx
    add(sfx, thump(68, .8), .85, .9); add(sfx, plink(84, .3), .86, .4)
    add(sfx, hiss(.8), 1.0, 1, -.3); add(sfx, hiss(.8), 1.5, 1, .3)
    for i, tt in enumerate([1.95, 2.25, 2.55, 2.85]): add(sfx, whoosh(.55, 250, 900, .22), tt, 1, -.4 + .25 * i)
    for i, tt in enumerate([3.55, 4.15, 4.75, 5.3, 5.85, 6.4]): add(sfx, plink([72, 74, 77, 79, 81, 84][i], .55), tt + .12, .8, (-1) ** i * .25)
    for i in range(9): add(sfx, tick(.25, 2400 + i * 120), 6.5 + i * .07, .7, -.3)
    add(sfx, whoosh(.9, 200, 1400, .35), 7.65, 1)
    for i in range(6): add(sfx, tick(.2, 2600), 8.1 + i * .04, .6, .2)
    add(sfx, whoosh(.65, 1800, 300, .3, False), 8.45, 1); add(sfx, thump(58, 1.0), 9.03, 1.1); add(sfx, plink(65, .3), 9.04, .5)
    add(music, glock(84, .4), 9.05, .6); add(music, glock(89, .3), 9.25, .5)

elif STYLE == '03':   # dry tuned mallets, glass, round bass, small dry percussion; near-silence before the separation
    beat = 60 / 92
    prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62]), (40, [55, 59, 64])]
    for b in range(int(DUR / beat) + 1):
        tb = .2 + b * beat; bar = (b // 4) % 4; root, ch = prog[bar]
        if tb > DUR - .3: break
        if 4.55 < tb < 5.15: continue     # near-silence before the walls come apart
        if b % 4 == 0: add(music, bass(root, beat * 3.5, .55), tb, .6); add(music, pad(ch, beat * 4 + .8, .07, 1100), tb, 1)
        add(music, vibe(ch[b % 3] + 12, .32), tb, .5, -.35 + .7 * (b % 2))
        if b % 2: add(music, marimba(ch[(b + 1) % 3] + 24, .25), tb + beat / 2, .35, .3)
        add(music, tick(.18, 5200), tb, .35, .5)
    # sfx: plates set down, the lift, leader ticks, the tags
    add(sfx, thump(90, .45, .3), .45, .7, -.35); add(sfx, thump(85, .45, .3), .6, .7, .35)
    add(sfx, glass(81, .3), 5.2, .5)
    for i in range(4): add(sfx, whoosh(.6, 400, 2600, .28), 5.15 + i * .17, 1, -.4 + .1 * i)
    for i in range(4): add(sfx, whoosh(.6, 400, 2600, .28), 5.25 + i * .17, 1, .4 - .1 * i)
    for i in range(8): add(sfx, tick(.35, 3000 + 150 * i), 6.15 + i * .16, .8, (-1) ** i * .4)
    for i in range(8): add(sfx, hiss(.25, .08), 6.1 + i * .16, 1, (-1) ** i * .4)
    add(sfx, glass(88, .28), 8.2, .5, -.4); add(sfx, glass(93, .28), 8.45, .5, .4)

elif STYLE == '08':   # marimba + glockenspiel minimalist pulse (Reich grammar), music-box top line; checks are glock dings
    beat = 60 / 112
    prog = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (43, [55, 59, 62, 67])]
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for b in range(int(DUR / beat) + 1):
        tb = .15 + b * beat; bar = (b // 4) % 4; root, ch = prog[bar]
        if tb > DUR - .25: break
        if b % 4 == 0: add(music, bass(root, beat * 3.6, .5), tb, .55); add(music, pad(ch[:3], beat * 4 + .6, .06, 1200), tb, 1)
        for k in range(2):
            m = ch[pat[(b * 2 + k) % 8]] + 12; add(music, marimba(m, .45 if k == 0 else .35), tb + k * beat / 2, .55, -.35 if k == 0 else .35)
        if b >= 4:   # second voice phased a sixteenth behind, enters later (voices added one at a time)
            m = ch[pat[(b * 2 + 3) % 8]] + 24; add(music, musicbox(m, .22), tb + beat * .25, .4, .2)
    # sfx: clay taps as each stage builds, a check ding per stage, a final soft chord
    ST = [2.0, 3.05, 4.1, 5.15, 6.2, 7.25]
    for i, s in enumerate(ST):
        for j in range(3): add(sfx, plink(60 + 3 * j + i, .35), s - .55 + j * .13, .55, -.3 + .3 * j)
        add(sfx, thump(110 + 8 * i, .25, .2), s - .2, .6)
        add(sfx, check_ding(84 + [0, 2, 4, 5, 7, 9][i], .4), s + .1, .7, -.2 + .08 * i)
    add(music, glock(96, .3), 8.6, .5)

# ---------------- voice + mix ----------------
vo, sr = sf.read(os.path.join(D, 'audio', 'narration.wav')); assert sr == SR
vo = vo[:N] if vo.ndim == 1 else vo[:N, 0]
vo = np.pad(vo, (0, N - len(vo)))
vo = hp(vo, 80)
# simple RMS compressor (3:1 above -20 dBFS, 5 ms / 120 ms)
env = np.sqrt(lp(vo ** 2, 12, 1).clip(1e-12)); lvl = 20 * np.log10(env + 1e-9)
gr = np.where(lvl > -20, (lvl + 20) * (1 / 3 - 1), 0); vo = vo * db(gr)
act = np.abs(vo) > 1e-4
vrms = np.sqrt(np.mean(vo[act] ** 2)) if act.any() else 1
vo = vo / vrms * db(-20)

music = reverb(music, 1.6, .25); sfx = reverb(sfx, 1.0, .15, seed=5)
# music sits ~10 dB under the voice, ducked a further ~7 dB while the voice speaks
mrms = np.sqrt(np.mean(music ** 2)) + 1e-9; music = music / mrms * db(-27)
tt = np.arange(N) / SR; a, b = TM['vo_start'] - .2, TM['vo_end'] + .25
duck = np.where((tt > a) & (tt < b), db(-7), 1.0); duck = lp(duck, 3, 1)
music *= duck[:, None]
srms = np.sqrt(np.mean(sfx[np.abs(sfx).sum(1) > 1e-4] ** 2)) + 1e-9; sfx = sfx / srms * db(-25)
fi = int(.03 * SR); fo = int(.6 * SR)
mix = music + sfx + np.stack([vo, vo], 1) * .7071
mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix *= .5 / (np.abs(mix).max() + 1e-9)
os.makedirs(os.path.join(D, 'audio'), exist_ok=True)
sf.write(os.path.join(D, 'audio', 'music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(D, 'audio', 'sfx.wav'), sfx.astype(np.float32), SR)
sf.write(os.path.join(D, 'audio', 'mix.wav'), mix.astype(np.float32), SR)
print('mix', os.path.join(D, 'audio', 'mix.wav'), round(DUR, 2), 's')
