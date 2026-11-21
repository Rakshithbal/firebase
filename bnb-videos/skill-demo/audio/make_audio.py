#!/usr/bin/env python3
"""skill-demo -- original 30 s underscore + UI sfx + master (all synthesized, no samples, no voice).

Run:  /root/lemo-opuscar/.venv/bin/python audio/make_audio.py
Out:  audio/music.wav, audio/sfx.wav (stems) and assets/audio/demo_mix.wav (-14 LUFS, TP <= -1.5 dBTP, 48 kHz stereo, 30.000 s)

Same instrument family as R05 (felt piano, nylon pluck, warm pad, soft bass) -- helpers imported from audio/r05_synth.py --
but more forward: 96 BPM, pulse from scene 2, a lift at scene 4 (13.125 s) and a rolled resolve on the end card (26.875 s).
Cue points follow BNB.SCENES in assets/bnb.js (beat = 0.625 s).
"""
import os, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import r05_synth as R  # noqa: E402  (felt_piano, soft_pluck, pad_voice, bass_note, soft_kick, shaker, s_* sfx, reverb, lufs, tp_limit ...)

SR = R.SR
DUR = 30.0
N = int(round(DUR * SR))
BEAT = 0.625
def B(b): return b * BEAT
R.rng = np.random.default_rng(1996)   # reseed the shared generator: deterministic, different from R05

CUT = dict(s2=3.75, s3=8.4375, s4=13.125, s5=22.5, s6=26.875)

CH = dict(R.CH)
CH['Em9'] = (40, [55, 59, 62, 66], [40, 47, 55, 59, 66])
# (start beat, chord) -- harmonic rhythm, beats from 0
PROG = [(0, 'Dmaj9'), (6, 'Bm7'), (10, 'Gmaj7'), (14, 'Em9'), (17, 'Asus4'), (19, 'A'),
        (21, 'D'), (25, 'A/C#'), (29, 'Bm7'), (33, 'Gmaj9'),
        (36, 'D/F#'), (39, 'Gmaj7'), (41, 'Asus4'), (42, 'A'), (43, 'Dmaj9')]
LIFT0, LIFT1, END = 21, 36, 43


def chord_at(b):
    cur = PROG[0][1]
    for s, c in PROG:
        if s <= b + 1e-9: cur = c
    return cur


# sparse felt-piano top line (beat, midi, beats, vel)
MEL = [(0, 69, 1.5, .44), (1.5, 73, 1, .38), (2.5, 76, 3.0, .42),
       (6, 74, 1.5, .40), (7.5, 78, 2.5, .38), (10, 79, 1.5, .40), (11.5, 78, 2, .36),
       (14, 78, 1.5, .40), (15.5, 76, 1.5, .36), (17, 74, 2, .38), (19, 73, 2, .36),
       # lift: higher, more motion
       (21, 81, 1.5, .46), (22.5, 78, 1, .40), (23.5, 76, 1.5, .42),
       (25, 76, 1.5, .44), (26.5, 73, 1, .38), (27.5, 76, 1.5, .40),
       (29, 78, 1.5, .44), (30.5, 74, 1, .38), (31.5, 81, 1.5, .42),
       (33, 83, 1.5, .44), (34.5, 81, 1.5, .40),
       (36, 78, 2, .38), (39, 79, 2, .36), (41, 76, 1, .36), (42, 73, 1, .34)]


def make_music():
    L = N + int(3 * SR)
    piano = np.zeros((L, 2)); pad = np.zeros((L, 2)); low = np.zeros((L, 2)); perc = np.zeros((L, 2)); plk = np.zeros((L, 2))
    # pad
    for i, (b0, c) in enumerate(PROG):
        b1 = PROG[i + 1][0] if i + 1 < len(PROG) else 48
        t0, t1 = B(b0), B(b1)
        lift = LIFT0 <= b0 < LIFT1
        g = .055 * (1.25 if lift else 1.0) * (1.1 if b0 >= END else 1.0)
        for m in CH[c][1]:
            v = R.pad_voice(m, t1 - t0 + .3, att=(1.2 if i == 0 else .5), rel=1.2, bright=(1.35 if lift else 1.05))
            s = int(t0 * SR); e = min(L, s + len(v)); pad[s:e] += v[:e - s] * g
        if lift:
            v = R.pad_voice(CH[c][1][-1] + 12, t1 - t0 + .3, att=.8, rel=1.2, bright=1.6)
            s = int(t0 * SR); e = min(L, s + len(v)); pad[s:e] += v[:e - s] * .013
    # melody
    for b, m, ln, v in MEL:
        R.add(piano, R.felt_piano(m, ln * BEAT * .95, v), B(b) + R.rng.normal(0, .004), .55, pan=.12 * np.sign(m - 72))
    # left hand: broken chords (quarters) -> flowing 8ths in the lift
    for b in range(0, END):
        pl = CH[chord_at(b)][2]
        if LIFT0 <= b < LIFT1:
            seq = [pl[0], pl[2], pl[3], pl[4]]
            for k in range(2):
                R.add(piano, R.felt_piano(seq[(2 * (b % 2) + k) % 4], BEAT, .26 if k == 0 else .19, bright=.85), B(b + k / 2) + R.rng.normal(0, .004), .5, pan=-.18)
        else:
            m = [pl[0], pl[2], pl[3], pl[1] + 12 if pl[1] + 12 < 68 else pl[1]][b % 4]
            R.add(piano, R.felt_piano(m, BEAT * 1.5, .27, bright=.85), B(b) + R.rng.normal(0, .004), .5, pan=-.18)
    # resolve: rolled Dmaj9 on the end card
    for k, m in enumerate([38, 50, 57, 61, 64, 69, 74]):
        R.add(piano, R.felt_piano(m, 2.6, .46 - .02 * k), B(END) + k * .05, .6, pan=-.3 + .1 * k)
    R.add(piano, R.felt_piano(78, 2.4, .32), B(END) + .45, .5, pan=.2)
    # bass from scene 2
    for i, (b0, c) in enumerate(PROG):
        if b0 < 6: continue
        b1 = PROG[i + 1][0] if i + 1 < len(PROG) else 48
        v = .07 if b0 < LIFT0 else (.095 if b0 < LIFT1 else .075)
        R.add(low, R.bass_note(CH[c][0], (B(b1) - B(b0)) * .95, 1.0), B(b0), v)
    # pulse: pluck quarters in s2-s3, 8ths + soft kick + shaker in the lift, lighter in s5
    for b in range(2, END):
        pl = CH[chord_at(b)][2]
        if LIFT0 <= b < LIFT1:
            for k in range(2):
                m = (pl[1] + 12) if k == 0 else pl[3]
                R.add(plk, R.soft_pluck(m, .14, .45), B(b + k / 2), .24 if k == 0 else .16, pan=.25 if k == 0 else .4)
            if b % 2 == 1: R.add(perc, R.soft_kick(1.0), B(b), .12)
            R.add(perc, R.shaker(1.0), B(b + .5) + .008, .026, pan=-.3)
        else:
            m = pl[1] + (12 if b % 2 else 0)
            R.add(plk, R.soft_pluck(m, .16, .45), B(b), .22 if b % 2 == 0 else .16, pan=.35)
            if 6 <= b < LIFT0 and b % 2 == 0: R.add(perc, R.soft_kick(.8), B(b), .07)
            if b >= 14 and b < LIFT0: R.add(perc, R.shaker(.8), B(b + .5) + .008, .016, pan=-.3)
    # airy riser into the lift
    d = 1.2; tt = R.t_(d); sw = R.bp(R.rng.standard_normal(len(tt)), 1500, 6500) * (tt / d) ** 3
    R.add(pad, sw, CUT['s4'] - d, .012)
    mix = piano + pad + low + perc + plk
    wet = R.reverb(mix[:N + SR], size=.42, mix=.26, predelay=.022, damp=.55, seed=11)
    out = wet[:N].copy()
    fs = int(29.2 * SR); out[fs:] *= (np.cos(np.linspace(0, np.pi / 2, N - fs)) ** 2)[:, None]
    out[:int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))[:, None]
    return R.hp_st(out, 35)


def make_sfx():
    S = np.zeros((N + SR, 2)); A = R.add
    # s1: soft air swell under the title, light swish as the rule draws
    A(S, R.s_lens(.9), 0.05, .05, 0)
    A(S, R.s_swish(.5, 900, 4000), 1.0, .06, .2)
    # seams: very soft air swishes
    for t in (CUT['s2'], CUT['s3'], CUT['s5']):
        A(S, R.s_swish(.28, 900, 3500), t - .14, .07, 0)
    # s2: typing ticks (one per ~3 chars, seeded jitter), leader/ruler swish, a soft pop per word chip as the playhead lands it
    s2 = CUT['s2']
    for t0, n, rate in ((0.45, 17, .016), (0.78, 10, .016), (0.98, 28, .014), (1.42, 30, .014), (1.86, 37, .014)):
        for i in range(0, n, 3):
            A(S, R.s_tick(2600 + 500 * R.rng.random()), s2 + t0 + i * rate + R.rng.normal(0, .003), .05 + .03 * R.rng.random(), R.rng.uniform(-.3, .3))
    A(S, R.s_swish(.4, 1200, 5000), s2 + 2.3, .06, .3)
    for i, w in enumerate((0.4, 0.707, 1.015, 1.378, 1.63, 1.881)):
        A(S, R.s_pop(520 + 40 * i, 1200 + 80 * i, .1), s2 + 2.6 + (w - .3) / 2 * 1.3, .10, -.2 + .1 * i)
    # s3: chip pops (ascending, in key), slab draw scribble, the grid SNAP
    s3 = CUT['s3']
    for i, m in enumerate((74, 76, 78, 81, 83)):
        A(S, R.s_pop(520, 1250, .1), s3 + .95 + i * .08, .10, -.3 + .15 * i); A(S, R.s_chime(m, .6), s3 + .96 + i * .08, .03, -.3 + .15 * i)
    A(S, R.s_swish(.6, 700, 3000), s3 + 1.3, .05, .3)
    A(S, R.s_click(1800), s3 + 2.6, .22, 0); A(S, R.s_click(2600), s3 + 2.63, .12, .1)
    # s4: lift whoosh, the stamp slam inside the reel, a swish on each cut in the reel, tick on each recipe index
    s4 = CUT['s4']
    A(S, R.s_whoosh(.8, 300, 2400), s4 - .35, .10, 0)
    A(S, R.s_stamp(), s4 + 1.335, .20, .25)
    for t in (56 / 30, 112 / 30, 169 / 30, 225 / 30):
        A(S, R.s_swish(.26, 1100, 4500), s4 + t - .12, .07, .3)
        A(S, R.s_tick(3000), s4 + t + .02, .06, -.3)
    # s5: a page flick on each series swap, a soft shimmer as the client theme lands
    s5 = CUT['s5']
    for t in (0.95, 1.7):
        A(S, R.s_paper(.22), s5 + t, .07, .2)
    A(S, R.s_whoosh(.6, 500, 3000), s5 + 2.5 - .25, .06, 0)
    A(S, R.s_shimmer(.9), s5 + 2.52, .05, .2)
    # s6: end-card chime (resolves with the rolled chord)
    s6 = CUT['s6']
    A(S, R.s_chime(86, 1.6), s6 + .02, .07, .1); A(S, R.s_chime(81, 1.6), s6 + .08, .05, -.1)
    S = R.reverb(S, size=.2, mix=.14, predelay=.008, damp=.6, seed=21)
    return R.hp_st(S[:N], 60)


def main():
    print('music...'); music = make_music()
    print('sfx...'); sfx = make_sfx()
    ML = R.lufs(music)
    sfx *= R.db(ML - 9 - R.lufs(sfx))      # sfx accents sit ~9 LU under the music
    mix = music + sfx
    gain = -14.0 - R.lufs(mix)
    for _ in range(5):
        out = R.tp_limit(mix * R.db(gain), -2.0)
        Lm = R.lufs(out); gain += -14.0 - Lm
        if abs(Lm + 14.0) < .05: break
    out = out[:N].astype(np.float32)
    sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR, subtype='PCM_24')
    fm = os.path.join(PROJ, 'assets', 'audio', 'demo_mix.wav')
    sf.write(fm, out, SR, subtype='PCM_24')
    I, tp, lra = R.ffmpeg_measure(fm)
    print(f'demo_mix.wav: I={I:.1f} LUFS  TP={tp:.1f} dBTP  LRA={lra:.1f} LU  {len(out) / SR:.3f} s')


if __name__ == '__main__':
    main()
