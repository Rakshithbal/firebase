"""R16 Mistake of the Week · soil test: original synthesized underscore + SFX + master (no samples).
R05 house palette (felt piano, warm pad, soft pluck pulse). A minor-ish, calm; tension under "swell / shrink" and the
crack, the one slam (stamp) on "harder", and a lift into the major on "So before your foundation is designed" (L06).
Run: /root/lemo-opuscar/.venv/bin/python audio/make_audio.py  -> audio_michael/final_mix.wav (-14 LUFS, TP <= -1.5 dBTP)
"""
import json, os, re, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(PROJ, '..', 'style-samples', 'tools'))
import synth_audio_lib as A
from synth_audio_lib import SR, add, hz, lp, hp, bp, t_, norm, fade_edges

TIM = json.load(open(os.path.join(PROJ, 'timing_michael.json')))
DUR = TIM['total']; N = int(round(DUR * SR))
LN = {l['id']: l for l in TIM['lines']}
rng = np.random.default_rng(1616)


def W(lid, word, nth=0):
    k = 0
    for w in LN[lid]['words']:
        if re.sub(r"[^a-z']", '', w['w'].lower()) == word:
            if k == nth: return w['s']
            k += 1
    raise KeyError(word)


LIFT = LN['L06']['start']          # the "solution" lift
BAR = LIFT / 11                    # 11 bars before the lift  (~2.39 s, ~100 BPM)
BEAT = BAR / 4
CH = {'Am9': (45, [57, 60, 64, 67, 71]), 'Fmaj7': (41, [57, 60, 64, 65]), 'Dm9': (38, [57, 60, 62, 65, 69]),
      'Esus': (40, [57, 59, 64, 69]), 'E7': (40, [56, 59, 62, 68]), 'Cmaj9': (36, [55, 59, 62, 64, 67]),
      'G6': (43, [55, 59, 62, 64]), 'Fmaj9': (41, [55, 57, 60, 64, 67]), 'Am7': (45, [55, 60, 64, 67])}
PROG = ['Am9', 'Fmaj7', 'Am9', 'Dm9', 'Fmaj7', 'Esus', 'Dm9', 'E7', 'Am9', 'Fmaj7', 'Esus',     # bars 0-10
        'Cmaj9', 'G6', 'Fmaj9', 'Cmaj9', 'Am7', 'Fmaj9', 'Cmaj9']                               # lift, bars 11-17


def music():
    st = np.zeros((N + SR * 4, 2))
    end_t = LN['L08']['start']
    nb = len(PROG)
    for b, name in enumerate(PROG):
        t0 = b * BAR
        if t0 > DUR - 1.0: break
        root, notes = CH[name]
        lifted = b >= 11
        pad = A.pad_voice(notes[0], BAR * 1.02, att=.6, rel=1.4, bright=.9 if lifted else .7)
        st_seg = pad * (.22 if lifted else .2)
        s = int(t0 * SR); e = min(len(st), s + len(st_seg)); st[s:e] += st_seg[:e - s]
        for m in notes[1:3]:
            pv = A.pad_voice(m, BAR * 1.02, att=.6, rel=1.4, bright=.7) * .14
            e = min(len(st), s + len(pv)); st[s:e] += pv[:e - s]
        add(st, A.bass_note(root, BAR * .95, .5), t0, .8, -.05)
        # felt piano: broken chord, sparser before the lift
        pat = [(0, 0), (1.5, 2), (2.5, 3)] if not lifted else [(0, 0), (1, 2), (1.5, 3), (2.5, 1), (3, 4 % len(notes))]
        for beat, k in pat:
            add(st, A.felt_piano(notes[k % len(notes)] + 12, BEAT * 1.6, .34 if lifted else .28), t0 + beat * BEAT, .9, -.2 + .1 * k)
        if lifted:
            for k in range(8):
                add(st, A.soft_pluck(notes[(k * 2) % len(notes)] + 12, BEAT * .45, .4), t0 + k * BEAT / 2, .5, .3)
            add(st, A.soft_kick(.55), t0, .45); add(st, A.soft_kick(.35), t0 + 2 * BEAT, .45)
            for k in range(4): add(st, A.shaker(.5), t0 + (k + .5) * BEAT, .18, .35)
    # resolve chord on "Save"
    for j, m in enumerate([48, 55, 60, 64, 67, 71]):
        add(st, A.felt_piano(m + 12, 3.5, .3), end_t + .05 + j * .03, .9, -.3 + .12 * j)
    st = A.reverb(st[:N], size=.5, mix=.22)
    env = np.ones(N); f0 = int((DUR - 2.2) * SR); env[f0:] = np.linspace(1, 0, N - f0) ** 1.6
    # dip the bed for the slam so the stamp reads
    th = W('L05', 'harder'); a, b = int((th - .1) * SR), int((th + .9) * SR)
    env[a:b] *= np.concatenate([np.linspace(1, .35, int(.1 * SR)), np.linspace(.35, 1, b - a - int(.1 * SR))])
    return st * env[:, None]


def sfx():
    st = np.zeros((N + SR, 2))
    seams = [LN[f'L0{k}']['start'] - .25 for k in range(2, 9)]
    for s in seams: add(st, A.s_swish(.35, 1200, 5000), s - .15, .28, .0)
    add(st, A.s_scribble(.3), W('L01', 'skipping'), .5, .2)                 # strike through SOIL TEST
    add(st, A.s_pop(), W('L01', 'soil') - .35, .4, 0)
    add(st, A.s_pop(520, 1000), W('L02', 'foundation'), .4, -.2)
    add(st, A.s_tick(), W('L02', 'designed') - .3, .4, .2)
    add(st, A.s_tick(), W('L02', 'designed'), .4, .3)
    add(st, A.s_pop(), W('L03', 'firm') - .2, .35, -.4)
    tw = W('L03', 'swell')
    for k in range(5): add(st, A.s_drop(), tw - .2 + k * .17, .25, .2 + .1 * (k % 3))
    add(st, A.s_shimmer(.7), W('L03', 'shrink'), .25, .4)
    add(st, A.s_pop(400, 700), W('L04', 'without'), .4, 0)
    add(st, A.s_pop(), W('L04', 'too'), .35, -.4)
    add(st, A.s_pop(380, 800), W('L04', 'costlier'), .4, .4)
    add(st, A.s_crack(), W('L05', 'cracks'), .6, -.1)
    add(st, A.s_stamp(), W('L05', 'harder') - .02, 1.0, 0)                  # the one slam
    add(st, A.s_paper(.25), W('L06', 'ask') - .25, .5, .2)
    add(st, A.s_chime(76), W('L06', 'need'), .25, .3)
    add(st, A.s_chime(79), W('L06', 'tell') - .35, .25, .3)
    add(st, A.s_pop(600, 1400), W('L07', 'small'), .4, -.3)
    add(st, A.s_bookmark(), W('L08', 'save'), .6, 0)
    add(st, A.s_shimmer(1.2), DUR - 2.5, .3, 0)
    return st[:N]


if __name__ == '__main__':
    A.master(os.path.join(PROJ, 'audio_michael', 'narration.wav'), music(), sfx(),
             os.path.join(PROJ, 'audio_michael', 'final_mix.wav'), DUR, music_lu=-12, sfx_lu=-15, duck_db=9.0)
