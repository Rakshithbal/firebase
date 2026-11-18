#!/usr/bin/env python3
"""YT01 hook -- synthesized music bed + 3 soft SFX types + VO, mastered to -14 LUFS, TP <= -1.5 dBTP (48 kHz stereo).
Run from the project dir:  /root/lemo-opuscar/.venv/bin/python audio/make_audio.py
Reads timing.json (line offsets, word times) + audio/vo/H*.wav (24 kHz Kokoro). Writes audio/vo_track.wav, music.wav, sfx.wav, final_mix.wav.
Hit times mirror scene.js (sceneSetup): rooms snap at H3.start + 0.22 + i*0.29, tilt = last room + 0.12, title = tilt + 0.8.
"""
import os, sys, json
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from dsp import *  # noqa  (helpers copied from r05-curing)

T = json.load(open(os.path.join(PROJ, 'timing.json')))
DUR = T['total']; N = int(round(DUR * SR))
def word(lid, w, nth=0):
    l = next(x for x in T['lines'] if x['id'] == lid)
    ws = [x for x in l['words'] if ''.join(c for c in x['w'].lower() if c.isalnum() or c == "'") == w]
    return ws[min(nth, len(ws) - 1)]['s']
H3 = T['lines'][2]['start']
ROOMS = [H3 + .22 + i * .29 for i in range(6)]
TILT0 = ROOMS[-1] + .12; TITLE = TILT0 + .8
HITS = dict(d20=word('H1', 'twenty'), d30=word('H1', 'thirty'), hundred=next(w for w in T['lines'][0]['words'] if w['w'] == 'hundred')['e'],
            small=word('H2', 'too'))


def vo_track():
    out = np.zeros(N)
    for l in T['lines']:
        x, sr = sf.read(os.path.join(HERE, 'vo', l['id'] + '.wav'))
        if x.ndim > 1: x = x.mean(1)
        x = resample_poly(x, SR // 24000, 1) if sr == 24000 else x
        s = int(round(l['wavStart'] * SR)); e = min(N, s + len(x)); out[s:e] += x[:e - s]
    return out


def make_music():
    buf = np.zeros((N + SR * 3, 2))
    # chords (MIDI): Dmaj9 -> Bm7 (doubt) -> Gmaj7 -> A6/9 (rooms) -> D (title)
    plan = [(0.0, 3.25, [50, 57, 61, 64, 66]), (3.25, 3.05, [47, 54, 57, 62, 66]),
            (H3 - .05, 1.15, [43, 55, 59, 62, 66]), (H3 + 1.1, TITLE - H3 - 1.1, [45, 57, 61, 64, 66]),
            (TITLE, DUR - TITLE + .2, [50, 57, 62, 66, 69])]
    for st, d, ch in plan:
        for k, m in enumerate(ch):
            v = pad_voice(m + 12 if k else m + 12, d + .25, att=.35 if st else .05, rel=1.0, bright=.9 if st < 3 or st > 6 else .65)
            s = int(st * SR); buf[s:s + len(v)] += v * (.5 if k == 0 else .28)
        b = bass_note(ch[0] - 12, d * .95, .55); s = int(st * SR); buf[s:s + len(b), 0] += b * .5; buf[s:s + len(b), 1] += b * .5
    # soft eighth-note pulse during H1 (momentum), silent in the doubt beat
    beat = 60 / 96 / 2
    tt = 0.0
    while tt < 3.1:
        add(buf, soft_pluck(74 if int(tt / beat) % 4 else 69, .25, .35), tt, .18, -.3 if int(tt / beat) % 2 else .3); tt += beat
    # rising pluck arpeggio, one note per room snap
    for i, (t0, m) in enumerate(zip(ROOMS, [62, 64, 66, 69, 71, 74])):
        add(buf, soft_pluck(m, .5, .5), t0 + .01, .26, -.4 + .16 * i)
    # resolve on the title: soft kick + high D pluck
    add(buf, soft_kick(.9), TITLE, .55)
    add(buf, soft_pluck(74, 1.2, .55), TITLE + .02, .3)
    buf = reverb(buf, size=.55, mix=.28)
    buf = buf[:N]
    fi, fo = int(.08 * SR), int(.6 * SR)
    buf[:fi] *= np.linspace(0, 1, fi)[:, None]; buf[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    return buf


def make_sfx():
    buf = np.zeros((N + SR * 2, 2))
    # 1) soft whooshes: plot draw-on, camera tilt
    add(buf, s_whoosh(.75, 250, 1800), 0.0, .55, -.2)
    add(buf, s_whoosh(1.0, 200, 1500), TILT0 - .05, .7, .2)
    # 2) soft ticks: dimension labels landing, each room snap
    for t0 in (HITS['d20'], HITS['d30']): add(buf, s_pop(700, 1400, .1), t0, .35)
    add(buf, s_pop(500, 1000, .12), HITS['small'], .3, -.4)
    for i, t0 in enumerate(ROOMS): add(buf, s_tick(2600 + 120 * i), t0, .3, -.3 + .12 * i)
    # 3) title: low soft thump + chime
    tt = t_(.5); th = np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-tt / .02)) / SR) * np.exp(-tt / .12)
    add(buf, fade_edges(norm(th)), TITLE, .55)
    add(buf, s_chime(86, 1.4), TITLE + .03, .32, .15)
    add(buf, s_chime(81, 1.4), TITLE + .09, .2, -.15)
    return reverb(buf[:N], size=.35, mix=.18, seed=9)


def main():
    voice = vo_track()
    music = make_music(); sfx = make_sfx()
    v = hp(voice, 70); v0 = lufs(v); vc = compress_voice(v, -20, 2.5); vc *= db(v0 - lufs(vc))
    V = np.stack([vc, vc], 1); VL = lufs(V)
    music *= db(VL - 12 - lufs(music))     # subtle bed
    sfx *= db(VL - 15 - lufs(sfx))
    duck, ddb = duck_curve(vc, 7.0)
    mix = V + music * duck[:, None] + sfx
    gain = -14.0 - lufs(mix)
    for _ in range(6):
        out = tp_limit(mix * db(gain), -2.0)
        L = lufs(out); gain += -14.0 - L
        if abs(L + 14.0) < .05: break
    out = out[:N].astype(np.float32)
    sf.write(os.path.join(HERE, 'vo_track.wav'), voice.astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'music.wav'), music.astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'sfx.wav'), sfx.astype(np.float32), SR, subtype='PCM_24')
    fm = os.path.join(HERE, 'final_mix.wav'); sf.write(fm, out, SR, subtype='PCM_24')
    I, tp, lra = ffmpeg_measure(fm)
    print(f'voice {VL:.1f} | music {lufs(music):.1f} | sfx {lufs(sfx):.1f} LUFS (pre-master)')
    print(f'final_mix.wav: I={I:.1f} LUFS  TP={tp:.1f} dBTP  LRA={lra:.1f} LU  {len(out) / SR:.3f} s')


if __name__ == '__main__':
    main()
