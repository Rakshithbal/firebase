"""R12 Paper Trail · encumbrance certificate: original synthesized score + paper foley + master (no samples).
Briefing-room ensemble from style 01 (walking bass, light kit, wood block, mallet comp), stretched to the reel;
the beat grid is placed so a downbeat lands on the single STOP. ASK WHY. stamp (the film's one slam).
Run: /root/lemo-opuscar/.venv/bin/python audio/make_audio.py   (after render.py --cues)  -> audio_michael/final_mix.wav
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(PROJ, '..', 'style-samples', 'tools'))
import synth_audio_lib as A
from synth_audio_lib import SR, add, hz, lp, hp, bp, t_, norm, fade_edges

TIM = json.load(open(os.path.join(PROJ, 'timing_michael.json')))
DUR = TIM['total']
N = int(round(DUR * SR))
LN = {l['id']: l for l in TIM['lines']}
CUES = json.load(open(os.path.join(HERE, 'sfx_cues.json')))
T_STAMP = [c['t'] for c in CUES if c['type'] == 'stamp'][0]
rng = np.random.default_rng(112)
BEAT = 0.625                                   # 96 BPM
OFF = T_STAMP % (4 * BEAT)                     # stamp lands on a bar downbeat
def B(k): return OFF + k * BEAT
STAMP_BEAT = round((T_STAMP - OFF) / BEAT)


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
    st = np.zeros((N + SR * 3, 2))
    chords = [(50, [62, 65, 69, 72]), (55, [62, 65, 67, 71]), (48, [60, 64, 67, 71]), (57, [60, 64, 67, 69])]  # Dm7 G7 Cmaj7 Am7
    walk = {50: [50, 53, 55, 57], 55: [55, 53, 52, 50], 48: [48, 50, 52, 55], 57: [57, 55, 53, 52]}
    t_adv = LN['L06']['start']; t_end = LN['L08']['start']
    nbars = int((DUR - OFF) / (4 * BEAT)) + 1
    for bar in range(-1, nbars):
        root, ch = chords[bar % 4]
        for k in range(4):
            beat = bar * 4 + k
            tb = B(beat)
            if tb < 0 or tb > t_end:
                continue
            calm = tb >= t_adv                         # after the stamp: hand-off, softer, no kit
            add(st, A.bass_note(walk[root][k], BEAT * .85, .5 if calm else .55), tb, .9, -.1)
            if tb > 1.2 and not calm and beat < STAMP_BEAT:
                add(st, A.soft_kick(.7 if k in (0, 2) else .35), tb, .5)
                if k in (1, 3): add(st, snare_brush(.35), tb, .45, .2)
                add(st, A.shaker(.5), tb + BEAT / 2, .22, .35)
                if k == 3: add(st, wood(.5), tb + BEAT / 2, .3, -.4)
        for k in (0.5, 2.5):
            tb = B(bar * 4 + k)
            if 0 <= tb <= t_end:
                for j, m in enumerate(ch):
                    add(st, mallet(m, .7, .12), tb + j * .012, .5, -.3 + .2 * j)
    for m in (50, 57, 62, 65):                        # stab on the stamp
        add(st, mallet(m + 12, 1.8, .35), T_STAMP, .6, 0)
    add(st, A.bass_note(38, 1.6, .7), T_STAMP, .9)
    for m in (48, 55, 60, 64, 67):                    # resolve on "Save this"
        add(st, mallet(m + 12, 3.2, .3), t_end + 0.05, .6, 0)
    add(st, A.bass_note(36, 2.6, .6), t_end + 0.05, .9)
    st = A.reverb(st[:N], size=.35, mix=.18)
    env = np.ones(N); f0 = int((DUR - 2.0) * SR); env[f0:] = np.linspace(1, 0, N - f0) ** 1.5
    return st * env[:, None]


def thump(v=1.0):
    tt = t_(.25)
    body = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-tt / .02)) / SR) * np.exp(-tt / .07)
    return fade_edges(norm(body + A.s_paper(.25)[:len(tt)] * .6) * v, .0005, .02)


def squeak(d=.45):
    tt = t_(d)
    x = bp(rng.standard_normal(len(tt)), 2000, 6500) * (.6 + .4 * np.sin(2 * np.pi * 14 * tt) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(1700 + 250 * np.sin(2 * np.pi * 3 * tt)) / SR) * .12
    env = np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .06)
    return fade_edges(norm((x + tone) * env), .003, .02)


def sfx():
    st = np.zeros((N + SR, 2))
    for c in CUES:
        t, g, k = c['t'], c['gain'], c['type']
        if k == 'pop': add(st, thump(), t, .8 * g, -.1)
        elif k == 'pencil': add(st, A.s_scribble(c.get('dur', .5)), t, .45 * g, .2)
        elif k == 'marker': add(st, squeak(.45), t, .5 * g, .1)
        elif k == 'slide': add(st, A.s_swish(.45, 900, 3000), t, .35 * g, -.2)
        elif k == 'whoosh': add(st, A.s_whoosh(.55, 250, 1600), t, .22 * g)
        elif k == 'stamp': add(st, A.s_stamp(), t, 1.0, 0)
        elif k == 'tick': add(st, A.s_scribble(.22), t, .5 * g, .25)
    room = lp(rng.standard_normal(N), 400) * .02
    st[:N, 0] += room; st[:N, 1] += np.roll(room, 777)
    return st[:N]


if __name__ == '__main__':
    out = os.path.join(PROJ, 'audio_michael', 'final_mix.wav')
    A.master(os.path.join(PROJ, 'audio_michael', 'narration.wav'), music(), sfx(), out, DUR,
             music_lu=-12, sfx_lu=-14, duck_db=9.0)
