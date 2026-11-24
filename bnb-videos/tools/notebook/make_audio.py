#!/usr/bin/env python3
"""Engineer's-notebook reels: original synthesized bed + felt-marker foley from the page's own events, mixed under the Kokoro VO.
Grown from style-samples/04-engineers-notebook/audio/make_audio.py (pizz bass walk, woody staccato reed, shaker, harp where orange lands).
usage: /root/lemo-opuscar/.venv/bin/python tools/notebook/make_audio.py <reel_dir> <key: G|C>
reads  <reel_dir>/timing.json, <reel_dir>/ev.json (dumped by render.mjs --ev), <reel_dir>/audio/narration.wav
writes <reel_dir>/audio/music.wav, sfx.wav, final_mix.wav  (-14 LUFS integrated, true peak <= -1.5 dBTP, 48 kHz stereo)"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../style-samples/tools'))
from mixlib import *
import soundfile as sf
PROJ = os.path.abspath(sys.argv[1]); KEY = sys.argv[2] if len(sys.argv) > 2 else 'G'
AUD = os.path.join(PROJ, 'audio')
T = json.load(open(os.path.join(PROJ, 'timing.json'))); EVS = json.load(open(os.path.join(PROJ, 'ev.json')))
DUR = T['total']; N = int(round(DUR * SR)); rng = np.random.default_rng(808 if KEY == 'G' else 1313)
SLAM = next(e['t'] for e in EVS if e['kind'] == 'slam'); LOGO = next(e['t'] for e in EVS if e['kind'] == 'logo')
nb = max(4, int(round(SLAM / .625 / 4)) * 4); BEAT = SLAM / nb          # the slam lands on a downbeat
def B(b): return b * BEAT
# chord loop (one bar each): roots for bass walk, triad for harp / reed
PROG = {'G': [('G2', [55, 59, 62]), ('E2', [52, 55, 59]), ('C3', [48, 52, 55]), ('D2', [50, 54, 57])],
        'C': [('C3', [48, 52, 55]), ('A2', [45, 48, 52]), ('F2', [41, 45, 48]), ('G2', [43, 47, 50])]}[KEY]
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
def nm(m): return f'{NAMES[m % 12]}{m // 12 - 1}'

def reed(m, d, vel=.5):
    t = t_(d + .08); f = hz(m); y = sum((1 / k) * np.sin(2 * np.pi * f * k * t) for k in (1, 3, 5, 7))
    env = np.minimum(1, t / .025) * np.exp(-t / (d * .6)); return fade(lp(y * env * vel * .25, 2600), .001, .02)
def shaker(v=1.):
    n = rng.standard_normal(int(.09 * SR)); e = np.exp(-np.arange(len(n)) / SR / .025) * np.minimum(1, np.arange(len(n)) / (.008 * SR))
    return bp(n * e, 5000, 11000) * v * .12
def kick(v=1.):
    t = t_(.5); f = 55 + 70 * np.exp(-t / .03); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16); return fade(y * v, .001, .05)

def music():
    st = np.zeros((N, 2)); nbar = int(np.ceil(DUR / B(4)))
    end_bar = int(LOGO // B(4))
    for bar in range(nbar):
        root, tri = PROG[bar % 4]; r = tri[0] - 12
        t0 = B(bar * 4)
        if t0 > LOGO + .1: break
        walk = [r, tri[1] - 12, tri[2] - 12, r + 12 if bar % 2 else tri[1] - 12]
        for k, m in enumerate(walk): add(st, pl('upright_bass_pizz', nm(m), None, .7 if k == 0 else .5), t0 + B(k) + .02, .9, -.1)
        if bar % 2 == 1:   # sparse reed answer, every other bar
            for m, b in [(tri[2] + 12, 1.5), (tri[1] + 12, 2), (tri[0] + 12, 3.5)]: add(st, reed(m, .16, .42), t0 + B(b), .8, .25)
        for b in np.arange(0, 4, .5): add(st, shaker(1 if b % 1 == 0 else .55), t0 + B(b) + .01, 1, .35)
    # harp where orange lands (first orange stroke per page)
    seen = []
    for e in EVS:
        if e['col'] != 'o' or e['kind'] in ('slam', 'logo'): continue
        if any(abs(e['t'] - s) < 1.2 for s in seen): continue
        seen.append(e['t']); bar = int(e['t'] // B(4)); tri = PROG[bar % 4][1]
        for i, m in enumerate([tri[0] + 12, tri[1] + 12, tri[2] + 12]): add(st, pl('harp', nm(m), None, .42), e['t'] + i * .06, .5, -.2 + i * .2)
    # pre-slam drop: everything gates out for the last beat before the slam, then a hit on the downbeat
    g = np.ones(N); a, b = int((SLAM - B(1)) * SR), int((SLAM - .01) * SR); g[a:b] = np.linspace(1, .08, b - a) ** 2; st *= g[:, None]
    tri = PROG[int(SLAM // B(4)) % 4][1]
    add(st, kick(1.), SLAM + .1, 1.0, 0); add(st, pl('upright_bass_pizz', nm(tri[0] - 12), None, .9), SLAM + .1, 1.1, 0)
    for i, m in enumerate(tri): add(st, pl('harp', nm(m + 12), None, .6), SLAM + .1 + i * .02, .6, -.3 + i * .3)
    # end card: resolving tonic arpeggio + music box on the logo, then let it ring
    tonic = PROG[0][1]
    for i, m in enumerate([tonic[0] + 12, tonic[1] + 12, tonic[2] + 12, tonic[0] + 24]): add(st, pl('harp', nm(m), None, .55), LOGO + i * .07, .7, -.25 + i * .15)
    add(st, pl('upright_bass_pizz', nm(tonic[0] - 12), None, .7), LOGO, .9, -.1)
    add(st, pl('music_box', nm(tonic[2] + 24), None, .4), LOGO + .3, .25, .3)
    return reverb(st, 1.4, .22)

def sfx():
    st = np.zeros((N, 2))
    for e in EVS:
        t, d, k, x = e['t'], max(.05, e['d']), e['kind'], e.get('x', .5) * 1.6 - .8
        n = int((d + .05) * SR); tt = np.arange(n) / SR; z = rng.standard_normal(n)
        if k == 'write':
            mod = .35 + .65 * np.abs(np.sin(np.pi * tt * 13)) ** 1.5
            y = bp(z, 900, 3600) * mod * np.minimum(1, tt / .02) * np.minimum(1, (d - tt).clip(0) / .05) * .3
        elif k == 'flip':   # page lifts off the pad: airy swish + paper rustle + a soft flap at the end
            sw = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
            y = (bp(z, 400, 2500) * .7 + bp(rng.standard_normal(n), 2500, 7000) * .25 * (rng.random(n) < .3)) * sw * .55
            fl = lp(rng.standard_normal(int(.06 * SR)), 300) * np.exp(-np.arange(int(.06 * SR)) / (.012 * SR)) * .5; add(st, fl, t + d * .8, .6, 0)
        elif k == 'slam':   # rubber stamp hitting paper on the desk
            th = lp(rng.standard_normal(int(.25 * SR)), 180, 3) * np.exp(-np.arange(int(.25 * SR)) / (.05 * SR)) * 3.2
            sm = bp(rng.standard_normal(int(.08 * SR)), 800, 4000) * np.exp(-np.arange(int(.08 * SR)) / (.015 * SR)) * .9
            add(st, th, t + .12, 1, 0); add(st, sm, t + .12, 1, 0); continue
        elif k == 'logo':
            continue
        else:   # marker stroke: hiss brightening with speed, paper tooth, a "tok" at touch-down; highlighter is broader and softer
            sp = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** .7
            tooth = 1 + .5 * bp(rng.standard_normal(n), 30, 120) * 8
            y = (bp(z, 700, 2400) * .6 + bp(z, 2400, 5200) * .4 * sp) * sp * np.clip(tooth, .3, 2) * (.45 if e.get('col') == 'k' else .4)
            if k == 'hl': y = lp(y, 1800) * 1.4
            if k == 'cross': y *= 1.2
            tk = lp(rng.standard_normal(int(.03 * SR)), 500) * np.exp(-np.arange(int(.03 * SR)) / (.005 * SR)) * .5
            add(st, tk, t, .5, x)
            if k == 'tick':
                sq = np.sin(2 * np.pi * (1900 + 300 * tt) * tt) * np.exp(-((tt - d * .65) / .03) ** 2) * .06; y = y + sq
        add(st, fade(y, .004, .02), t, 1, x)
    return st

if __name__ == '__main__':
    m, s = music(), sfx()
    sf.write(os.path.join(AUD, 'music.wav'), (m / (np.abs(m).max() + 1e-9) * .5).astype(np.float32), SR)
    sf.write(os.path.join(AUD, 'sfx.wav'), (s / (np.abs(s).max() + 1e-9) * .5).astype(np.float32), SR)
    print('slam', SLAM, 'beat', round(BEAT, 4), 'logo', LOGO)
    master(os.path.join(AUD, 'final_mix.wav'), N, m, s, os.path.join(AUD, 'narration.wav'), music_rel=-12, sfx_rel=-16, duck_db=10)
