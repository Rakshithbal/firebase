"""Soundtrack for the demo: Bhavesh's voice + a soft plucked-guitar loop (synthesised, no samples)
+ paper/pop sound effects at the moments listed in out/sfx.json."""
import json, subprocess
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
SR = 48000
meta = json.loads((HERE / "out/sfx.json").read_text())
DUR, LEAD = meta["dur"], meta["lead"]
N = int(DUR * SR)
rng = np.random.default_rng(3)


def pluck(freq, dur, bright=0.5):
    """Karplus-Strong string."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * (bright * buf[i % p] + (1 - bright) * buf[(i + 1) % p]) if True else 0
    env = np.exp(-np.arange(n) / (SR * 1.1))
    return out * env


# ---- music: I - V - vi - IV in G, gentle arpeggio, 92 bpm
note = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [[55, 62, 67, 71, 74], [50, 57, 62, 66, 69], [52, 59, 64, 67, 71], [48, 55, 60, 64, 67]]
beat = 60 / 92
music = np.zeros(N + SR * 3)
pattern = [0, 2, 3, 4, 3, 2, 1, 3]
cache = {}
t = 0.0
bar = 0
while t < DUR:
    ch = chords[bar % 4]
    for k, idx in enumerate(pattern):
        m = ch[idx]
        if m not in cache:
            cache[m] = pluck(note(m), 2.2, 0.5)
        s = int((t + k * beat / 2) * SR)
        seg = cache[m] * (0.9 if k == 0 else 0.55)
        music[s:s + len(seg)] += seg[: len(music) - s]
    t += beat * 4
    bar += 1
music = music[:N]
music /= np.abs(music).max() + 1e-9


# ---- sfx
def tone(f0, f1, d, decay):
    n = int(d * SR); tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / decay)


def noise(d, decay, lo=0.0):
    n = int(d * SR)
    x = rng.normal(0, 1, n)
    if lo:
        x = np.convolve(x, np.ones(int(lo)) / lo, "same")
    return x * np.exp(-np.arange(n) / SR / decay)


SOUNDS = {
    "pop": lambda: tone(900, 420, 0.12, 0.03) * 0.5,
    "tick": lambda: tone(1500, 1100, 0.06, 0.012) * 0.35,
    "thump": lambda: tone(120, 55, 0.35, 0.09) * 0.9 + noise(0.35, 0.03, 6) * 0.25,
    "rustle": lambda: (noise(0.35, 0.12) - noise(0.35, 0.12, 12)) * 0.12,
    "scratch": lambda: (noise(0.25, 0.1) - noise(0.25, 0.1, 4)) * 0.18,
    "drip": lambda: tone(700, 1300, 0.12, 0.03) * 0.3,
}
fx = np.zeros(N)
for t0, kind in meta["events"]:
    s = SOUNDS[kind]()
    i = int(t0 * SR)
    fx[i:i + len(s)] += s[: max(0, N - i)]

# ---- voice
vo = subprocess.run(["ffmpeg", "-v", "error", "-i", str(HERE / "audio/vo_raw.mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                    capture_output=True, check=True).stdout
vo = np.frombuffer(vo, np.float32).astype(np.float64)
voice = np.zeros(N)
i = int(LEAD * SR)
voice[i:i + len(vo)] = vo[: N - i]

# duck the music under the voice
env = np.abs(voice)
k = int(0.25 * SR)
env = np.convolve(env, np.ones(k) / k, "same")
duck = 1 - 0.55 * np.clip(env / (env.max() * 0.25 + 1e-9), 0, 1)
fade = np.minimum(1, np.minimum(np.arange(N) / (SR * 1.0), (N - np.arange(N)) / (SR * 1.6)))
mix = voice * 1.0 + music * 0.11 * duck * fade + fx * 0.6
mix /= max(1.0, np.abs(mix).max() / 0.95)
pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "aac", "-b:a", "192k",
                str(HERE / "out/demo_mix.m4a")], input=pcm.tobytes(), check=True)
print("wrote out/demo_mix.m4a", DUR)
