"""STYLE 07 data editorial: original synthesized bed + sonification + mix (dataviz palette: soft kick, noise shaker,
detuned pad, low-pass-gate 'plonk' per loan release (pitch = level), small weekly blips for the bills line,
a half-beat of silence before the gap, then one low accent).
Run: /root/lemo-opuscar/.venv/bin/python audio/make_audio.py -> audio/final_mix.wav
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import synth_audio_lib as A
from synth_audio_lib import SR, add, hz, lp, hp, bp, t_, norm, fade_edges

DUR = 10.0; N = int(DUR * SR)
rng = np.random.default_rng(707)
TIM = json.load(open(os.path.join(HERE, '..', 'timing.json'))); L = TIM['lines']
def wt(li, w): return next(x['s'] for x in L[li]['words'] if x['w'].lower().strip(',.?').startswith(w))
T_GAP, T_PLAN = wt(2, 'gap'), wt(2, 'plan')
BEAT = 60 / 100.0


def plonk(m, v=.6, idx=1.0):
    tt = t_(.9); f = hz(m)
    mod = np.sin(2 * np.pi * f * 2 * tt) * idx * np.exp(-tt / .08)
    x = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / .28)
    return fade_edges(lp(x, 2500) * v, .001, .05)


def saw_pad(ms, d):
    tt = t_(d); out = np.zeros(len(tt))
    for m in ms:
        for det in (-.12, .12):
            f = hz(m + det); ph = (f * tt) % 1.0; out += (2 * ph - 1) * .2
    env = np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .8)
    return lp(out, 900) * env


def music():
    st = np.zeros((N + 2 * SR, 2))
    pad = saw_pad([50, 57, 62, 65], DUR) * .5
    gate = np.ones(N)
    s0, s1 = int((T_GAP - .45) * SR), int((T_GAP - .02) * SR)   # silence before the gap
    gate[s0:s1] = np.linspace(1, 0, s1 - s0) ** 3 * 0 + 0.0
    gate[s0 - 2400:s0] = np.linspace(1, 0, 2400)
    st[:N, 0] += pad * gate; st[:N, 1] += np.roll(pad, 300) * gate
    nb = int(DUR / BEAT)
    for b in range(nb):
        t0 = .15 + b * BEAT
        if T_GAP - .5 < t0 < T_GAP - .02: continue
        add(st, A.soft_kick(.6 if b % 2 == 0 else .3), t0, .5)
        add(st, A.shaker(.5), t0 + BEAT / 2, .22, .3)
    add(st, A.bass_note(38, 2.5, .8), T_GAP, .9)
    add(st, saw_pad([46, 53, 58, 62], 3.2)[:, None].repeat(2, 1).mean(1), T_GAP, .35)
    st = A.reverb(st[:N], size=.35, mix=.15)
    env = np.ones(N); f0 = int(8.8 * SR); env[f0:] = np.linspace(1, 0, N - f0) ** 1.4
    return st * env[:, None]


def sfx():
    st = np.zeros((N + SR, 2))
    # loan releases: one plonk per step, pitch rises with the level (pentatonic), index rises (wood -> metal)
    t0, t1 = wt(0, 'loan') - .15, L[0]['end'] - .05
    for k, (x, m) in enumerate([(0.30, 62), (0.52, 66), (0.74, 69), (0.95, 74)]):
        add(st, plonk(m, .7, .6 + .5 * k), t0 + (t1 - t0 + .1) * x, .8, -.3 + .2 * k)
    # bills: a quiet tick each "week" as the line draws
    b0, b1 = L[1]['start'], L[1]['end']
    for i in range(1, 40):
        tt = b0 + (b1 - b0) * (i / 40) ** 0.9
        add(st, A.s_tick(2600 + 15 * i), tt, .18, .2)
    add(st, A.s_swish(.5, 1200, 5000), wt(0, 'loan') - .2, .2)          # ruler hiss as the axes settle
    add(st, A.s_swish(.6, 900, 3000, rise=False), T_PLAN, .25)          # paper sweep: the fill wipes in
    add(st, A.s_stamp() * .6, T_GAP + .02, .6)                           # the gap lands
    return st[:N]


if __name__ == '__main__':
    A.master(os.path.join(HERE, 'narration.wav'), music(), sfx(), os.path.join(HERE, 'final_mix.wav'), DUR,
             music_lu=-12, sfx_lu=-15, duck_db=10.0)
