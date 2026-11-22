#!/usr/bin/env python3
"""04 Engineer's Notebook -- original bed (pizz bass walk, woody staccato reed, shaker, harp where red lands) + felt-marker foley from
the page's own pen-down events (ev.json). Mix ducked under the Kokoro VO, -14 LUFS, TP <= -1.5 dBTP."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../tools'))
from mixlib import *
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
N = 10 * SR; rng = np.random.default_rng(404)
BEAT = 8.05 / 13          # the resolving chord lands on the red tick (8.05 s)
def B(b): return b * BEAT

def reed(m, d, vel=.5):     # staccato clarinet-ish: odd harmonics, soft attack, short
    t = t_(d + .08); f = hz(m); y = sum((1 / k) * np.sin(2 * np.pi * f * k * t) for k in (1, 3, 5, 7))
    env = np.minimum(1, t / .025) * np.exp(-t / (d * .6)); return fade(lp(y * env * vel * .25, 2600), .001, .02)
def shaker(v=1.):
    n = rng.standard_normal(int(.09 * SR)); e = np.exp(-np.arange(len(n)) / SR / .025) * np.minimum(1, np.arange(len(n)) / (.008 * SR))
    return bp(n * e, 5000, 11000) * v * .12

def music():
    st = np.zeros((N, 2))
    # bass walk (G major, the bar 4 chord hangs on D sus until the tick)
    walk = [('G2', 0), ('B2', 1), ('D3', 2), ('E3', 3), ('E2', 4), ('G2', 5), ('B2', 6), ('A2', 7), ('C3', 8), ('E3', 9), ('G2', 10), ('A2', 11), ('D2', 12), ('G2', 13), ('D3', 14), ('G2', 15)]
    for p, b in walk: add(st, pl('upright_bass_pizz', p, None, .7 if b % 4 == 0 else .5), B(b) + .02, .9, -.1)
    # reed staccato figure, sparse; question hangs on an unresolved 4th, answer resolves to the 3rd
    fig = [(67, 1.5), (71, 2), (74, 3.5), (72, 5.5), (71, 6), (69, 7.5), (67, 9.5), (69, 10), (72, 11.5), (74, 12)]
    for m, b in fig: add(st, reed(m, .16, .45), B(b), .8, .25)
    for b in np.arange(0, 16, .5): add(st, shaker(1 if b % 1 == 0 else .55), B(b) + .01, 1, .35)
    # harp where red lands: the red "?" (3.42) a suspended dyad; the red tick (8.05) the resolving arpeggio
    for i, p in enumerate(['A4', 'D5']): add(st, pl('harp', p, None, .45), 3.44 + i * .07, .55, -.2)
    for i, p in enumerate(['G4', 'B4', 'D5', 'G5']): add(st, pl('harp', p, None, .55), 8.05 + i * .065, .7, -.25 + i * .15)
    add(st, pl('music_box', 'B5', None, .4), 8.05, .25, .3)
    # end: sustain chord fades
    st = reverb(st, 1.4, .22)
    return st

def sfx():
    st = np.zeros((N, 2)); ev = json.load(open(os.path.join(PROJ, 'ev.json')))
    for e in ev:
        t, d, k, x = e['t'], max(.05, e['d']), e['kind'], e.get('x', .5) * 1.6 - .8
        n = int((d + .05) * SR); tt = np.arange(n) / SR; z = rng.standard_normal(n)
        if k == 'write':        # felt tip lettering: choppy, a bump per glyph
            mod = .35 + .65 * np.abs(np.sin(np.pi * tt * 13)) ** 1.5
            y = bp(z, 900, 3600) * mod * np.minimum(1, tt / .02) * np.minimum(1, (d - tt).clip(0) / .05) * .35
        else:                   # a marker stroke: soft hiss brightening with speed, paper tooth, a "tok" at touch-down
            sp = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** .7
            tooth = 1 + .5 * bp(rng.standard_normal(n), 30, 120) * 8
            y = (bp(z, 700, 2400) * .6 + bp(z, 2400, 5200) * .4 * sp) * sp * np.clip(tooth, .3, 2) * (.5 if e.get('col') == 'k' else .42)
            if k in ('scribble',): y *= 1 + .8 * (np.sin(2 * np.pi * 22 * tt) > 0)
            tk = lp(rng.standard_normal(int(.03 * SR)), 500) * np.exp(-np.arange(int(.03 * SR)) / (.005 * SR)) * .6
            add(st, tk, t, .5, x)
            if k == 'tick':   # a felt-tip squeak on the final fast stroke
                sq = np.sin(2 * np.pi * (1900 + 300 * tt) * tt) * np.exp(-((tt - d * .65) / .03) ** 2) * .08; y = y + sq
        add(st, fade(y, .004, .02), t, 1, x)
    return st

if __name__ == '__main__':
    master(os.path.join(HERE, 'final_mix.wav'), N, music(), sfx(), os.path.join(HERE, 'narration.wav'), music_rel=-12, sfx_rel=-16, duck_db=10)
