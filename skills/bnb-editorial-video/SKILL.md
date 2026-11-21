---
name: bnb-editorial-video
description: Make a BUYNBUILD (BNB) editorial motion-graphics video in the R05 v2 house style - NYT/Bloomberg/Vox-style explainer drawn on a navy blueprint grid, rendered with HyperFrames, with Kokoro voice, word-locked beats, editorial captions, original synthesized music and a publishing package. Use this skill whenever the user asks for a new BNB / BUYNBUILD reel, a Buildpedia, Loan Lens or "Fix It Before It Spreads" episode, a construction / home-building explainer for Hubballi-Dharwad families, a YouTube explainer (16:9) in the BNB look, a paid-client explainer video "in our editorial style", or mentions "editorial", "blueprint", "R05 style", "house template", "like the curing reel" - even if they don't name the skill. Also use it to re-theme the system for a client, add a scene, switch a project between 9:16 and 16:9, or rebuild/re-deliver an existing BNB HyperFrames project.
---

# BNB editorial video

A reusable production line for the R05 v2 look: calm editorial type (Fraunces / Inter / Plex Mono), precise drawn
sections on a blueprint grid, **one idea and one orange thing per scene**, beats landing on spoken words, sentence-level
captions, grain, synthesized underscore. Quality comes from the system (DESIGN.md + `bnb.js` helpers + the scene
contract), so follow it rather than improvising.

Skill layout (`SKILL` = this folder):

```
SKILL.md                    this workflow
references/DESIGN.md        THE LAW: tokens, type scale, grid, 9:16 + 16:9 layouts, motion, captions, texture, scene contract
references/brand-bnb.md     voice, hard content rules, series + kicker conventions, script shape
references/scene-recipes.md catalogue of R05 scenes as reusable recipes (helpers + where the code is)
references/client-theming.md re-skinning for a paid client (palette, fonts, rail, sign-off; what must stay)
references/package-template.md the 8-section publishing package + caption rules + SRT export
template/                   generic HyperFrames starter (config-driven; examples/r05-curing = reference scenes, not wired in)
scripts/new_project.py      scaffold a project from template/
scripts/make_vo.py          lines.json -> Kokoro voice -> timing.json + assets/audio/narration.wav
scripts/make_audio.py       cues.json -> original music + SFX + ducked mix, -14 LUFS, TP <= -1.5 dBTP
scripts/build.sh            gen -> check -> render -> mux -> delivery encode -> contact sheet
```

Read `references/DESIGN.md` before writing any composition, and `references/brand-bnb.md` before writing any script.

## Every shell

```bash
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 PATH=/root/.local/bin:$PATH   # ffmpeg >= 7 lives in /root/.local/bin
```
HyperFrames is pinned: `npx --yes hyperframes@0.9.58 …` (the project's `npm run check|render|dev` scripts use it).
Python audio needs numpy/scipy/soundfile: `make_audio.py` re-execs itself with `/root/lemo-opuscar/.venv/bin/python`.

## Workflow (brief → delivered package)

1. **Brief.** Series (Buildpedia / Loan Lens / Fix It Before It Spreads / client), topic, format (9:16 reel or 16:9
   YouTube), the professional who signs off (engineer / bank + CA / advocate), CTA (save or send).
2. **Script within the brand rules** (`brand-bnb.md`): 7–9 short lines for a 35–50 s reel (2–3 for a teaser), hook
   from the viewer's own site, possibility not fear, no invented numbers, ends at the professional + CTA. Get the
   lines approved and lock them in `lines.json` (`{"id":"L01","text":"…","gap":0.35}`; `"say"` = pronunciation only).
3. **Scaffold:**
   `python3 SKILL/scripts/new_project.py <dir> --slug r21-plinth --format 9:16 --series Buildpedia --title "What a plinth is"`
   then write `lines.json` and `project.json` `"scenes"`: one entry per scene
   `{"id":"s1","kicker":"The myth","lines":["L01"],"headline":"Looks <em>done.</em>","deck":"…","figcap":"…"}`;
   the last is usually `{"type":"endcard", "headline":"Save this<br />before your<br /><em>slab day.</em>", "tag":"…"}`.
   Scene slots come from line timings (scene k starts at its first line's start; scene 1 at 0).
4. **Voice + timing:** `python3 SKILL/scripts/make_vo.py <dir>` (house voice `hm_omega` 1.05; `--voice/--speed`;
   `--align` tries Whisper word timestamps — it needs the Whisper model from huggingface.co, which this sandbox
   blocks, so it falls back to the letter-weight estimate; check word landings in snapshots). Then `cd <dir> && python3 tools/gen.py` — writes index.html, project.js,
   timing.js, theme.css, captions.html and creates any missing `compositions/sN.html` from the templates.
   (gen.py works before the voice exists using ESTIMATED timing — fine for layout, rerun after make_vo.)
5. **Art-director pass (only if a new visual idea):** decide each scene's single idea, its orange element, the one
   slam (if any) and the transitions (match cut / object-becomes-world / blur swap). Write that as a short table in
   the project (`SCENES.md`) for the scene agents. Promote any drawing two scenes need into `assets/bnb.js` first.
6. **Scene builds — parallel agents, one per 2 scenes.** Each agent gets: DESIGN.md, scene-recipes.md, the scene
   table, its scene ids, and the rule "edit ONLY your `compositions/sN.html`". Build with `BNB.*` helpers and
   `BNB.STAGE` geometry (no literal canvas numbers), beats on `at("word")`, `fromTo` only, ids prefixed `sN-`.
   Each agent finishes with `npm run check` (0 errors) and snapshots of its scenes that it has looked at.
7. **Integration pass (art director):** seams (each boundary ±0.2 s), one orange idea per scene, one slam per film,
   rail/kicker/figcap positions consistent, no digits except `0N`/`Fig. N`, content rules. Write `REVIEW.md`.
8. **Check + boundary snapshots:**
   `npm run check` → 0 errors (accepted warnings: safe-zone edges for TikTok/Shorts, caption band, 22–24 px mono
   labels under the 28 px floor, contrast on deliberately muted states, short-lived callouts).
   `npx --yes hyperframes@0.9.58 snapshot --at 0,<each seam−0.2>,<each seam+0.3>,<end−0.5> --no-end --output snapshots`
   then **Read the PNGs** — the frame-0 thumbnail, every seam and the end card. Without `--output` they land in
   `.hyperframes/artifacts/snapshots/<id>/`.
9. **Music + SFX:** `python3 SKILL/scripts/make_audio.py <dir> --init-cues` (seam swishes, end-card bookmark, lift at
   the "solution" scene; mark it with `"lift": true` in project.json), add one soft cue per key beat in `cues.json`
   (time by `"word": ["L04","crack"]`, never retype numbers), then `python3 SKILL/scripts/make_audio.py <dir>` and
   `python3 tools/gen.py` (index.html now carries `assets/audio/final_mix.wav`).
10. **Render → mux → delivery → contact sheet:** `bash build.sh` in the project (`--draft` for a fast preview,
    `--skip-render` to re-mux only). Outputs `out/<slug>_master.mp4` (CRF 17, AAC 192k), `out/<slug>_ig.mp4` (or
    `_yt.mp4` for 16:9: CRF 20, maxrate 12M), `out/<slug>_contact.png`. **Look at the contact sheet.**
11. **Publishing package:** `<ID>_package.md` per `references/package-template.md` (8 sections; Section 8 blocks
    publishing until the professional signs). Export the SRT. Report paths + accepted warnings.

### Exact command sequence (copy/paste)

```bash
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 PATH=/root/.local/bin:$PATH
SKILL=~/.claude/skills/bnb-editorial-video          # or /home/user/firebase/skills/bnb-editorial-video
P=/home/user/firebase/bnb-videos/r21-plinth
python3 $SKILL/scripts/new_project.py $P --slug r21-plinth --format 9:16 --series Buildpedia --title "What a plinth is"
$EDITOR $P/lines.json $P/project.json                # locked script + scene list
python3 $SKILL/scripts/make_vo.py $P                 # -> timing.json, assets/audio/narration.wav
cd $P && python3 tools/gen.py                        # -> index.html, captions, compositions/sN.html stubs
# … build scenes (agents), then:
npm run check
npx --yes hyperframes@0.9.58 snapshot --at 0,4.2,4.7 --no-end --output snapshots   # Read the PNGs
python3 $SKILL/scripts/make_audio.py $P --init-cues && $EDITOR cues.json && python3 $SKILL/scripts/make_audio.py $P
python3 tools/gen.py && bash build.sh                # -> out/<slug>_master.mp4, _ig.mp4|_yt.mp4, _contact.png
```

## Rules (why they matter)

- **DESIGN.md is law.** The series reads as a series because every scene uses the same anatomy, type and motion.
  When DESIGN.md is silent, copy the golden scene `examples/r05-curing/compositions/s1.html`.
- **One orange idea per scene** (`--point`): the eye needs one place to land; two oranges = no point.
- **One slam per film** (the stamp + 3-frame shake). Everything else is a calm state change.
- **Safe areas:** 9:16 visuals in y 270–1250, captions band 1396–1550, nothing key right of x 960 below y 1000;
  16:9 text column x 120–806, figure x 860–1800 / y 170–790, captions 872–968, title-safe y 108–972.
- **Determinism:** no `Math.random` (use `BNB.rng`), no `Date`, no timers, no `repeat:-1`, no DOM created after init,
  no `getBBox` at init, one paused timeline per composition registered on `window.__timelines`.
- **Generated files are never hand-edited** (index.html, captions.html, project.js, timing.js, theme.css): change
  project.json / lines.json / timing.json and rerun `tools/gen.py`.
- **Format differences live in `bnb.css` variables or `BNB.LAND` in script.** Sub-composition `<style>` blocks are
  scoped by HyperFrames, so `:root[data-format="16x9"] #x {…}` inside a scene never matches.

## Content hard rules (a breach blocks publishing)

- **No invented numbers**: no days, percentages, rates, MPa, amounts, codes, statistics — in VO, on screen, caption,
  cover, comments. Only on-screen digits: kicker `0N` and `Fig. N`. Values are unscaled bars; answers are blanks.
- **Education only**: send the viewer to the professional — "confirm with your engineer / advocate / CA / bank".
- **No faces, people, hands, logos, brand names, photos or AI imagery**; everything is drawn. No invented quotes.
- **Never a countable day strip** — "every day" is an open-ended tape faded at both ends.
- Nothing about what BNB sells; end card is `BUYNBUILD · <Series>` only. Protect, don't scare; blame nobody.

## Known gotchas

- **Hatch ids are per svg:** `BNB.hatch()` prefixes the pattern id with the owning svg id; always use the returned
  `url(#…)`. A hand-written shared id resolves into a hidden scene and paints nothing.
- **Callout / label colour:** pass `{fill}` / `color` to `BNB.text` / `BNB.callout`; the inline fill beats the
  `.t-*` class colour (class CSS outranks SVG presentation attributes).
- **GSAP svgOrigin on hidden hosts:** GSAP mis-measures SVG transforms on a group whose host is hidden at init. For
  a group that scales/moves as a whole (s3 lens) tween the attribute instead:
  `tl.fromTo(g, {attr:{transform:"translate(…) scale(…)"}}, {attr:{transform:"…"}})`. For single elements pass an
  explicit `svgOrigin: "x y"` from known geometry (never getBBox).
- **Grain → big files:** masters run ~24 Mb/s (R05 45 s = 137 MB). Always deliver the `-crf 20 -maxrate 12M
  -bufsize 24M` encode (build.sh does it); platforms re-encode anyway.
- **Render times** (software capture, screenshot mode — HeadlessExperimental is unavailable here): ≈5 s of render
  per second of film (8.7 s smoke test: 46 s; R05 45.5 s: 252 s) + x264 slow encode. Use `--draft` while iterating.
  Run renders in the background; never two renders at once.
- `npm run check` lints only compositions wired into index.html, so `_scene-template.html` / `examples/` are inert.
- An end card's last line must hold ≥ 2 s (the template clamps it); keep `"tail"` ≥ 1.4 s in the voice config.
- Snapshots go to `.hyperframes/artifacts/snapshots/<id>/` unless `--output snapshots`.
- `[non-blocking] Failed to load resource: 404` during render is the browser favicon probe; ignore it.

## Variants

- **YouTube explainer (16:9):** `--format 16:9`; layout = text column left, figure right (DESIGN.md §2). Scenes
  written against `BNB.STAGE.fig` work in both formats; snapshot every scene after switching. Longer scripts are fine
  (3–8 min); keep one idea per scene and use chapters (scene starts) in the description.
- **Paid client:** `references/client-theming.md` — theme/fonts/rail/sign-off in project.json, the grammar unchanged,
  client hard rules in a project-local copy of brand-bnb.md.
- **Reusing an R05 scene:** `references/scene-recipes.md` lists each recipe and how to port it.
