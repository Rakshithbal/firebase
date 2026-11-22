"""Shared synthesis + mastering helpers for style samples 01/06/07 (extracted from r05-curing/audio/make_audio.py)."""
import os, sys, re, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d, minimum_filter1d

SR = 48000
rng = np.random.default_rng(505)

SR = 48000
# ---------- optional Lemo-Opuscar helpers ----------
LEMO = '/root/lemo-opuscar/core/audio'
P = None; ROOM = None
if os.path.isdir(LEMO):
    sys.path.insert(0, LEMO)
    try:
        import pluck as P
    except Exception as e:
        print('pluck.py unavailable, using local pluck:', e); P = None
    try:
        from sampler import room as ROOM
    except Exception as e:
        print('sampler.room unavailable, using local reverb:', e); ROOM = None


# ---------- small DSP helpers ----------
def t_(d): return np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(round(d * SR)))
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)


def norm(x, p=1.0):
    m = np.abs(x).max(); return x * (p / m) if m > 0 else x


def fade_edges(x, a=.002, r=.01):
    na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x


def add(buf, x, at, gain=1.0, pan=0.0):
    """mono x into stereo buf at time `at` (s), constant-power pan -1..1"""
    s = int(round(at * SR))
    if s >= len(buf) or s + len(x) <= 0: return
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x)); l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[s:e, 0] += x[:e - s] * gain * l * 1.4142; buf[s:e, 1] += x[:e - s] * gain * r * 1.4142


def reverb(st, size=.5, mix=.25, predelay=.02, damp=.5, seed=3):
    if ROOM is not None:
        return ROOM(st, size=size, mix=mix, predelay=predelay, damp=damp, seed_=seed).astype(np.float64)
    rt = .4 + 3.0 * size; n = int(rt * SR); t = np.arange(n) / SR; r = np.random.default_rng(seed); out = np.zeros_like(st)
    for c in range(2):
        ir = lp(r.standard_normal(n), 9000 * (1 - .75 * damp) + 1500, 1) * np.exp(-6.9 * t / rt)
        ir = np.concatenate([np.zeros(int(predelay * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, c] = fftconvolve(st[:, c], ir)[:len(st)] * .5
    return st * (1 - mix) + out * mix * 2.2


# =====================================================================
# 1. MUSIC -- D major, 86.5 BPM, bar = 24.97/9 s so the "solution" lift lands exactly on bar 9
# =====================================================================
BAR = 24.97 / 9            # 2.7744 s  (= 86.5 BPM, 4/4)
def felt_piano(m, dur, vel=.6, bright=1.0):
    """Felt/soft piano: inharmonic additive partials, 3-string detune, two-stage decay, soft felt hammer, low cutoff."""
    f0 = hz(m); tail = 1.8; n = int((dur + tail) * SR); t = np.arange(n) / SR
    B = 0.00012 * (f0 / 260) ** 1.2
    T0 = 4.0 * (260 / f0) ** .55
    y = np.zeros(n)
    for k in range(1, 16):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        ak = (1 / k ** 1.35) * np.exp(-(k - 1) * (.55 - .35 * vel))
        tau = T0 / (1 + .55 * (k - 1))
        env = .72 * np.exp(-t / (tau * .22)) + .28 * np.exp(-t / tau)
        for c in (-.9, .9):  # unison strings, a few cents apart -> slow beating / warmth
            y += ak * env * np.sin(2 * np.pi * fk * (1 + c * 1.6e-3 * .6) * t + rng.random() * 6.28) * .5
    # felt hammer thump
    L = int(.03 * SR); th = lp(rng.standard_normal(L), 900) * np.exp(-np.arange(L) / (.006 * SR))
    y[:L] += th * .08 * vel
    att = int(.006 * SR); y[:att] *= np.sin(np.linspace(0, np.pi / 2, att)) ** 2
    # damper after note-off
    d0 = int(dur * SR)
    if d0 < n: y[d0:] *= np.exp(-np.arange(n - d0) / SR / .28)
    y = lp(y, (1500 + 3800 * vel) * bright, 2)
    return fade_edges(y * vel, .0, .02)


def soft_pluck(m, dur, vel=.5):
    """Muted nylon-ish pluck for the pulse (Lemo pluck.py nylon_guitar if available)."""
    if P is not None:
        x = P.pluck('nylon_guitar', float(m), dur, vel=vel, release=.09, damp=.6, bright=.3).astype(np.float64)
        return lp(x, 3800)
    f0 = hz(m); tt = t_(dur + .1)
    x = (np.sin(2 * np.pi * f0 * tt) + .35 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / .09)
    return fade_edges(lp(x, 2200) * vel * .12, .002, .02)


def pad_voice(m, dur, att=1.0, rel=1.3, bright=1.0):
    """Warm additive pad voice: 6 harmonics, 3 detuned copies, slow LFO, returns stereo."""
    n = int((dur + rel) * SR); t = np.arange(n) / SR; f0 = hz(m)
    out = np.zeros((n, 2))
    for ci, cents in enumerate((-7, 0, 7)):
        f = f0 * 2 ** (cents / 1200)
        lfo = 1 + .0015 * np.sin(2 * np.pi * (.17 + .05 * ci) * t + ci)
        ph = 2 * np.pi * f * np.cumsum(lfo) / SR
        v = sum((1 / h ** 1.6) * np.sin(h * ph + rng.random() * 6.28) for h in range(1, 7))
        pan = (-.7, 0, .7)[ci]
        out[:, 0] += v * np.cos((pan + 1) * np.pi / 4); out[:, 1] += v * np.sin((pan + 1) * np.pi / 4)
    env = np.minimum(1, t / att) ** 2
    d0 = int(dur * SR); env[d0:] *= np.cos(np.linspace(0, np.pi / 2, n - d0)) ** 2
    out *= env[:, None]
    for c in range(2): out[:, c] = lp(out[:, c], 1500 * bright, 2)
    return out


def bass_note(m, dur, vel=.6):
    f0 = hz(m); n = int((dur + .25) * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f0 * t) + .32 * np.sin(4 * np.pi * f0 * t) + .12 * np.sin(6 * np.pi * f0 * t)
    env = np.minimum(1, t / .03) * (.75 + .25 * np.exp(-t / .5))
    d0 = int(dur * SR); env[d0:] *= np.exp(-np.arange(n - d0) / SR / .07)
    return fade_edges(lp(y * env * vel, 700), .0, .01)


def soft_kick(v=1.0):
    tt = t_(.4); f = 52 + 45 * np.exp(-tt / .03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .13)
    x += lp(rng.standard_normal(len(tt)), 1200) * np.exp(-tt / .004) * .15
    return fade_edges(x * v, .0005, .02)


def shaker(v=1.0):
    tt = t_(.07); x = bp(rng.standard_normal(len(tt)), 5000, 11000) * (tt / .012) * np.exp(-tt / .018)
    return x * v


def hp_st(x, f):
    y = x.copy()
    for c in range(x.shape[1]): y[:, c] = hp(x[:, c], f)
    return y


# =====================================================================
# 2. SFX -- subtle UI foley on the key hits
# =====================================================================
def s_stamp():
    tt = t_(.35)
    body = np.sin(2 * np.pi * np.cumsum(95 + 60 * np.exp(-tt / .015)) / SR) * np.exp(-tt / .06)
    slap = bp(rng.standard_normal(len(tt)), 400, 2500) * np.exp(-tt / .012)
    paper = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt / .005) * .3
    return fade_edges(norm(body * 1.0 + slap * .45 + paper), .0005, .03)


def s_swish(d=.3, lo=1500, hi=6000, rise=True):
    """pen strike / light swish: bandpassed noise with a moving centre"""
    tt = t_(d); x = rng.standard_normal(len(tt)); out = np.zeros_like(x); blk = 480
    for i in range(0, len(x), blk):
        j = min(len(x), i + blk); p = i / len(x); p = p if rise else 1 - p
        fc = lo * (hi / lo) ** p
        out[i:j] = bp(x[max(0, i - 1500):j], fc * .75, min(fc * 1.3, 20000))[-(j - i):]
    env = np.sin(np.pi * np.minimum(1, tt / d)) ** 1.5 * (1 + .3 * np.sin(2 * np.pi * 25 * tt))
    return fade_edges(norm(out * env), .002, .02)


def s_pop(f0=520, f1=1300, d=.12):
    tt = t_(d); f = f0 + (f1 - f0) * (1 - np.exp(-tt / .02))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .035)
    x[:int(.002 * SR)] *= np.linspace(0, 1, int(.002 * SR))
    return fade_edges(norm(x), .0, .01)


def s_chime(m, d=1.1):
    tt = t_(d); f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * r * tt + rng.random()) * np.exp(-tt / tau)
            for r, a, tau in [(1, 1, .45), (2.0, .25, .25), (3.01, .10, .12), (4.2, .05, .06)])
    x[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
    return fade_edges(norm(x), .0, .05)


def s_drop(f0=900, f1=1900):
    """water-drop plink: quick upward sine glide + tiny bubble ring"""
    tt = t_(.16); f = f0 + (f1 - f0) * np.minimum(1, tt / .035) ** .7
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .03)
    x[:int(.0015 * SR)] *= np.linspace(0, 1, int(.0015 * SR))
    return fade_edges(norm(x), .0, .02)


def s_whoosh(d=.7, lo=300, hi=2200):
    tt = t_(d); x = rng.standard_normal(len(tt)); out = np.zeros_like(x); blk = 480
    for i in range(0, len(x), blk):
        j = min(len(x), i + blk); p = np.sin(np.pi * i / len(x))
        fc = lo + (hi - lo) * p
        out[i:j] = bp(x[max(0, i - 2000):j], fc * .6, fc * 1.6)[-(j - i):]
    env = np.sin(np.pi * tt / d) ** 2
    env = env * (tt / d) ** .3
    return fade_edges(norm(lp(out, 5000) * env), .01, .05)


def s_crack():
    """short crisp crack: a burst of tiny fractures + a small dry body"""
    d = .22; out = np.zeros(int(d * SR))
    times = np.sort(np.r_[0, rng.uniform(0, .07, 6)])
    for i, tm in enumerate(times):
        L = int(rng.uniform(.004, .012) * SR); s = int(tm * SR)
        z = hp(rng.standard_normal(L), 2500) * np.exp(-np.arange(L) / (.0018 * SR)) * (1 if i == 0 else rng.uniform(.25, .6))
        out[s:s + L] += z[:len(out) - s]
    tt = t_(d)
    out += bp(rng.standard_normal(len(tt)), 300, 1500) * np.exp(-tt / .02) * .35
    return fade_edges(norm(out), .0003, .03)


def s_shimmer(d=.9):
    """sun glint: a few soft high sine sparkles"""
    tt = t_(d); x = np.zeros_like(tt)
    for k, m in enumerate([86, 90, 93, 98]):
        s = k * .07; e = np.clip(tt - s, 0, None)
        x += np.sin(2 * np.pi * hz(m) * tt) * (tt >= s) * np.exp(-e / .22) * (1 - .15 * k)
    return fade_edges(norm(x), .004, .1)


def s_click(f=2400, d=.04):
    tt = t_(d)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .006) + hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt / .0015) * .4
    return fade_edges(norm(x), .0003, .01)


def s_tick(f=3200):
    tt = t_(.03)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .004) + np.sin(2 * np.pi * f * 1.5 * tt) * np.exp(-tt / .002) * .3
    return fade_edges(norm(x), .0002, .008)


def s_scribble(d=.75):
    """pencil scribble: graphite grit + stroke rhythm (~9 strokes/s), slightly irregular"""
    tt = t_(d); x = rng.standard_normal(len(tt))
    grit = bp(x, 2500, 9000) + .5 * bp(rng.standard_normal(len(tt)), 900, 2500)
    rate = 9 + 1.5 * np.sin(2 * np.pi * .9 * tt)
    ph = 2 * np.pi * np.cumsum(rate) / SR
    strokes = np.abs(np.sin(ph)) ** 1.6 * (.7 + .3 * rng.random(len(tt)) ** 2)
    strokes = uniform_filter1d(strokes, int(.004 * SR))
    env = np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .12)
    return fade_edges(norm(grit * strokes * env), .005, .03)


def s_paper(d=.25):
    """calendar-page flick"""
    tt = t_(d); x = bp(rng.standard_normal(len(tt)), 1800, 7000)
    flutter = .6 + .4 * np.sin(2 * np.pi * 38 * tt) ** 2
    env = np.minimum(1, tt / .015) * np.exp(-tt / .07)
    return fade_edges(norm(x * flutter * env), .002, .02)


def s_lens(d=.6):
    """magnifier zoom: soft airy swell with a faint rising tone"""
    tt = t_(d)
    air = bp(rng.standard_normal(len(tt)), 600, 3500) * (tt / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(420 + 380 * (tt / d) ** 2) / SR) * (tt / d) ** 2 * .25
    env = np.minimum(1, (d - tt) / .06)
    return fade_edges(norm((air + tone) * env), .01, .01)


def s_bookmark():
    tt = t_(.25)
    thup = np.sin(2 * np.pi * np.cumsum(180 + 140 * np.exp(-tt / .02)) / SR) * np.exp(-tt / .05)
    pop = np.zeros_like(tt); p = s_pop(650, 1500, .12); pop[:len(p)] = p * .7
    return fade_edges(norm(thup * .8 + pop), .0005, .03)


def k_weight(x):
    # ITU-R BS.1770 K-weighting @ 48 kHz
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    from scipy.signal import lfilter
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)


def lufs(st):
    st = st if st.ndim == 2 else st[:, None]
    y = k_weight(st); blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-20)
    ms = ms[l > -70];
    if not len(ms): return -120.0
    rel = -0.691 + 10 * np.log10(ms.mean()) - 10
    l2 = -0.691 + 10 * np.log10(ms + 1e-20)
    return -0.691 + 10 * np.log10(ms[l2 > rel].mean())


def env_follow(x, att, rel):
    """one-pole peak/RMS follower on a frame-rate signal"""
    out = np.zeros_like(x); e = x[0]
    for i, v in enumerate(x):
        c = att if v > e else rel; e = c * e + (1 - c) * v; out[i] = e
    return out


def compress_voice(v, thr_db=-20, ratio=2.5, att=.005, rel=.09):
    # envelope at 1 kHz frame rate, smoothed, interpolated -> gain
    hopn = 48; fr = np.sqrt(uniform_filter1d(v ** 2, 96)[::hopn] + 1e-12)
    fr = maximum_filter1d(np.abs(v), hopn)[::hopn] * .5 + fr * .5
    a, r = np.exp(-1 / (att * 1000)), np.exp(-1 / (rel * 1000))
    e = env_follow(fr, a, r); edb = 20 * np.log10(e + 1e-9)
    gdb = np.where(edb > thr_db, (thr_db + (edb - thr_db) / ratio) - edb, 0.0)
    g = np.interp(np.arange(len(v)) / hopn, np.arange(len(gdb)), db(gdb))
    return v * g


def duck_curve(v, depth_db=9.0):
    """sidechain-style ducking gain from the narration: -depth when speech is present, lookahead 80 ms"""
    hopn = 480  # 10 ms frames
    rms = np.sqrt(uniform_filter1d(v ** 2, 1440)[::hopn] + 1e-12); ldb = 20 * np.log10(rms)
    act = np.clip((ldb - (-46)) / 12, 0, 1)        # -46 dBFS -> 0, -34 dBFS -> fully ducked
    act = maximum_filter1d(act, 25, origin=-4)      # hold ~250 ms, plus ~40 ms look-ahead (bridges word gaps)
    gdb = -depth_db * act
    a, r = np.exp(-1 / (.06 * 100)), np.exp(-1 / (.45 * 100))   # 60 ms down, 450 ms back up
    out = np.zeros_like(gdb); e = 0.0
    for i, x in enumerate(gdb):
        c = a if x < e else r; e = c * e + (1 - c) * x; out[i] = e
    out = np.roll(out, -4); out[-4:] = out[-5]      # 40 ms extra look-ahead
    return db(np.interp(np.arange(len(v)) / hopn, np.arange(len(out)), out)), out


def tp_limit(st, ceil_db=-2.0, look=.003, rel=.08):
    """true-peak (4x oversampled) look-ahead limiter, returns limited stereo"""
    ceil = db(ceil_db); n = int(look * SR)
    up = np.stack([resample_poly(st[:, c], 4, 1) for c in range(2)], 1)
    pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(st)]
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, 2 * n + 1); g = uniform_filter1d(g, n)
    rc = 1 - np.exp(-1 / (rel * SR)); out = np.empty_like(g); y = 1.0
    gm = minimum_filter1d(g, 3)
    for i in range(len(g)):
        y = min(gm[i], y + (1 - y) * rc); out[i] = y
    return st * out[:, None]


def ffmpeg_measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); lra = float(re.findall(r'LRA:\s+(-?[\d.]+) LU', r)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r)[-1])
    return I, tp, lra




def master(voice_path, music, sfx, out_path, dur, music_lu=-12, sfx_lu=-15, duck_db=9.0):
    """voice (mono wav on timeline) + music + sfx (stereo arrays) -> -14 LUFS, TP <= -1.5 dBTP stereo wav."""
    import soundfile as sf
    n = int(round(dur * SR))
    voice, sr = sf.read(voice_path, always_2d=False)
    assert sr == SR, sr
    if voice.ndim > 1: voice = voice.mean(1)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    music = np.pad(music, ((0, max(0, n - len(music))), (0, 0)))[:n]
    sfx = np.pad(sfx, ((0, max(0, n - len(sfx))), (0, 0)))[:n]
    v = hp(voice, 70); v0 = lufs(v); vc = compress_voice(v, -20, 2.5); vc *= db(v0 - lufs(vc))
    V = np.stack([vc, vc], 1); VL = lufs(V)
    music = music * db(VL + music_lu - lufs(music))
    sfx = sfx * db(VL + sfx_lu - lufs(sfx))
    duck, dfr = duck_curve(vc, duck_db)
    mix = V + music * duck[:, None] + sfx
    gain = -14.0 - lufs(mix)
    for it in range(5):
        out = tp_limit(mix * db(gain), -2.0)
        L = lufs(out); gain += -14.0 - L
        if abs(L + 14.0) < .05: break
    fo = int(.25 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
    sf.write(out_path, out.astype(np.float32), SR, subtype='PCM_24')
    I, tp, lra = ffmpeg_measure(out_path)
    print(f'{out_path}: I={I:.1f} LUFS TP={tp:.1f} dBTP LRA={lra:.1f}')
    return I, tp
