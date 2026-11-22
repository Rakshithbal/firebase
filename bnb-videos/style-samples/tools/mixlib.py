"""Shared synth + mix helpers for the BNB style samples (all synthesized, no samples). 48 kHz stereo."""
import re, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly, lfilter
from scipy.ndimage import maximum_filter1d, uniform_filter1d, minimum_filter1d
sys.path.insert(0, '/root/lemo-opuscar/core/audio')
import pluck as P
SR = 48000
FF = '/root/.local/bin/ffmpeg'
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)
def t_(d): return np.arange(int(round(d * SR))) / SR
def fade(x, a=.002, r=.01):
    x = x.copy(); na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x
def add(buf, x, at, gain=1.0, pan=0.0):
    s = int(round(at * SR))
    if s >= len(buf): return
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x)); l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[s:e, 0] += x[:e - s] * gain * l * 1.4142; buf[s:e, 1] += x[:e - s] * gain * r * 1.4142
def reverb(st, rt=1.6, mix=.25, predelay=.02, damp=.5, seed=3):
    n = int(rt * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed); out = np.zeros_like(st)
    for c in range(2):
        ir = lp(r.standard_normal(n), 9000 * (1 - .75 * damp) + 1500, 1) * np.exp(-6.9 * t / rt)
        ir = np.concatenate([np.zeros(int(predelay * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = fftconvolve(st[:, c], ir)[:len(st)] * .5
    return st * (1 - mix) + out * mix * 2.2
def pl(preset, pitch, dur=None, vel=.6, **kw): return P.pluck(preset, pitch, dur, vel=vel, **kw).astype(np.float64)
def k_weight(x):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
def lufs(st):
    st = st if st.ndim == 2 else st[:, None]
    y = k_weight(st); blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-20); ms = ms[l > -70]
    if not len(ms): return -120.0
    rel = -0.691 + 10 * np.log10(ms.mean()) - 10; l2 = -0.691 + 10 * np.log10(ms + 1e-20)
    return -0.691 + 10 * np.log10(ms[l2 > rel].mean())
def env_follow(x, att, rel):
    out = np.zeros_like(x); e = x[0]
    for i, v in enumerate(x):
        c = att if v > e else rel; e = c * e + (1 - c) * v; out[i] = e
    return out
def compress_voice(v, thr_db=-20, ratio=2.5, att=.005, rel=.09):
    hopn = 48; fr = np.sqrt(uniform_filter1d(v ** 2, 96)[::hopn] + 1e-12)
    fr = maximum_filter1d(np.abs(v), hopn)[::hopn] * .5 + fr * .5
    e = env_follow(fr, np.exp(-1 / (att * 1000)), np.exp(-1 / (rel * 1000))); edb = 20 * np.log10(e + 1e-9)
    gdb = np.where(edb > thr_db, (thr_db + (edb - thr_db) / ratio) - edb, 0.0)
    return v * np.interp(np.arange(len(v)) / hopn, np.arange(len(gdb)), db(gdb))
def duck_curve(v, depth_db=10.0):
    hopn = 480; rms = np.sqrt(uniform_filter1d(v ** 2, 1440)[::hopn] + 1e-12); ldb = 20 * np.log10(rms)
    act = np.clip((ldb + 46) / 12, 0, 1); act = maximum_filter1d(act, 25, origin=-4); gdb = -depth_db * act
    a, r = np.exp(-1 / 6), np.exp(-1 / 45); out = np.zeros_like(gdb); e = 0.0
    for i, x in enumerate(gdb):
        c = a if x < e else r; e = c * e + (1 - c) * x; out[i] = e
    out = np.roll(out, -4); out[-4:] = out[-5]
    return db(np.interp(np.arange(len(v)) / hopn, np.arange(len(out)), out))
def tp_limit(st, ceil_db=-2.0, look=.003, rel=.08):
    ceil = db(ceil_db); n = int(look * SR)
    up = np.stack([resample_poly(st[:, c], 4, 1) for c in range(2)], 1)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(st)]
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, 2 * n + 1); g = uniform_filter1d(g, n)
    rc = 1 - np.exp(-1 / (rel * SR)); out = np.empty_like(g); y = 1.0; gm = minimum_filter1d(g, 3)
    for i in range(len(g)): y = min(gm[i], y + (1 - y) * rc); out[i] = y
    return st * out[:, None]
def measure(path):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r)[-1])
def master(out_path, N, music, sfx, voice_path=None, music_rel=-11, sfx_rel=-15, duck_db=10, target=-14.0):
    """voice-led mix if voice_path, else music+sfx only. Writes 48k stereo 24-bit."""
    music = music[:N]; sfx = sfx[:N]
    if voice_path:
        v, sr = sf.read(voice_path); assert sr == SR
        if v.ndim > 1: v = v.mean(1)
        v = np.pad(v, (0, max(0, N - len(v))))[:N]; v = hp(v, 70)
        v0 = lufs(v); vc = compress_voice(v); vc *= db(v0 - lufs(vc)); V = np.stack([vc, vc], 1); VL = lufs(V)
        music = music * db(VL + music_rel - lufs(music)); sfx = sfx * db(VL + sfx_rel - lufs(sfx))
        mix = V + music * duck_curve(vc, duck_db)[:, None] + sfx
    else:
        ML = lufs(music); sfx = sfx * db(ML + sfx_rel - lufs(sfx)); mix = music + sfx
    gain = target - lufs(mix)
    for _ in range(5):
        out = tp_limit(mix * db(gain), -2.0); L = lufs(out); gain += target - L
        if abs(L - target) < .05: break
    fo = int(.25 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
    sf.write(out_path, out.astype(np.float32), SR, subtype='PCM_24')
    I, tp = measure(out_path); print(f'{out_path}: I={I:.1f} LUFS TP={tp:.1f} dBTP'); return I, tp
