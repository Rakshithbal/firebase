# R16 · Mistake of the Week · "Skipping the soil test": publishing package

| | |
|---|---|
| Brand | BUYNBUILD (BNB) · The Honest Builder's Guide · Hubballi-Dharwad |
| Format | Instagram reel, vertical 9:16, 1080×1920, 30 fps |
| Series | MISTAKE OF THE WEEK |
| Topic | Why to ask your engineer about a soil test before the foundation is designed |
| Style | "Editorial blueprint" (bnb-editorial-video house style, R05 v2 DESIGN.md): navy blueprint grid, Fraunces headline, Plex Mono kicker, one orange (#EF4B06) idea per scene, one slam |
| Runtime | 41.10 s (VO 0.40 s to 39.18 s), source: `timing_michael.json` |
| Voice | AI voice (Kokoro `am_michael`, speed 1.0), `audio_michael/narration.wav`; word times estimated by character length |
| Master file | `out/R16_soil_test_michael.mp4` (H.264 yuv420p + AAC 48 kHz, -14.1 LUFS integrated, -2.0 dBTP measured on the MP4) |
| Reveal level | Guide only. Nothing about what BNB sells. |
| Status | **Blocked until a structural engineer signs Section 8.** |

---

## 1. Hook (first 3 seconds)

| # | Spoken line | On-screen | Notes |
|---|---|---|---|
| **A, USED** | "This week's mistake: skipping the soil test to save money." (L01, 0.40 to 4.05 s) | Headline *Skipping the soil test.*; a SOIL TEST tag above a probe that never enters the ground gets an orange strike on "skipping" | Names the series and the mistake in one line; no blame. |
| B | "The ground under your house has a say in its design." | *The ground decides.* | Softer, but loses the series format. |

## 2. Script with timestamps (locked, `lines.json`)

| Line | Start | End | Voiceover (verbatim) |
|---|---|---|---|
| L01 | 0.400 | 4.051 | This week's mistake: skipping the soil test to save money. |
| L02 | 4.401 | 9.230 | Your foundation sits on the soil, and the soil decides how it should be designed. |
| L03 | 9.630 | 15.227 | Some soils are firm. Some, like black cotton soil, swell when wet and shrink when dry. [VERIFY: engineer] |
| L04 | 15.677 | 21.955 | Design the foundation without knowing, and it can end up too weak, or costlier than it needs to be. [VERIFY: engineer, "costlier than it needs to be"] |
| L05 | 22.255 | 25.804 | And cracks that show up years later are much harder to fix. |
| L06 | 26.304 | 33.463 | So before your foundation is designed, ask your engineer: do we need a soil test here, and what will it tell us? |
| L07 | 33.813 | 36.827 | A small step, before the biggest part of your house. |
| L08 | 37.227 | 39.178 | Save this before you start digging. |

Logo end card: 38.60 to 41.10 s (last 2.5 s).

## 3. Scene list

| Scene | Time (s) | Kicker · headline | Figure | Orange idea |
|---|---|---|---|---|
| s1 | 0.00 to 4.15 | 01 — This week's mistake · *Skipping the soil test.* | Soil section of an empty plot; a probe hovers above, its dashed line never goes in. SOIL TEST tag, TO SAVE MONEY tag. Fig. 1 "A plot, before anything is built." | Strike through SOIL TEST on "skipping" |
| s2 | 4.15 to 9.38 | 02 — The ground decides · *The soil sets the design.* | House elevation on two columns and footings in soil; SOIL callout; WIDTH and DEPTH dimension lines (words only) on "designed". Fig. 2 | Footing outlines |
| s3 | 9.38 to 15.43 | 03 — Two kinds of ground · *Firm, or on the move.* | Split section: FIRM SOIL (footing stays put) vs BLACK COTTON SOIL: drops fall and the ground + footing rise on "swell when wet", sun and surface cracks as it drops on "shrink when dry", then a slow up/down cycle | Movement arrows (up, then down) |
| s4 | 15.43 to 22.00 | 04 — Designing blind · *Guessing costs either way.* | Soil goes dark with a "?" on "without knowing"; TOO WEAK (small footing that settles) on "too weak", COSTLIER THAN IT NEEDS TO BE (oversized footing) on "costlier". Fig. 4 | The "?" |
| s5 | 22.00 to 26.05 | 05 — Years later · *Cracks come later.* | Open-ended time tape (faded both ends, not countable) with YEARS LATER; brick wall on its footing; red crack draws from the window corner on "cracks". Fig. 5 | **The slam:** HARDER TO FIX stamp + 3-frame shake on "harder" |
| s6 | 26.05 to 33.56 | 06 — Ask first · *Ask your engineer.* | Engineer icon (hard hat, plain round head, no face) and a question card: BEFORE THE DESIGN, ASK · "Do we need a soil test here?" · "What will it tell us?" (each on its word) | Card edge bar |
| s7 | 33.56 to 36.98 | 07 — Before you dig · *A small step, first.* | Small square SOIL TEST → arrow → house and footings in soil (FOUNDATION). Disclaimer line appears | The small step |
| s8 | 36.98 to 41.10 | (hero) *Save this before you start digging.* | Orange bookmark on "Save"; logo end card from 38.60 s with BUYNBUILD · MISTAKE OF THE WEEK | Bookmark |

Throughout: series rail **MISTAKE OF THE WEEK · SOIL TEST** at y 296 with chapter progress, BNB mark top right (x 900, y 150), captions Inter 44 at y≈1462 to 1518 (unspoken muted, spoken chalk), grain + vignette.

## 4. Editor notes

- Files: `index.html` (all scenes; pure `renderAt(t)`, every beat on a spoken word via `W(line, word)`), `render.mjs` (Playwright capture, JPG q92 frames), `build_michael.sh` (3 parallel chunks → encode → deletes `frames_michael/`), `audio/make_audio.py` (music + SFX + master), `fonts/` (Fraunces, Inter, IBM Plex Mono, OFL; copied from the skill template).
- Built on canvas (same proven pipeline as R15) following the house DESIGN.md tokens and layout (kicker y 360, headline y 470, figure y 590 to 1200, figcap y 1222, captions band 1396 to 1550). Orange is #EF4B06 per this brief (DESIGN.md lists #ff8a3d as `--point`).
- Rebuild: `/root/lemo-opuscar/.venv/bin/python audio/make_audio.py && sh build_michael.sh` (~1.5 min). Stills: `NODE_PATH=$(npm root -g) node render.mjs --stills 2,6,13,18,24,31,35 --out stills`.

## 5. Cover text (max 6 words)

| # | Cover text | Notes |
|---|---|---|
| **1, PICK** | **SKIPPED THE SOIL TEST?** | Frame ≈3.6 s (struck-out SOIL TEST tag). |
| 2 | ASK THIS BEFORE YOU DIG | Frame ≈31 s (question card). |

## 6. Instagram caption, alt text, on-screen text

Paste-ready caption: `R16_caption.txt` (keyword-first line, 24 hashtags: soil test, foundation design, black cotton soil, home construction, Karnataka, Hubballi-Dharwad).

**Alt text:** "Animated blueprint-style reel. A soil-test tag above an empty plot is crossed out. A cross-section shows a house on footings in soil. Side by side, firm soil stays still while black cotton soil swells with rain and shrinks in the sun, moving the footing. A guessed foundation is shown too small or oversized, a wall cracks 'years later' and is stamped 'Harder to fix'. A question card says: ask your engineer, do we need a soil test here, and what will it tell us? Ends with 'Save this before you start digging' and the BuyNBuild logo."

**On-screen text list:** MISTAKE OF THE WEEK · SOIL TEST · 01 — THIS WEEK'S MISTAKE · Skipping the soil test. · SOIL TEST · TO SAVE MONEY · FIG. 1 A plot, before anything is built. · 02 — THE GROUND DECIDES · The soil sets the design. · SOIL · WIDTH · DEPTH · FIG. 2 Footings take their shape from the ground. · 03 — TWO KINDS OF GROUND · Firm, or on the move. · FIRM SOIL · BLACK COTTON SOIL · SWELLS WHEN WET · SHRINKS WHEN DRY · 04 — DESIGNING BLIND · Guessing costs either way. · ? · TOO WEAK · COSTLIER THAN IT NEEDS TO BE · FIG. 4 Same house, two wrong guesses. · 05 — YEARS LATER · Cracks come later. · YEARS LATER · HARDER TO FIX · FIG. 5 Movement below can show up in the walls above. · 06 — ASK FIRST · Ask your engineer. · YOUR ENGINEER · BEFORE THE DESIGN, ASK · Do we need a soil test here? · What will it tell us? · 07 — BEFORE YOU DIG · A small step, first. · SOIL TEST · FOUNDATION · General guidance. Confirm with your structural engineer. · Save this before you start digging. · BUYNBUILD · MISTAKE OF THE WEEK · captions (verbatim VO). Only digits on screen: kicker 0N and FIG. N.

**Comment reply template** ("how much does a soil test cost?" / "how deep should the footing be?"): "That depends on your plot and your design, so your structural engineer is the right person to ask. Take the two questions from this reel to that meeting." Never answer with a cost, depth, size or code in comments.

## 7. Sound

- Music: original, synthesized (`audio/make_audio.py`), R05 house palette (felt piano, warm pad, bass), A minor colour for the problem half, the bed dips for the stamp, and a lift into C major with pluck pulse, soft kick and shaker exactly on L06 ("So before your foundation is designed"); resolve chord on "Save".
- SFX (subtle, synthesized): seam swishes, scribble strike, pops on tags, water drops on "swell", shimmer on "shrink", crack, one stamp, paper flick for the card, chimes on the two questions, bookmark on "Save".
- Mix: voice HPF + 2.5:1 compression; music -12 LU, ducked 9 dB under speech; SFX -15 LU. Master **-14.0 LUFS (wav) / -14.1 LUFS (MP4), ceiling -2.0 dBTP, MP4 true peak -2.0 dBTP**.

## 8. Reviewer checklist (structural engineer gate)

**Rule:** do not publish until a qualified structural engineer has ticked every line. Education only: "General guidance. Confirm with your structural engineer." is on screen in s7/s8 and in the caption.

| # | Statement as voiced / shown | Where | OK? | Note |
|---|---|---|---|---|
| F1 | The foundation sits on the soil, and the soil decides how it should be designed. | L02 · s2 WIDTH / DEPTH labels | ☐ | Labels are words only, no sizes. |
| F2 | [VERIFY] Some soils are firm; black cotton soil swells when wet and shrinks when dry. | L03 · s3 split section | ☐ | Engineer to confirm the claim and that the drawn movement (ground and footing rising/falling, surface cracks when dry) is an acceptable simplification and not exaggerated. |
| F3 | Designing without knowing can end up too weak. | L04 · TOO WEAK footing settling | ☐ | |
| F4 | [VERIFY] …or "costlier than it needs to be". | L04 · oversized footing, COSTLIER THAN IT NEEDS TO BE | ☐ | Engineer to confirm wording; no cost or size shown. |
| F5 | Cracks that show up years later are much harder to fix. | L05 · crack + HARDER TO FIX stamp | ☐ | Fig. 5 caption "Movement below can show up in the walls above." is on-screen only, not in the VO. OK? |
| F6 | Ask your engineer: do we need a soil test here, and what will it tell us? | L06 · question card | ☐ | |
| F7 | No numbers spoken or shown (no depths, costs, percentages, bearing values, codes). | All | ☐ | |
| F8 | No faces (engineer icon has a plain head), no logos except BNB, no product, nothing about what BNB sells; no blame on builders or engineers. | All | ☐ | |

**Sign-off:** Engineer name ____________ · Date ____________ · Changes required ____________

## 9. Credits

Script: BNB content team (locked). Voice: Kokoro TTS `am_michael` (offline). Visuals: code-drawn on canvas in the BNB editorial house style; fonts Fraunces, Inter, IBM Plex Mono (OFL). Music and SFX: original, synthesized in numpy. Logo: BUYNBUILD brand files.
