# R05 · Buildpedia · "Curing" — Publishing package

| | |
|---|---|
| Brand | BUYNBUILD (BNB) · The Honest Builder's Guide · Hubballi-Dharwad |
| Format | Instagram reel, vertical 9:16, 1080×1920, 30 fps |
| Series | Buildpedia (one construction term in plain words) |
| Topic | What "curing" means and why it can't be rushed |
| Publish date | 20 Nov 2026 |
| Runtime | 45.51 s (VO 0.40 s to 44.11 s), source: `timing.json` |
| Voice | AI voice (Kokoro `hm_omega`, speed 1.05), file `audio/narration.wav` |
| Reveal level | Guide only. No mention of anything BNB sells. |
| Status | **Blocked until the engineer signs Section 8.** |

---

## 1. Hook options (first 3 seconds)

| # | Spoken line | On-screen text | Notes |
|---|---|---|---|
| **A, USED** | "Your slab looks dry and hard. That does not mean it is done." (L01, 0.40 to 4.06 s) | **LOOKS DONE ✓** → stamped **NOT YET** | Starts from what the family sees on site. The stamp lands on "done." at 3.75 s. |
| B | "Dry is not the same as strong." | **DRY ≠ STRONG** | Shorter, but it gives away the answer before the viewer is curious. |
| C | "Before anyone stops watering your slab, listen to this." | **STOP WATERING? WAIT.** | Practical, but it leans close to alarm, so it sits less well with "protect, don't scare". |

Hook A was used because it starts from something the viewer has seen on their own site. It corrects that impression without blaming anyone.

---

## 2. Word-for-word script with timestamps

The script is locked and voiced. Timestamps (seconds) come from `timing.json`.

| Line | Start | End | Voiceover (verbatim) |
|---|---|---|---|
| L01 | 0.400 | 4.061 | Your slab looks dry and hard. That does not mean it is done. |
| L02 | 4.411 | 8.391 | Concrete does not get strong by drying. It gets strong by curing. |
| L03 | 8.841 | 14.494 | Inside, the cement reacts with water. That reaction builds strength, slowly, day by day. |
| L04 | 14.944 | 19.622 | If the water leaves too early, from sun or wind, the reaction slows down. |
| L05 | 19.872 | 24.470 | The surface can crack, and the concrete can end up weaker than it was designed to be. |
| L06 | 24.970 | 31.804 | So curing means keeping it wet and covered. Ponding on the slab. Wet sacks on columns. Spraying on walls. |
| L07 | 32.304 | 38.410 | How many days? That depends on the cement and the weather. Ask your engineer for the number, and write it down. |
| L08 | 38.710 | 41.664 | Then decide who waters it, every single day. |
| L09 | 42.214 | 44.108 | Save this before your slab day. |

Video ends at 45.51 s on the end card.

### Where a Kannada line could land

The English VO is locked, so each of these would go in as a **small secondary on-screen line** under the main graphic, or as a native-voice pickup in a later Kannada cut. Nobody on our side writes the Kannada.

| After | Time | Placeholder |
|---|---|---|
| L01 | ~3.8 s, under "NOT YET" | [NATIVE WRITER: "It looks dry, but it is not ready yet." Everyday Hubballi site-talk tone.] |
| L06 | ~27.9 s, under "CURING = wet + covered" | [NATIVE WRITER: a short local way to say "keep it wet, keep it covered".] |
| L08 | ~40.3 s, beside "who waters daily ____" | [NATIVE WRITER: "Who will water it every day? Decide now."] |
| L09 | ~43.0 s, under "Save this before your slab day" | [NATIVE WRITER: "Keep this for your slab day."] |

The native writer must not add a number of days, a cement type or any other fact that is not already in the English line.

---

## 3. Scene list

All visuals are motion graphics drawn in code (`lib.js` + `scenes/s1–s7.js`) in blueprint style. There is no camera footage, no AI-generated "real" site, and no people. The art sits in y 200 to 1320, the captions at y ≈1470, and a "BUILDPEDIA" tag at the top (y 175).

| # | Time | Dur. | Shot type | Visual description | Voiceover | On-screen text |
|---|---|---|---|---|---|---|
| s1 | 0.00–4.41 | 4.41 s | Diagram + motion text | Slab cross-section on the blueprint grid, looking finished. A check tag appears, then a stamp hits on "done." | L01 | LOOKS DONE ✓ → **NOT YET** (stamp) |
| s2 | 4.41–8.84 | 4.43 s | Motion text | "DRYING" written, then struck through on "drying."; "CURING" draws in on "curing." | L02 | ~~DRYING~~ → **CURING** |
| s3 | 8.84–14.94 | 6.10 s | Zoom-in (diagram) | Magnifier pushes into the slab. Cement grains and water particles form crystal links. A strength bar fills slowly with no numbers on it. | L03 | (strength bar, unlabelled scale) |
| s4 | 14.94–24.97 | 10.03 s | Illustration / diagram | Sun and wind icons. Water particles rise off the slab. The strength bar stalls short of the "DESIGNED STRENGTH" mark. A crack draws across the surface on "crack,". | L04 + L05 | DESIGNED STRENGTH (target line) · **WEAKER THAN DESIGNED** |
| s5 | 24.97–32.30 | 7.33 s | Illustration (3 cards) | Title, then three cards that pop on the spoken words: water ponded on a slab (27.85 s), wet sacks wrapped on a column (29.20 s), spray on a wall (30.61 s). | L06 | CURING = wet + covered · Ponding · Wet sacks · Spray |
| s6 | 32.30–42.21 | 9.91 s | Motion text (checklist) | "? DAYS" appears, then a checklist builds item by item: cement type, weather, engineer's number ____, who waters daily ____. A row of calendar ticks follows. | L07 + L08 | ? DAYS · Cement type · Weather · Engineer's number ____ · Who waters daily ____ |
| s7 | 42.21–45.51 | 3.30 s | Motion text (end card) | Bookmark icon, then the line and the series sign-off. | L09 | Save this before your slab day · BUYNBUILD · Buildpedia |

Total: 45.51 s.

### Image-generation prompts (fallback only)

**None were needed.** Every illustration is drawn in code on the canvas, so the client prompt's image-generation step was not used. These prompts are fallbacks in case a scene ever has to be swapped for a generated image. Rules for any generated image: it must read as a drawing, never as a photo of a real site, worker or family. Put no text inside the image; the code adds all labels.

| For | Prompt |
|---|---|
| s1 slab | Flat technical illustration, cross-section of a reinforced concrete roof slab resting on two columns, steel bars shown as dots inside, chalk-white line art on blueprint navy (#0E2A47) with a faint grid, simple and clean, no text, no logos, no people. |
| s3 inside concrete | Flat technical illustration, magnified view inside fresh concrete, grey angular cement grains surrounded by small blue water droplets, thin crystal needles growing between grains and linking them, blueprint navy background, chalk-white outlines, no text, no logos, no people. |
| s4 water loss | Flat technical illustration, side view of a concrete slab under a bright sun and wind lines, small blue water droplets rising and leaving the top surface, a thin hairline crack on the surface, blueprint navy background, chalk-white and blue line art, no text, no logos, no people. |
| s5 card 1, ponding | Flat technical illustration, top-angled view of a flat concrete roof slab divided into small square bunds made of mortar, each holding a shallow layer of blue water, blueprint navy background, no text, no logos, no people. |
| s5 card 2, wet sacks | Flat technical illustration, a square concrete column wrapped in wet hessian sacks, darker damp patches and a few drips, blueprint navy background, chalk-white line art, no text, no logos, no people. |
| s5 card 3, spraying | Flat technical illustration, a plain wall with a garden-hose nozzle at the edge of frame spraying a fine fan of water onto it, no hands or person visible, blueprint navy background, no text, no logos, no people. |
| s7 bookmark | Flat icon illustration, a single bookmark ribbon shape, chalk-white outline on blueprint navy, centred, no text, no logos, no people. |

---

## 4. Animation notes for the editor

The animation is already built in code. Changes go into the scene files, not a timeline.

- **Files:** `index.html` (background grid, BUILDPEDIA tag, burned-in captions, scene cross-fades), `lib.js` (palette `P`, helpers `L`), `scenes/s1.js` to `s7.js` (one scene each), `timing.json` (master clock).
- **Timing source of truth is `timing.json`.** Scenes sync to spoken words through `L.wordTime(T, 'L0x', 'word')`. If the VO is ever regenerated, regenerate `timing.json` and the visuals follow on their own. Never retime by hand.
- **Transitions:** 0.28 s cross-fade between scenes (`FADE` in `index.html`). The grid drifts slowly the whole time so no frame is fully static.
- **Key sync points:** "NOT YET" stamp on "done." (3.75 s). Strike on "drying." (6.40 s). CURING on "curing." (7.97 s). Crack on "crack," (20.74 s). Cards at 27.85, 29.20 and 30.61 s. "? DAYS" at 32.30 s. Checklist on "cement" (34.24), "weather" (35.09), "number" (36.99) and "who" (39.53). Save card at 42.21 s.
- **Palette:** navy `#0E2A47`, chalk `#EAF2FF`, water `#4FC3F7`, orange accent `#FF8A3D`, strength green `#7CE0A3`, crack red `#FF5A5A`.
- **No numbers on screen.** The strength bar and "DESIGNED STRENGTH" line have no scale, percentage or MPa. The calendar ticks carry no day numbers and must not stop at a countable "finish" (see Section 8).

**Check stills:**
```bash
cd /home/user/firebase/bnb-videos/r05-curing
NODE_PATH=$(npm root -g) node render.mjs --stills 2,6,12,21,28,36,43     # writes stills/t000xx.png
```

**Full re-render:**
```bash
cd /home/user/firebase/bnb-videos/r05-curing
rm -f frames/*.png
NODE_PATH=$(npm root -g) node render.mjs                    # writes frames/f00000.png ... at 30 fps (1365 frames)
ffmpeg -y -framerate 30 -i frames/f%05d.png -i audio/narration.wav \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -r 30 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  out/R05_curing.mp4
```
To add a music bed, mix it under `narration.wav` first (see Section 7) and pass the mixed file as the second input. Render part of the video with `--from 24 --to 33`.

---

## 5. Cover text (max 6 words)

| Option | Words | |
|---|---|---|
| Looks done? Not yet. | 4 | Same as the hook, but on the grid it doesn't say what the reel is about. |
| Dry slab is not strong slab | 6 | Clear, but a little clunky to read. |
| **Curing: why it can't be rushed** | 6 | **CHOSEN.** It names the Buildpedia term, so the series grid reads like a glossary. |

**Cover build:** use the s2 "CURING" frame (≈8.2 s) or the s1 slab cross-section as the background. Put the cover text large, in chalk white with "rushed" in orange, and keep the small BUILDPEDIA tag above it. Keep all text inside the central 3:4 area (roughly y 240 to 1680) so the profile-grid crop doesn't cut it. Don't put numbers or a check mark on the cover.

---

## 6. Instagram caption, CTA and hashtags

**Caption (64 words):**

> Dry and hard does not mean done.
>
> Concrete gets strong by curing, not drying. Cement keeps reacting with water, slowly. If sun or wind takes the water too early, it can crack and end up weaker than designed.
>
> Before slab day, ask your engineer how many days of curing your slab needs. Then fix who waters it daily: you, the mason or the watchman.

**CTA (14 words), save + send:**

> Save this before your slab day. Send it to whoever is building with you.

Caption + CTA = **78 words**, inside the 40–80 range.

**Hashtags (5):** `#Hubballi #HubballiDharwad #ConcreteCuring #SlabCasting #HouseConstruction`
(two local, three topic. If the team wants a series tag, swap in `#Buildpedia` for `#HouseConstruction`.)

**Caption check against the HARD RULES:**
- No number of days, price, rate, percentage, code or statistic. No digits at all.
- No brands, no rankings, no quotes or testimonials.
- No description of BNB's business, and nothing about materials, property or a directory.
- Every structural point sends the reader to "ask your engineer".
- "can crack / end up weaker" is a possibility, not a scare. No one is blamed: the mason is listed only as one of the people who could do the watering.
- No exclamation marks, hype, "leverage" or "comprehensive".

**Comment reply template (if people ask "how many days?"):**
"It really depends on the cement used and the weather that week. Your site engineer will give you the number for your slab. Write it down and stick to it." Never answer with a figure, even one quoted by a commenter.

**AI disclosure:** the voice and all visuals are AI or code-made. Turn on Instagram's AI label if BNB policy calls for it. Nothing in the reel is presented as a real site, worker or family.

---

## 7. Music, pacing and subtitles

**Music**
- Calm, warm instrumental with no lyrics: soft plucked strings or light piano with a gentle pulse, around a medium walking pace. No dramatic "danger" stings, because the brief is to protect, not scare.
- Use only a properly licensed track (Instagram's in-app library or a royalty-free source with the licence saved in the project folder).
- Sit the bed well under the voice, roughly 18–20 dB below the VO, and duck it a little more during L07 to L08 (32.3 to 41.7 s) so "ask your engineer" and "who waters it" come through cleanly.
- Leave the tail open after the VO ends (44.11 s) and fade it out by 45.51 s.
- Aim for an integrated loudness of about −14 LUFS with peaks below −1 dBTP.

**Pacing**
- The VO has short breaths of 0.25 to 0.5 s between lines, and each one lines up with a scene change. Don't trim them; they give the viewer a moment to read.
- Soft sound accents (optional, low): a stamp thud on "NOT YET" (3.75 s), a pen scratch on the strike (6.40 s), a light crackle on "crack," (20.74 s), small pops for the three cards and the checklist ticks, and a soft click on the bookmark (42.21 s).
- The longest scene, s4 (10 s), holds attention through movement: water leaving, the bar stalling, the crack drawing. Don't speed it up.

**Burned-in subtitles** (already built into `index.html` → `captions()`)
- **Word by word:** each line splits into chunks of up to 4 words, breaking at commas, full stops and question marks. Chunks follow the per-word times in `timing.json`.
- **Highlight:** the word being spoken is **orange `#FF8A3D`**. Words already spoken are chalk white `#EAF2FF`. Upcoming words in the chunk are white at 55% opacity.
- **Style:** Inter 800, 58 px, on a dark navy rounded pill (`rgba(6,20,36,0.78)`, 24 px radius) for contrast on any frame.
- **Safe-zone placement:** centred horizontally at y = 1470 (pill ≈ y 1418 to 1522). That keeps it below the scene art (y 200 to 1320) and above Instagram's bottom UI (caption, audio and username, roughly the bottom 340 px). It is centred, so the right-hand like/comment/share column doesn't cover it; keep any chunk under ≈ 860 px wide. The top band above y ≈ 150 also stays clear for the IG header.
- Subtitles must match the VO word for word, so don't paraphrase. Also export an SRT (one cue per line L01 to L09, using the start and end times above) to upload as Instagram captions for accessibility.
- Check that the ✓ glyph in "LOOKS DONE ✓" renders in the loaded font. If it shows as a box, draw it as a path.

---

## 8. Reviewer's checklist (engineer gate)

**Rule:** don't publish until a qualified site or structural engineer has ticked every line below. This reel is **education only**; the viewer is told to confirm with their own engineer.

### 8a. Construction-fact lines

| # | Fact as stated | Where it appears | Confirm by | OK? | Note / fix |
|---|---|---|---|---|---|
| F1 | A slab can look dry and hard while it is still not done (not fully cured or strong). | VO L01 · s1 "LOOKS DONE ✓ → NOT YET" · caption line 1 | Site engineer | ☐ | |
| F2 | Concrete does not get strong by drying; it gets strong by curing. | VO L02 · s2 ~~DRYING~~ → CURING · caption | Site engineer | ☐ | |
| F3 | Inside, the cement reacts with water (hydration). | VO L03 · s3 grains + water forming crystal links · caption | Site engineer | ☐ | Is the crystal-link drawing an acceptable simplification? |
| F4 | That reaction builds strength slowly, day by day. | VO L03 · s3 strength bar filling slowly · caption "slowly" | Site engineer | ☐ | |
| F5 | If the water leaves too early (sun or wind), the reaction slows down. | VO L04 · s4 evaporation, sun + wind, bar stalls · caption | Site engineer | ☐ | |
| F6 | The surface can crack. | VO L05 · s4 crack · caption | Site engineer | ☐ | |
| F7 | The concrete can end up weaker than it was designed to be. | VO L05 · s4 bar short of "DESIGNED STRENGTH", "WEAKER THAN DESIGNED" · caption | Site engineer | ☐ | |
| F8 | Curing means keeping it wet and covered. | VO L06 · s5 "CURING = wet + covered" | Site engineer | ☐ | |
| F9 | Ponding is a curing method for slabs. | VO L06 · s5 card 1 | Site engineer | ☐ | |
| F10 | Wet sacks are a curing method for columns. | VO L06 · s5 card 2 | Site engineer | ☐ | |
| F11 | Spraying is a curing method for walls. | VO L06 · s5 card 3 | Site engineer | ☐ | Is "walls" right without saying concrete, masonry or plaster? |
| F12 | How many days depends on the cement and the weather. | VO L07 · s6 "? DAYS", "Cement type", "Weather" | Site engineer | ☐ | Is "cement and weather" fair as the main factors for a homeowner reel, even if other factors exist? |
| F13 | The engineer should give the number of curing days for your job. | VO L07 · s6 "Engineer's number ____" · caption | Site engineer | ☐ | |
| F14 | Curing needs someone to water it every single day for the whole period. | VO L08 · s6 "Who waters daily ____" · caption "waters it daily" | Site engineer | ☐ | Could "every single day" or "daily" be read as "once a day is enough"? Engineer to judge. |

### 8b. No-number check (curing period and any other figure)

| Check | Where | OK? |
|---|---|---|
| No number of days is spoken anywhere in the VO (L01 to L09). Confirmed: none. | Audio | ☐ |
| No digit or number word shown on screen in any scene: no "7", "14", "28", no %, no MPa, no scale on the strength bar or the DESIGNED STRENGTH line. | Video, all scenes | ☐ |
| **s6 calendar ticks:** the ticks have no numbers, and their count (currently seven) must not read as "cure for 7 days". Fix by running the row off-frame or ending it with "…", so it shows "every day" and not a fixed period. **Needs an explicit reviewer decision.** | s6, ≈38.7 to 42.2 s | ☐ |
| "? DAYS" stays a question, and "Engineer's number ____" and "Who waters daily ____" stay blank. | s6 | ☐ |
| No digits or number of days in the cover text. | Cover | ☐ |
| No digits or number of days in the caption, CTA or hashtags. Confirmed by search: none. | Caption | ☐ |
| No number of days in pinned or first comments or in replies (use the template in Section 6). | Comments | ☐ |

### 8c. Brand and production checks

| Check | OK? |
|---|---|
| No cement, admixture or curing-compound brand names, logos or rankings anywhere. | ☐ |
| Nothing says what BNB sells. There is no business-model line, and materials, property and directory are never mentioned together. BNB is never called a club or ecosystem. End card reads only "BUYNBUILD · Buildpedia". | ☐ |
| No invented quotes, reviews, testimonials or case studies. | ☐ |
| Everything is diagram or illustration. No AI image or footage is presented as a real site, worker, family or before/after. | ☐ |
| Tone protects without scaring, and no contractor, mason or dealer is blamed. | ☐ |
| Any Kannada line added by the native writer has been checked against the English meaning and adds no new facts. | ☐ |

**Sign-off:** Engineer name ____________ · Date ____________ · Changes required: ____________
