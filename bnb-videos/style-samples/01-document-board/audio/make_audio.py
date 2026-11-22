"""STYLE 01 document board: original synthesized score + foley + mix (no samples).
Briefing-room ensemble: walking bass, light kit, wood block, mallet stabs on the stamp and the verdict.
Run: /root/lemo-opuscar/.venv/bin/python audio/make_audio.py  -> audio/final_mix.wav
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import synth_audio_lib as A
from synth_audio_lib import SR, add, hz, lp, hp, bp, t_, norm, fade_edges

DUR = 10.0
N = int(DUR * SR)
rng = np.random.default_rng(101)
BEAT = 0.625; OFF = 0.06           # 96 BPM, grid placed so beat 9 lands on the stamp (5.685 s)
def B(k): return OFF + k * BEAT


def wood(v=1.0, f=1150):
    tt = t_(.09)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .018) + .4 * np.sin(2 * np.pi * f * 2.7 * tt) * np.exp(-tt / .008)
    return fade_edges(x * v, .0003, .01)


def snare_brush(v=1.0):
    tt = t_(.22)
    return fade_edges(bp(rng.standard_normal(len(tt)), 1800, 7000) * np.exp(-tt / .06) * v, .001, .02)


def mallet(m, d=1.4, v=1.0):
    tt = t_(d); f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / tau) for r, a, tau in [(1, 1, .7), (4.0, .18, .09), (10.0, .05, .03)])
    return fade_edges(x * v, .001, .05)


def music():
    st = np.zeros((N + SR * 2, 2))
    chords = [(50, [62, 65, 69, 72]), (55, [62, 65, 67, 71]), (48, [60, 64, 67, 71]), (57, [60, 64, 67, 69])]  # Dm7 G7 Cmaj7 Am7
    walk = {50: [50, 53, 55, 57], 55: [55, 53, 52, 50], 48: [48, 50, 52, 55], 57: [57, 55, 53, 52]}
    for bar in range(4):
        root, ch = chords[bar]
        for k in range(4):
            beat = bar * 4 + k
            add(st, A.bass_note(walk[root][k] - 12 + 12, BEAT * .85, .55), B(beat), .9, -.1)
            if beat < 16:
                add(st, A.soft_kick(.7 if k in (0, 2) else .35), B(beat), .55)
                if k in (1, 3): add(st, snare_brush(.35), B(beat), .5, .2)
                add(st, A.shaker(.5), B(beat + .5), .25, .35)
                if k == 3: add(st, wood(.5), B(beat + .5), .35, -.4)
        # soft mallet comp on beats 1 & 3 (and-of)
        for k in (0.5, 2.5):
            for j, m in enumerate(ch):
                add(st, mallet(m, .7, .12), B(bar * 4 + k) + j * .012, .5, -.3 + .2 * j)
    # stabs: the stamp (beat 9) and the verdict
    for m in (50, 57, 62, 65):
        add(st, mallet(m + 12, 1.8, .35), B(9), .6, 0)
    for m in (48, 55, 60, 64, 67):
        add(st, mallet(m + 12, 2.6, .3), 7.26, .6, 0)
    add(st, A.bass_note(36, 2.0, .7), 7.26, .9)
    # end: let it ring, fade
    st = A.reverb(st[:N], size=.35, mix=.18)
    env = np.ones(N); f0 = int(8.6 * SR); env[f0:] = np.linspace(1, 0, N - f0) ** 1.5
    return st * env[:, None]


def thump(v=1.0):
    tt = t_(.25)
    body = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-tt / .02)) / SR) * np.exp(-tt / .07)
    return fade_edges(norm(body + A.s_paper(.25)[:len(tt)] * .6) * v, .0005, .02)


def squeak(d=.45):
    """felt-tip highlighter on paper: band noise + faint squeaky tone"""
    tt = t_(d)
    x = bp(rng.standard_normal(len(tt)), 2000, 6500) * (.6 + .4 * np.sin(2 * np.pi * 14 * tt) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(1700 + 250 * np.sin(2 * np.pi * 3 * tt)) / SR) * .12
    env = np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .06)
    return fade_edges(norm((x + tone) * env), .003, .02)


def sfx():
    st = np.zeros((N + SR, 2))
    cues = json.load(open(os.path.join(HERE, 'sfx_cues.json')))
    for c in cues:
        t, g = c['t'], c['gain']
        k = c['type']
        if k == 'pop': add(st, thump(), t, .8 * g, -.1)
        elif k == 'pencil': add(st, A.s_scribble(c.get('dur', .5)), t, .45 * g, .2)
        elif k == 'marker': add(st, squeak(.45), t, .55 * g, .1)
        elif k == 'slide': add(st, A.s_swish(.45, 900, 3000), t, .35 * g, -.2)
        elif k == 'whoosh': add(st, A.s_whoosh(.55, 250, 1600), t, .22 * g)
        elif k == 'stamp': add(st, A.s_stamp(), t, 1.0, 0)
    # room tone: air-con bed
    room = lp(rng.standard_normal(N), 400) * .02
    st[:N, 0] += room; st[:N, 1] += np.roll(room, 777)
    return st[:N]


if __name__ == '__main__':
    A.master(os.path.join(HERE, 'narration.wav'), music(), sfx(), os.path.join(HERE, 'final_mix.wav'), DUR,
             music_lu=-11, sfx_lu=-13, duck_db=9.0)
