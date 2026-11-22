#!/usr/bin/env python3
"""05 Instruction Manual (wordless) -- a tidy counting ensemble (pizz bass, kalimba, music-box glock, one note per landing),
stops dead before the red X, near-silence and one chime at the end; plaster knocks (hollow rings, solid thuds), stamps,
chalk, trowel scrape, roller and paper slides from the page's cue list (ev.json). -14 LUFS, TP <= -1.5 dBTP."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../tools'))
from mixlib import *
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
N = 10 * SR; rng = np.random.default_rng(505); EVS = json.load(open(os.path.join(PROJ, 'ev.json')))
BEAT = 60 / 108
def gate(t):  # music mute windows: dead stop before the X, near-silence before the final chime
    g = np.ones(N); tt = np.arange(N) / SR
    for a, b in [(4.32, 4.62), (9.25, 10)]:
        g *= 1 - np.clip((tt - a) / .03, 0, 1) * np.clip((b - tt) / .12, 0, 1)
    return g
def music():
    st = np.zeros((N, 2)); b = 0.0
    bass = ['C3', 'G2', 'A2', 'E2', 'F2', 'C3', 'G2', 'G2']
    while b * BEAT < 9.3:
        t = b * BEAT; bar = int(b // 4)
        if b % 2 == 0: add(st, pl('upright_bass_pizz', bass[bar % 8], None, .6), t, .8, -.15)
        add(st, pl('kalimba', ['E5', 'G5', 'C6', 'G5'][int(b) % 4], None, .32), t + BEAT * .5, .32, .3)
        b += 1
    # one bright note per landing, rising through the chord
    lands = [1.15, 1.62, 1.98, 2.34, 3.3, 3.85, 4.65, 4.9, 5.6, 6.05, 6.75, 7.3, 8.5, 8.95, 9.0]
    notes = ['C5', 'E5', 'G5', 'C6', 'D5', 'F5', 'A5', 'C6', 'E5', 'G5', 'B5', 'C5', 'E5', 'G5', 'C6']
    for t, n in zip(lands, notes): add(st, pl('music_box', n, None, .45), t, .45, .2)
    st = reverb(st, 1.3, .2)
    return st * gate(None)[:, None]
def knock(kind):
    n = int(.9 * SR); tt = np.arange(n) / SR; cl = lp(rng.standard_normal(n), 3000) * np.exp(-tt / .004) * .5
    if kind == 'knock_hollow':
        y = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in [(310, 1, .22), (520, .6, .16), (790, .4, .1), (1210, .2, .06)])
        y += bp(rng.standard_normal(n), 500, 1800) * np.exp(-tt / .12) * .25 * (1 + np.sin(2 * np.pi * 31 * tt))  # loose plaster rattle
        return fade(y * .55 + cl, .0005, .05)
    if kind == 'knock_solid':
        y = lp(rng.standard_normal(n), 220, 3) * np.exp(-tt / .02) * 6 + np.sin(2 * np.pi * 120 * tt) * np.exp(-tt / .03)
        return fade(y * .8 + cl * .5, .0005, .05)[:int(.25 * SR)]
    y = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in [(240, 1, .07), (430, .5, .05)])
    return fade(y * .6 + cl, .0005, .05)[:int(.4 * SR)]
def stamp():
    n = int(.25 * SR); tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * (90 + 60 * np.exp(-tt / .01)) * tt) * np.exp(-tt / .04) + bp(rng.standard_normal(n), 600, 3500) * np.exp(-tt / .015) * .5
    return fade(y * .8)
def noise_ev(d, lo, hi, mod_hz=0, depth=0, a=.02, r=.06):
    n = int(d * SR); tt = np.arange(n) / SR; y = bp(rng.standard_normal(n), lo, hi)
    if mod_hz: y *= 1 - depth + depth * (.5 + .5 * np.sin(2 * np.pi * mod_hz * tt)) ** 2
    env = np.minimum(1, tt / a) * np.minimum(1, (d - tt) / r); return y * env
def sfx():
    st = np.zeros((N, 2))
    for e in EVS:
        k, t, d = e['kind'], e['t'], e.get('d', .3)
        if k.startswith('knock'): add(st, knock(k), t, 1.0 if k != 'knock' else .8, -.1)
        elif k.startswith('stamp'): add(st, stamp(), t, .7, .1)
        elif k == 'chalk': add(st, noise_ev(d, 2200, 7000, 9, .7) * .35, t, 1, .1)
        elif k == 'scrape': add(st, noise_ev(d, 700, 3200, 4.4, .8) * .45, t, 1, -.1)
        elif k == 'roll': add(st, lp(noise_ev(d, 120, 1400, 11, .5), 900) * .7, t, 1, .15)
        elif k == 'slide': add(st, noise_ev(.3, 1500, 6000, 0, 0, .12, .15) * .2, t - .05, 1, .3)
        elif k == 'pan': add(st, noise_ev(d + .1, 400, 2500, 0, 0, d * .5, d * .5) * .12, t, 1, 0)
        elif k == 'end':
            add(st, pl('music_box', 'C6', None, .5), t, .9, 0); add(st, pl('harp', 'C5', None, .4), t, .55, 0)
    return reverb(st, .9, .12, damp=.6)
if __name__ == '__main__':
    master(os.path.join(HERE, 'final_mix.wav'), N, music(), sfx(), None, sfx_rel=-1)
