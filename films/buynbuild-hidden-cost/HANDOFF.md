# Handoff: produce "The ₹5 Lakh Nobody Told You About"

Status: **script APPROVED by the user** (see `SCRIPT_DRAFT.md`), with one change: **make it 7 minutes**.
Branch: `ccr-53a1d41b-57z1di` in `rakshithbal/firebase`.

## What to build

A 7:00 (±10 s) 16:9 YouTube explainer made with the `cinematic-film` skill at `.claude/skills/cinematic-film/` (read its `SKILL.md` first). The finished Wright brothers film in `films/wright/` (`scene.py`, `kokoro_say.py`) is a working example of every step below.

## Steps

1. **Setup** (fresh container): `pip install skia-python numpy pillow scipy kokoro-onnx soundfile`, `apt-get install -y libegl1 espeak-ng`, then `python3 .claude/skills/cinematic-film/scripts/check_setup.py` until it says `ready`. Download the Kokoro model into the scratchpad from GitHub releases: `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx` and `.../voices-v1.0.bin`. Hugging Face and Wikimedia are blocked in this environment; GitHub and npm work.
2. **Script to 7 min:** turn `SCRIPT_DRAFT.md` into `films/buynbuild-hidden-cost/script.json` (format: see `films/wright/script.json`; numbers spelled out in `spoken`). The approved draft is about 810 words, about 6 min with this voice (am_michael speaks about 14.5 letters/s). Add about 150–180 words, mainly to Leak 2 (the extras list) and Leak 4 (brand/grade), in the same tone, without new facts that aren't on buynbuild.blog. Run `make_beats.py` and fix every warning.
3. **Voice:** Kokoro `am_michael` via `films/wright/kokoro_say.py` (`tts_say.py --cmd "python3 <path>/kokoro_say.py --model <dir> --voice am_michael {txt} {out}"`), then `split_takes.py` and `build_narration.py`. Check the total is 6:50–7:10.
4. **Images:** Google Drive folder **"BUYNBUILD images"** (id `13tuN54eCbnb0CfxRCmw-1MDnz9M-6yMt`), subfolders `Priority 1 - Photo`, `Priority 2 - Photo`, `Priority 1 - Diagram`, `Priority 2 - Diagram`. File names match the ones listed under "ON SCREEN" in the script. Download with the Google Drive connector, put them in `assets/photos/`, and list them in `photos.json` with `"file"` entries and credit "BuyNBuild (own image)". **Look at every diagram and check its printed text and maths before using it.** The images are AI-style illustrations; that's fine for this explainer.
5. **Scene:** write `scene.py` in the `studio` or `charcoal` look (product/explainer style, natural colour grade). Required elements: a running "LEAK METER" counter (₹25,00,000 → ₹30,24,000), chapter cards for each leak, stamps, the six-question checklist at the end, an "ILLUSTRATIVE EXAMPLE" label on the family hook, and "indicative, Oct 2026" on rate cards. Keep captions' bottom 26% clear of big numbers.
6. **Look test:** probe one still per line at 1280x720 and review them all. **Gate:** send the user stills of the opening.
7. **Draft:** first 30 s at 1280x720. **Gate:** the user watches it.
8. **Finish:** `render.py --cues` → `build_sfx.py` → `mix_soundtrack.py` → 1080p render → `burn_captions.py --style highlighter` → SRT. Compress a 720p copy under about 60 MB to send to the user. Keep files over 50 MB out of git (`.gitignore` the render chunks, `out/burn/`, and the 1080p files).

## Facts the user approved without changing (keep the cautious wording)

Curing 7 days OPC / 10 days blended (IS 456); e-khata needed for registration in Bengaluru; banks prefer A-khata; OC needed for permanent connections in "many cities".

## Lessons from the Wright film

- Render the full film in the background and wait for the notification; 94 s at 1080p took about 11 min on 3 workers, so 7 min will take about 50 min plus captions.
- Commit as you go (a stop hook requires a clean tree), but never commit `out/chunks/`, `out/burn/` or `out/probe/`.
