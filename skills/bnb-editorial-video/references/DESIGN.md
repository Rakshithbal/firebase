# BNB editorial design system (house template, from R05 v2)

The look: a NYT / Bloomberg / Vox graphics explainer drawn on a blueprint. Calm type, precise linework,
one idea per scene, one orange thing per scene. Golden reference scene: `examples/r05-curing/compositions/s1.html`.
Follow this file exactly; when it is silent, copy what s1 does.

Contents: 0 Files & ownership · 1 Type · 2 Grid, layout, safe areas (9:16 and 16:9) · 3 Colour · 4 Illustration ·
5 Motion · 6 Helper API · 7 Captions · 8 Texture · 9 Scene file contract · 10 Content rules

---

## 0. Files and ownership

| File | Owner | Notes |
|---|---|---|
| `project.json`, `lines.json` | producer / art director | config: format, series, title, brand, theme, scenes |
| `timing.json` | `scripts/make_vo.py` | never retime by hand |
| `index.html`, `assets/project.js`, `assets/timing.js`, `assets/theme.css`, `compositions/captions.html` | **generated** by `tools/gen.py` | never hand-edit |
| `assets/bnb.css`, `assets/bnb.js`, `compositions/bg.html`, `compositions/chrome.html`, `DESIGN.md` | art director | shared: scene agents do not edit |
| `compositions/sN.html` | one scene agent each | created from `_scene-template.html` / `_endcard-template.html` by gen.py if missing |

## 1. Type

Sizes are CSS variables in `bnb.css`; the class is the same in both formats.

| Role | Family | 9:16 size / leading | 16:9 size / leading | Weight | Tracking | Case | Colour |
|---|---|---|---|---|---|---|---|
| Kicker `01 — The myth` (`.bnb-kicker`) | Plex Mono | 28 / 34 | 24 / 30 | 500 (number `<b>` 600) | 0.16em | UPPER (CSS) | `--blue`, number `--chalk` |
| Headline (`.bnb-headline`) | Fraunces opsz 144 | 104 / 100 | 80 / 80 | 560 | -0.025em | Sentence | `--chalk` |
| Hero headline (`.is-hero`: hook, end card) | Fraunces | 132 / 124 | 104 / 100 | 560 | -0.03em | Sentence | `--chalk` |
| Headline emphasis `<em>` | Fraunces italic | inherit | inherit | 500 | — | — | `--point` (= the scene's orange) |
| Deck (`.bnb-deck`) | Inter | 36 / 48 | 32 / 44 | 400 | -0.005em | Sentence | `--chalk-2` |
| Figure / data label (`.t-label`, `.t-data`, SVG) | Plex Mono | 24 | 22 | 500 | 0.12–0.14em | UPPER | `--blue` |
| Callout head (`.t-head`) | Plex Mono | 26 | 24 | 600 | 0.14em | UPPER | callout colour |
| Callout body (`.t-body`) | Inter | 32 | 30 | 500 | -0.005em | Sentence | `--chalk` |
| Figure caption (`.bnb-figcap`) | Plex Mono `FIG. N` + Inter text | 24 + 28 | 22 + 26 | 600 / 400 | 0.14em mono | | `--chalk` / `--chalk-2` |
| Subtitles (captions band) | Inter | 44 / 56 | 38 / 48 | 500 | -0.012em | as spoken | unspoken `--cap-muted` → spoken `--chalk` |
| Sign-off mark `BUYNBUILD · BUILDPEDIA` | Plex Mono | 24 | 22 | 600 | 0.2em | UPPER | `--chalk-2` |
| Series rail (chrome) | Plex Mono | 22 | 20 | 600 / 500 | 0.2em | UPPER | series `--chalk`, title `--blue` |

Fonts (OFL, from npm `@fontsource`, shipped in `assets/fonts/`, `@font-face` written into `index.html` by gen.py):
**Fraunces** variable (roman + italic), **InterVar**, **Plex Mono** 400/500/600. Always use `--f-serif`, `--f-sans`, `--f-mono`.

Rules: headlines are sentence case, max 2 lines in 9:16 (max 3 short lines in the 16:9 text column), max ~6 words,
never ALL CAPS. Only mono is ever uppercase. No text under 22 px (24 px in 9:16). The headline is the editorial claim,
never the voiceover sentence verbatim (the captions carry the VO). No exclamation marks.

## 2. Grid, layout, safe areas

Each format has its own numbers in **three places that must agree**: `bnb.css` (`:root` vs `:root[data-format="16x9"]`),
`BNB.STAGES` in `bnb.js`, and `tools/gen.py` (canvas size). Scenes never hard-code canvas numbers: they read
`BNB.STAGE` (positions), `BNB.W/H`, `BNB.LAND` and call `BNB.fig(svg)` to set the viewBox.

### 9:16 reel — 1080 × 1920 (Instagram / Shorts / TikTok)

- Margins 72 px → text column 936 (`--col`); `--text-max` 888 keeps text clear of the IG right rail (x > 960 below y 1000).
- 6 columns × 136 px, 24 px gutters (x = 72, 232, 392, 552, 712, 872). Baseline 8 px.
- Background grid: minor 24, major 96, a major line on x = 72.
- **Visual content band y 270–1250** (measured IG safe box 269–1248; 230–1340 is the hard limit).
- **Captions band y 1396–1550** (`captions.html`). Nothing important below y 1580 (IG UI).

| y | element | owner |
|---|---|---|
| 272–302 | series rail (left) + chapter progress, one segment per scene (right) | `chrome.html` |
| 350 | kicker | `.bnb-head` |
| ~400–520 | headline (1–2 lines), deck +24 | `.bnb-headline`, `.bnb-deck` |
| 590–1200 | figure (`STAGE.fig` = x 72–1008, y 590–1200, centre 540,905) | scene |
| 1218 | figure caption | `.bnb-figcap` |
| 1396–1550 | captions | `captions.html` |

Canonical slab: `STAGE.slab = {x0:132, x1:948, top:830, th:150, ground:1166}`.

### 16:9 landscape — 1920 × 1080 (YouTube explainer, client explainer)

Editorial two-column: **text column left, figure right** (the Vox/Bloomberg landscape layout). Same classes.

- Margins 120 px (inside the 90 % action-safe box, x 96–1824). 12 columns × 118 px, 24 px gutters: x = 120, 262, 404,
  546, 688, 830, 972, 1114, 1256, 1398, 1540, 1682. Text column = columns 1–5 (x 120–806, `--text-max` 686).
- Figure zone = columns 6½–12: `STAGE.fig = {x0:860, x1:1800, y0:170, y1:790, cx:1330, cy:500}`. A scene may use the
  full canvas width for a wide figure **below** the header only if the headline is one line.
- Title-safe 80 % box: x 192–1728, y 108–972. Keep key text inside y 108–972; YouTube overlays its progress bar and
  controls on the bottom ~90 px on hover, and the top-left title on pause.
- **Captions band y 872–968**, centred, 1360 px wide, Inter 38/48 (two lines max).

| y | element (16:9) |
|---|---|
| 84–114 | series rail (left, x 120) + chapter progress (right, x 1800) |
| 196 | kicker (x 120) |
| ~242–420 | headline (1–3 lines, column 686 wide), deck below |
| 170–790 | figure (right column, `STAGE.fig`) |
| 806 | figure caption (x 860, width 940 — under the figure, not under the text) |
| 872–968 | captions |

Canonical slab (16:9): `STAGE.slab = {x0:900, x1:1760, top:470, th:140, ground:760}`.

### Switching format

1. Set `"format": "16:9"` (or `"9:16"`) in `project.json`, then `python3 tools/gen.py`. gen.py rewrites `index.html`
   (canvas size, `data-format` attribute, host sizes); bnb.css/bnb.js switch on the attribute / `PROJECT.format`.
2. Scenes written only against `BNB.STAGE`, CSS vars and `BNB.fig()` switch for free. Anything placed with a literal
   number (a hand-placed callout at x 430) must be re-placed: prefer `STAGE.fig` maths (`F.x0 + F.w*0.3`).
3. Re-snapshot every scene (`npx hyperframes snapshot --at …`) and look: text column overflow and figure crowding
   are the usual 16:9 failures. A 9:16 reel and a 16:9 explainer of the same topic are two projects (two scene sets),
   not one project rendered twice: the pacing and composition differ.

## 3. Colour

| token (CSS / `BNB.C`) | hex | use |
|---|---|---|
| `--ground` / `ground` | `#0b2139` | the page (flat) |
| `--ink` / `ink` | `#06162a` | vignette corners, knock-outs |
| `--ground-2` / `ground2` | `#10294a` | label knock-outs, panels |
| `--chalk` / `chalk` | `#eef3fa` | primary text, heavy linework |
| `--chalk-2/3/4` | chalk 74 / 44 / 16 % | deck · hairlines, rules, hatch · construction |
| `--blue` / `blue` | `#8fb3da` | kickers, dimension lines, data labels |
| `--concrete`, `--concrete-dry`, `--aggregate`, `--brick` | `#627387` `#a7b3c1` `#3e4d60` `#a0624e`@34 % | material fills |
| **`--point` / `point`** | **`#ff8a3d`** | **THE POINT. One element (or one idea: a strike + its stamp) per scene. Never decoration, never a caption highlight.** |
| `--water` | `#4fc3f7` | water, moisture, curing (also the rail dot) |
| `--green` | `#7ce0a3` | strength, ok, money in |
| `--red` | `#ff5a5a` | cracks / damage only, sparingly |
| `--heat` | `#f2c08a` | sun and heat only |

No gradients on illustrations (only the page lift + vignette in `bg.html`). No glows, drop shadows or neon.
Client re-theme: `project.json` `"theme"` (see `references/client-theming.md`).

## 4. Illustration

- **Three line weights** (`BNB.LW`): hairline 1.5 (hatch, extension lines, coursing, rules), standard 3 (secondary
  outlines, leaders; dims at 2), heavy 5 (primary section outline, slab surface).
- **Sections and elevations, front-on.** No perspective, no isometric. Cut materials: concrete = flat grey + seeded
  aggregate + sand specks; masonry = terracotta wash + hairline coursing; ground = heavy line + 45° earth ticks;
  steel = navy core, chalk ring, small highlight; water = flat `--water` (film at 55 %) or drops.
- **Hatching** (`BNB.hatch`) is the only shading: shade 45° hairline at 8 px chalk 16 %; heat 45° at 7 px; strength
  fill -45° navy hatch over green.
- **Dimension lines** (`BNB.dim`): 2 px `--blue`, hairline extension lines 14 px past, 45° ticks, mono label on a
  ground knock-out. Labels are **words** (SPAN, DEPTH, PLINTH) — never numbers.
- **Leader callouts** (`BNB.callout`): dot r 6.5 with an 11 px ground halo on the subject, 2 px straight leader to a
  shoulder rule, mono head above Inter body. Text never sits on the drawing; leaders never cross text.
- Draw in inline SVG, built once at init by `BNB.*` builders (seeded `BNB.rng`, never `Math.random`), animated only by
  the scene's GSAP timeline. Never `getBBox()` at init (hosts can be hidden).

## 5. Motion

Easing tokens (`BNB.E`), the only eases allowed: `enter` power3.out · `land` expo.out · `move` power2.inOut ·
`draw` power2.inOut · `exit` power2.in · `drift` sine.inOut · `linear` none (rotation, progress only).
**Banned:** back.*, elastic.*, bounce, overshoot pops, breathing/pulsing loops, `repeat: -1`, slide-up-and-fade on everything.

Durations (`BNB.D`): ticks 0.25 · type 0.5 · objects/callouts 0.7 · draw-on 0.9 · exits 0.2–0.3.
Staggers (`BNB.STAGGER`): words 0.06 · items 0.08 · hatch 0.012.

- Type enters by blur 8→0 + opacity (no translate), or kicker wipe (`BNB.a.kicker`). A landed title is dead still.
- Lines draw on (`BNB.a.draw`). Callouts: dot → leader → rule → text (`BNB.a.callout`).
- Land visuals on the spoken word: `var at = BNB.sceneAt(SC.start, "L0x"); at("word")` = scene-local seconds. Land
  0–0.1 s after the word starts; anticipation may begin up to 0.25 s before.
- One emphatic moment per scene, and it is a *state change* (strike, fill, colour). **One slam + 3-frame shake per
  film** (R05: the NOT YET stamp). Nobody else shakes the camera.
- Camera: `#sN-cam` drifts (`BNB.a.drift`, ≈12–16 px over the scene). Optional `#sN-zoom` settle 1.045→1 expo.out.
- Transitions, each with a cause: (a) match cut on canonical geometry (slab), (b) object becomes the world (zoom
  through a detail into a lens), (c) blur swap on one stage (`BNB.a.exit`, default). Each scene owns its exit in its
  last 0.22–0.3 s and starts its entrance at 0. The grid nudges at every seam (bg.html). The last scene has no exit.
- Frame 0 of scene 1 is the thumbnail: header + figure already on the page (no fade from black).

## 6. Helper library API (`assets/bnb.js` → `window.BNB`)

Config + format: `BNB.PROJECT` · `BNB.FORMAT` ("9:16"|"16:9") · `BNB.LAND` · `BNB.W/H` · `BNB.STAGE` (see §2) ·
`BNB.fig(svgOrId)` (sets viewBox) · `BNB.SCENES[i] = {id, n, start, dur, lines, line, kicker}` · `BNB.scene(id)`.
Tokens: `BNB.C`, `BNB.LW`, `BNB.E`, `BNB.D`, `BNB.STAGGER`.
Timing: `BNB.at(line, word, n?)` (film s) · `BNB.sceneAt(sceneStart, line)` → `at(word, n?)` (scene s) ·
`BNB.lineStart/lineEnd(line)` · `BNB.rng(seed)` · raw `window.TIMING.line(id).words = [[w, s, e], …]`.
SVG primitives: `BNB.el(tag, attrs, parent)` · `g` · `path(parent, d, attrs)` · `line(parent,x1,y1,x2,y2,attrs)` ·
`text(parent,x,y,str,cls,attrs)` (an explicit `fill` is written inline so it beats the class) · `defs(svg)` ·
`hatch(svg,{id,angle,gap,color,width,bg})` → `"url(#<svgId>-id)"` (always use the returned url).

| builder | returns |
|---|---|
| `BNB.slab(svg, parent, {id, seed, x0,x1,top,th,ground, rebar:{n,r}, pier:{w,inset}, fill})` (defaults = STAGE.slab) | `{g, body, agg, sand, moist[], rebar[], dist, shade, surface, outline, film, piers[], ground, bounds{x0,x1,top,bot,ground,cx}}` |
| `BNB.ground(parent,{x0,x1,y})` | `{g, line, hatch}` |
| `BNB.brickPier(parent,{x,y,w,h})` | `{g, outline, fill, courses}` |
| `BNB.rebar(parent,cx,cy,r)` | `<g>` with data-cx/cy |
| `BNB.dim(parent,{x1,y1,x2,y2,ext,label,color})` | `{g, line, ticks, ext, label}` |
| `BNB.callout(parent,{ax,ay,lx,ly,w,side,head,body,color,bodyColor})` | `{g, dot, halo, leader, rule, head, body}` |
| `BNB.sun(svg,parent,{cx,cy,r})` | `{g, disc, rays, ring}` |
| `BNB.wisps(parent,{x0,x1,y,n,h,seed,color})` | `[path]` |
| `BNB.drop(parent,{cx,cy,r,color})` | `<g>` |
| `BNB.check(parent,{cx,cy,r,color})` | `{g, ring, tick}` |
| `BNB.strengthBar(svg,parent,{x,top,h,w,target,targetLabel,label})` | `{g, fill, outline, label, target, bounds}` (grow `fill` with scaleY + svgOrigin at its bottom; no scale, no numbers) |
| `BNB.words(el)` | `[span.w]` |

Motion recipes `(tl, …, at)` in scene seconds: `BNB.a.draw(tl, targets, at, dur?, ease?)` (paths need `pathLength=1`;
builders set it) · `a.undraw` · `a.kicker(tl, el, at)` · `a.words(tl, spans, at, {dur,stagger})` · `a.callout(tl, c, at)`
(≈0.85 s) · `a.figcap(tl, el, at)` · `a.drift(tl, cam, dur, {y1})` · `a.exit(tl, cam, at, dur?)` · `a.popIn(tl, els, at, {stagger,dur})`.

A new drawing (sack, nozzle, clipboard, lens, grain…) is built inside the scene file as a local function first; when a
second scene needs it, the art director promotes it into `bnb.js`. Catalogue of existing ones: `scene-recipes.md`.

## 7. Captions

Generated, never hand-edited: `python3 tools/gen.py` writes `compositions/captions.html`. Sentence-level lines (break
at `.?!`, at a comma after ≥ 4 words, max 13 words, never across voice lines), centred, balanced wrap, in the captions
band. The whole line blurs in (0.22 s) as speech starts; each word turns from `--cap-muted` to chalk as it is spoken
(0.14 s). No pills, no highlight boxes, no orange.

## 8. Texture

`bg.html`: flat ground, blueprint grid (24/96 px at 2.6 %/5.5 %), soft lift behind the figure zone, vignette to ink;
constant drift + a small parallax nudge at each seam. `chrome.html`: fractal-noise grain at 7 % soft-light,
re-positioned every 2 frames from a hash of the frame step (seek-safe). Scenes add no texture. The grain is why
masters are ~24 Mb/s: always ship the delivery encode.

## 9. Scene file contract

Start from `compositions/_scene-template.html` (gen.py does it). Structure: `#root[data-composition-id=sN]` →
`#sN-cam.bnb-stage` → `#sN-zoom.bnb-stage` → `svg#sN-fig.bnb-fig` + `header.bnb-head` (kicker/headline/deck) +
`.bnb-figcap`; script: build with `B.*`, one paused timeline, register `window.__timelines["sN"] = tl`.

- `data-duration` is patched by gen.py to the slot; times inside are scene-local.
- Use `fromTo` (or `immediateRender:false` on later tweens of the same property). No `from`. No CSS transform on
  anything GSAP transforms (use the `#sN-zoom { transform-origin }` pattern).
- Every id prefixed `sN-`; ids passed to builders unique per scene (`BNB.slab(svg, fig, {id:"sN-slab"})`).
- Done = `npm run check` 0 errors (accepted warnings: social safe-zone edges, caption band, 22–24 px mono labels under
  the 28 px floor, contrast on deliberate muted states) + `npx hyperframes snapshot --at …` frames you have looked at.

## 10. Content rules (hard)

No invented numbers: no days, percentages, rates, MPa, amounts, codes, statistics or quantities, on screen or in VO,
unless the client supplied and verified the figure. The only digits on screen are editorial indices: kicker `0N` and
`Fig. N`. Values are bars and lines with no scale. Never a countable day strip (open-ended, faded at both ends).
No logos (the mono brand word in the sign-off mark is type), no faces, no people, no hands, no photos, no AI imagery,
no stock icons — everything is drawn in this system. Education only: structural/legal/money points end in
"confirm with your engineer / advocate / CA / bank". Brand voice: `brand-bnb.md`.
