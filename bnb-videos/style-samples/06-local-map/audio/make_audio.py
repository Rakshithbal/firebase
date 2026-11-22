"""STYLE 06 local map: original synthesized score + foley + mix (map-explainer palette: plucked low strings pulse,
harp for air, a chime for each thing that lights up, frame drum on downbeats, low sine pedal; whoosh on the dive).
Run: /root/lemo-opuscar/.venv/bin/python audio/make_audio.py -> audio/final_mix.wav
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import synth_audio_lib as A
from synth_audio_lib import SR, add, hz, lp, hp, bp, t_, norm, fade_edges

DUR = 10.0; N = int(DUR * SR)
rng = np.random.default_rng(606)
TIM = json.load(open(os.path.join(HERE, '..', 'timing.json')))
def wt(li, w):
    return next(x['s'] for x in TIM['lines'][li]['words'] if x['w'].lower().strip(',.?').startswith(w))
T_PLOT, T_ROAD, T_DRAIN, T_APPR = wt(0, 'plot'), wt(1, 'road'), wt(1, 'drain'), wt(1, 'approvals')
L2_END = TIM['lines'][1]['end']
BEAT = 60 / 84.0


def pl(preset, m, d, v):
    return A.P.pluck(preset, float(m), d, vel=v).astype(np.float64)


def frame_drum(v=1.0):
    tt = t_(.5); f = 70 + 40 * np.exp(-tt / .04)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .18) + bp(rng.standard_normal(len(tt)), 200, 900) * np.exp(-tt / .03) * .3
    return fade_edges(x * v, .001, .03)


def music():
    st = np.zeros((N + 3 * SR, 2))
    # low sine pedal (D) with 2nd/3rd harmonics
    tt = t_(DUR); f0 = hz(38)
    ped = (np.sin(2 * np.pi * f0 * tt) + .35 * np.sin(4 * np.pi * f0 * tt) + .15 * np.sin(6 * np.pi * f0 * tt)) * .22
    ped *= np.minimum(1, tt / 1.0)
    st[:N, 0] += ped; st[:N, 1] += ped
    prog = [[50, 57, 62], [50, 57, 62], [46, 53, 58], [48, 55, 60], [50, 57, 62], [45, 52, 57], [46, 53, 58], [50, 57, 62]]
    nb = int(DUR / BEAT) + 1
    for b in range(nb):
        t0 = b * BEAT
        ch = prog[(b // 4) % len(prog)] if b < 4 else prog[(b // 2) % len(prog)]
        # pizz pulse on 8ths (lighter under the dive)
        for k in range(2):
            m = ch[0] - 12 if k == 0 else ch[1] - 12
            add(st, pl('upright_bass_pizz', m, .4, .55 if k == 0 else .35), t0 + k * BEAT / 2, .5, -.2)
        if b % 4 == 0: add(st, frame_drum(.8), t0, .45)
        if b % 2 == 1: add(st, pl('harp', ch[2] + 12, 1.2, .35), t0 + BEAT / 2, .28, .4)
    # harp arpeggio on the pin drop, and a rising arp for the end checklist
    for j, m in enumerate([62, 69, 74, 78]):
        add(st, pl('harp', m, 1.5, .5), T_PLOT + .05 + j * .07, .35, -.3 + .2 * j)
    for j, m in enumerate([62, 66, 69, 74, 78, 81]):
        add(st, pl('harp', m, 2.0, .5), L2_END + .3 + j * .09, .32, -.3 + .12 * j)
    st = A.reverb(st[:N], size=.55, mix=.25)
    env = np.ones(N); f0i = int(8.7 * SR); env[f0i:] = np.linspace(1, 0, N - f0i) ** 1.4
    return st * env[:, None]


def ignite():
    tt = t_(1.0)
    sub = np.sin(2 * np.pi * np.cumsum(48 + 30 * np.exp(-tt / .1)) / SR) * np.exp(-tt / .35)
    sh = A.s_shimmer(1.0)[:len(tt)] * .35
    return fade_edges(norm(sub + sh), .002, .1)


def sfx():
    st = np.zeros((N + SR, 2))
    # thin high air that thickens as the camera comes down
    air = bp(rng.standard_normal(N), 2500, 9000) * .012
    lowair = lp(rng.standard_normal(N), 500) * np.clip((np.arange(N) / SR - 2.6) / 1.2, 0, 1) * np.clip((L2_END + 0.5 - np.arange(N) / SR), 0.3, 1) * .03
    st[:N, 0] += air + lowair; st[:N, 1] += np.roll(air, 999) + lowair
    add(st, ignite(), 0.0, .6)
    add(st, A.s_drop(700, 1500), T_PLOT + .25, .7, .1)                  # pin lands
    add(st, A.s_stamp() * .5, T_PLOT + .28, .4)
    add(st, A.s_whoosh(1.0, 200, 1400), 2.75, .5)                       # the dive
    for t, m, pan in ((T_ROAD, 86, -.3), (T_DRAIN, 89, .3), (T_APPR, 93, 0)):
        add(st, A.s_chime(m, 1.2), t, .55, pan)                         # each ring lights up
        add(st, A.s_tick(), t + .2, .35, pan)
    add(st, A.s_whoosh(.8, 300, 1800), L2_END - .2, .35)                # pull back
    for j in range(3):
        add(st, A.s_click(2200 + 300 * j), L2_END + .3 + j * .12, .4, -.4 + .4 * j)
    return st[:N]


if __name__ == '__main__':
    A.master(os.path.join(HERE, 'narration.wav'), music(), sfx(), os.path.join(HERE, 'final_mix.wav'), DUR,
             music_lu=-11, sfx_lu=-14, duck_db=9.0)
