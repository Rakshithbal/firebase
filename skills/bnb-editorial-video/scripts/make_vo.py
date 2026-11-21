#!/usr/bin/env python3
"""Voice + timing for a BNB editorial project:  lines.json -> per-line WAVs -> timing.json + narration.wav

usage:  python3 make_vo.py <project_dir> [--voice hm_omega] [--speed 1.05] [--engine kokoro|elevenlabs]
                           [--lead 0.4] [--gap 0.4] [--tail 1.4] [--align]

Reads   <project>/lines.json      [{"id":"L01","text":"...", "gap": 0.35 (optional pause BEFORE this line)}]
        <project>/project.json    "voice": {...} defaults (CLI flags win)
Writes  <project>/assets/audio/voice/<id>.wav   one file per line (engine output)
        <project>/timing.json                   {total, fps, w, h, lines:[{id,text,start,end,words:[{w,s,e}]}]}
        <project>/assets/audio/narration.wav    mono 48 kHz, every line placed on the film timeline
Then run  python3 tools/gen.py  in the project (scene slots + captions follow the new timing).

Word timings: by default each line's duration is split over its words by letter weight (good enough for
landing visuals within ~0.1 s on short lines). --align runs Whisper (Lemo-Opuscar core/tts/asr_check.py) and
uses its real per-word timestamps when the transcript matches the script; it falls back to the estimate otherwise.

Engines
  kokoro      offline, Lemo-Opuscar core/tts/tts.py (Kokoro ONNX). House voice: hm_omega at 1.05.
  elevenlabs  PLACEHOLDER. When an ELEVENLABS_API_KEY exists, implement synth_elevenlabs() below with the
              /v1/text-to-speech/{voice_id}/with-timestamps endpoint: it returns audio + character alignment,
              which gives real word timings (fill `words` from it instead of the estimate). Keep 48 kHz mono WAV out.
"""
import argparse, json, os, re, subprocess, sys

LEMO = os.environ.get("LEMO_OPUSCAR_HOME", "/root/lemo-opuscar")
LEMO_PY = os.path.join(LEMO, ".venv/bin/python")

ap = argparse.ArgumentParser()
ap.add_argument("project")
ap.add_argument("--voice"); ap.add_argument("--speed", type=float); ap.add_argument("--engine")
ap.add_argument("--lead", type=float); ap.add_argument("--gap", type=float); ap.add_argument("--tail", type=float)
ap.add_argument("--align", action="store_true", help="use Whisper word timestamps (asr_check.py) when they match")
a = ap.parse_args()

proj = os.path.abspath(a.project); os.chdir(proj)
P = json.load(open("project.json")) if os.path.exists("project.json") else {}
V = dict({"engine": "kokoro", "voice": "hm_omega", "speed": 1.05, "lead": 0.4, "gap": 0.4, "tail": 1.4}, **(P.get("voice") or {}))
for k in ("voice", "speed", "engine", "lead", "gap", "tail"):
    if getattr(a, k) is not None: V[k] = getattr(a, k)
W, H = (1920, 1080) if P.get("format") == "16:9" else (1080, 1920)
L = json.load(open("lines.json"))
vdir = os.path.join("assets", "audio", "voice"); os.makedirs(vdir, exist_ok=True)


def synth_kokoro(lines, out_dir):
    spec = os.path.abspath(os.path.join(out_dir, "lines_tts.json"))
    json.dump([{"id": x["id"], "text": x.get("say", x["text"]), "voice": V["voice"], "speed": V["speed"], "lang": "en-us"} for x in lines], open(spec, "w"))
    r = subprocess.run([LEMO_PY, "core/tts/tts.py", spec, os.path.abspath(out_dir)], cwd=LEMO, capture_output=True, text=True)
    if r.returncode: sys.exit("make_vo: Kokoro TTS failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.load(open(os.path.join(out_dir, "dur.json")))


def synth_elevenlabs(lines, out_dir):
    if not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("make_vo: --engine elevenlabs needs ELEVENLABS_API_KEY (ask for it as a network credential; never paste keys in chat).")
    # TODO when a key exists: POST https://api.elevenlabs.io/v1/text-to-speech/<voice_id>/with-timestamps
    # per line, decode audio_base64 -> <out_dir>/<id>.wav (48 kHz mono via ffmpeg), and return {id: duration_s}.
    # Also keep alignment.characters/character_start_times_seconds to build real word timings.
    sys.exit("make_vo: the ElevenLabs engine is a placeholder; implement synth_elevenlabs() (see docstring) or use --engine kokoro.")


dur = (synth_elevenlabs if V["engine"] == "elevenlabs" else synth_kokoro)(L, vdir)

aligned = {}
if a.align:
    r = subprocess.run([LEMO_PY, "core/tts/asr_check.py", os.path.abspath(os.path.join(vdir, "lines_tts.json")), os.path.abspath(vdir), "--lang", "en"],
                       cwd=LEMO, capture_output=True, text=True)
    wj = os.path.join(vdir, "words.json")
    if os.path.exists(wj):
        try:
            raw = json.load(open(wj))
            for lid, ws in (raw.items() if isinstance(raw, dict) else []):
                aligned[lid] = ws
        except Exception as e:
            print("make_vo: could not read words.json:", e)
    if not aligned: print("make_vo: --align gave no usable word timestamps; using the letter-weight estimate.\n" + (r.stdout + r.stderr)[-800:])


def norm(w): return re.sub(r"[^a-z0-9']", "", w.lower())


t = V["lead"]; out = []; place = []
for i, x in enumerate(L):
    if i: t += float(x.get("gap", V["gap"]))
    s = t; dd = float(dur[x["id"]]); words = x["text"].split(); ws = None
    al = aligned.get(x["id"])
    if al and len(al) == len(words):
        try:
            ws = [{"w": w, "s": round(s + max(0.0, float(q.get("start", q.get("s"))) - 0.6), 3),
                   "e": round(s + max(0.0, float(q.get("end", q.get("e"))) - 0.6), 3)} for w, q in zip(words, al)]
        except Exception:
            ws = None
    if ws is None:
        wt = [len(re.sub(r"\W", "", w)) + 1.5 for w in words]; tot = sum(wt); c = s; ws = []
        for w, k in zip(words, wt):
            d = dd * k / tot; ws.append({"w": w, "s": round(c, 3), "e": round(c + d, 3)}); c += d
    out.append({"id": x["id"], "text": x["text"], "start": round(s, 3), "end": round(s + dd, 3), "words": ws})
    place.append((x["id"], s)); t = s + dd
total = round(t + V["tail"], 2)
json.dump({"total": total, "fps": int(P.get("fps", 30)), "w": W, "h": H, "voice": V, "lines": out}, open("timing.json", "w"), indent=1)

inp, flt = [], []
for k, (i, s) in enumerate(place):
    inp += ["-i", os.path.join(vdir, "%s.wav" % i)]
    flt.append("[%d:a]aresample=48000,adelay=%d|%d[a%d]" % (k, int(s * 1000), int(s * 1000), k))
flt.append("".join("[a%d]" % k for k in range(len(place))) + "amix=inputs=%d:normalize=0,apad,atrim=0:%s[o]" % (len(place), total))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-filter_complex", ";".join(flt), "-map", "[o]", "-ac", "1", "-ar", "48000",
                os.path.join("assets", "audio", "narration.wav")], check=True)
print("make_vo: %d lines, voice %s @ %s, total %.2f s%s -> timing.json, assets/audio/narration.wav"
      % (len(L), V["voice"], V["speed"], total, " (aligned)" if aligned else ""))
for l in out: print("  %s %6.3f-%6.3f  %s" % (l["id"], l["start"], l["end"], l["text"]))
print("next: python3 tools/gen.py")
