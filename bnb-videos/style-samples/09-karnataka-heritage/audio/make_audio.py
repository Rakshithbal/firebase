#!/usr/bin/env python3
"""09 Karnataka Heritage -- original, respectful Carnatic-flavoured bed: a tanpura-style drone (Pa-Sa-Sa-Sa cycle with jivari buzz),
veena-like plucks with gamaka slides in a pentatonic (S R G P D) phrase, soft mridanga-like taps; SFX: rice-paste brush whisper,
small brass 'tink' for each kalasha, soft footstep taps along the path, sparing gold-leaf shimmers. Ducked under the VO."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../tools'))
from mixlib import *
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
N = 10 * SR; rng = np.random.default_rng(909); EVS = json.load(open(os.path.join(PROJ, 'ev.json')))
SA = 50  # D3
def tanpura_string(m, d=2.6):
    t = t_(d); f = hz(m); y = np.zeros_like(t)
    for k in range(1, 18):  # jivari: rich upper partials that bloom and decay slowly
        bloom = np.exp(-((t - .25 - k * .04) / (.5 + k * .03)) ** 2) * .6 + np.exp(-t / 1.8) * .4
        y += (1 / k ** .9) * bloom * np.sin(2 * np.pi * f * k * t * (1 + .0004 * np.sin(2 * np.pi * .3 * t)))
    env = np.minimum(1, t / .03) * np.exp(-t / 2.2); return fade(lp(y * env * .08, 5000), .002, .3)
def music():
    st = np.zeros((N, 2)); cyc = [SA - 5 + 12, SA + 12, SA + 12, SA]   # Pa Sa' Sa' Sa
    t = 0.0; i = 0
    while t < 9.6: add(st, tanpura_string(cyc[i % 4]), t, .9, -.3 + .2 * (i % 4)); t += .62; i += 1
    # veena-like phrase (pluck physical model + slides), Mohanam-type pentatonic
    ph = [(1.2, 'D4', None), (1.75, 'E4', None), (2.2, 'F#4', ('A4', .18)), (3.3, 'A4', None), (3.65, 'B4', ('A4', .25)),
          (5.0, 'F#4', None), (5.35, 'E4', ('D4', .3)), (6.6, 'A4', None), (7.0, 'B4', None), (7.4, 'D5', ('B4', .2)), (8.3, 'A4', ('D4', .5))]
    for tt, n, gl in ph:
        kw = dict(glide=gl) if gl else {}
        add(st, pl('pipa', n, None, .42, t60=3.2, bright=.45, **kw), tt, .55, .15)
    # soft hand-drum taps (low thom + light ta), sparse
    for tt in [1.2, 2.44, 3.68, 4.92, 6.16, 7.4, 8.64]:
        n = int(.35 * SR); x = np.arange(n) / SR; th = np.sin(2 * np.pi * (85 + 40 * np.exp(-x / .02)) * x) * np.exp(-x / .14)
        add(st, th * .35, tt, 1, 0); add(st, bp(rng.standard_normal(int(.06 * SR)), 1800, 5000) * np.exp(-np.arange(int(.06 * SR)) / (.01 * SR)) * .08, tt + .31, 1, .2)
    return reverb(st, 2.2, .3)
def shimmer(d=.7):
    t = t_(d); y = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / (.25 + .1 * k)) for k, f in enumerate([2637, 3136, 3951, 4699]))
    return fade(y * np.minimum(1, t / .05) * .05, .01, .1)
def tink():
    t = t_(1.2); y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(1180, 1, .5), (2950, .5, .3), (4870, .3, .15)])
    return fade(y * .12, .0005, .05)
def sfx():
    st = np.zeros((N, 2))
    for e in EVS:
        k, t, d = e['kind'], e['t'], e.get('d', .4)
        if k in ('border', 'house', 'fill', 'rangoli'):   # rice-paste brush whisper
            n = int(d * SR); x = np.arange(n) / SR; y = bp(rng.standard_normal(n), 1200, 5000) * (.4 + .6 * np.abs(np.sin(np.pi * x * 3.1))) * np.sin(np.pi * x / d) ** .6
            add(st, y * .1, t, 1, -.2 if k == 'border' else .1)
        elif k == 'kalasha': add(st, tink(), t + .15, 1, -.3 if t < 2.7 else .3)
        elif k == 'path':
            for j in range(9): add(st, lp(rng.standard_normal(int(.05 * SR)), 900) * np.exp(-np.arange(int(.05 * SR)) / (.008 * SR)) * .25, t + j * d / 9, 1, -.3 + .07 * j)
        elif k == 'hat': add(st, tink() * .7, t, 1, .4)
        elif k == 'glint': add(st, shimmer(), t, 1, .25)
    return st
if __name__ == '__main__':
    master(os.path.join(HERE, 'final_mix.wav'), N, music(), sfx(), os.path.join(HERE, 'narration.wav'), music_rel=-11, sfx_rel=-17, duck_db=10)
