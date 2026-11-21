# Scene recipes (catalogue of the R05 v2 scenes)

Every recipe below is working code in `template/examples/r05-curing/compositions/` (copied into each new project
as `examples/r05-curing/compositions/`). They were written for 9:16 and the old `window.R05` timing; to reuse one,
copy the relevant block into your `compositions/sN.html` (made from `_scene-template.html`) and:

- replace `B.SCENES[k]` with `B.scene("sN")`, and literal geometry with `B.STAGE` / `STAGE.fig` maths (so it also lays
  out in 16:9);
- rename every `sK-` id to `sN-`;
- re-time every beat with `at("word")` on YOUR lines (never copy times);
- keep exactly one orange idea per scene and the film's single slam.

Line numbers are approximate pointers into the example files.

| # | Recipe | Use it for | Helpers | Code |
|---|---|---|---|---|
| 1 | **Slab section** | any RCC / structure explainer: a cut through the subject with dims + callouts | `B.slab`, `B.dim`, `B.callout`, `B.sun`, `B.wisps`, `a.popIn` (rebar/moisture), `a.callout` | s1 l.62–74 build, l.88–120 beats |
| 2 | **NOT YET stamp (the slam)** | the hook correction: "looks X — not yet". ONE per film | CSS stamp + seeded evenodd ink mask, `power4.in` slam, 3-frame shake on `#sN-shake`, ring flash, focus pull | s1 l.38–47 markup, l.76–86 mask, l.122–136 slam |
| 3 | **Check that loses its colour** | a claim that is about to be refuted | `B.check` in an inline svg in the headline; draw ring + tick, then tween stroke to `chalk3` | s1 l.71, l.105–112 |
| 4 | **Strike → replace headline** | wrong idea struck in orange, right idea lands (DRYING → CURING) | orange strike `<i>` with `scaleX` from 0 + `transformOrigin`; `B.words` + `a.words` for the replacement; callout lands on the key word | s2 l.94–130 |
| 5 | **Match cut on canonical geometry** | continuity between two scenes about the same object | both scenes build `B.slab` with `STAGE.slab`; outgoing scene keeps the slab still in its exit, incoming starts with it already drawn | s2 exit → s3 l.61–75 |
| 6 | **Magnifier lens (object becomes the world)** | zoom into a material: grains, fibres, rust, pores | slab shrinks to a locator (uniform scale), lens group grows from the marked point; clipPath circle, rim + reticle ticks, tangent leaders; seeded grains (`grainD`), drops that travel to the nearest grain, crystal links in passes | s3 l.71–210 build, l.226–286 beats |
| 7 | **Strength bar with target + shortfall bracket** | "weaker than designed", "less than needed", any value vs target without numbers | `B.strengthBar(svg, fig, {target, targetLabel})`; fill `scaleY` with `svgOrigin` at its bottom; stall tick; orange bracket = the gap (the point); target line to full weight on "designed" | s3 bar (fills to 0.62 at exit), s4 l.100–125, l.175–195 |
| 8 | **Crack** | damage that "can" happen (red, no shake) | local `crack(parent, {pts, at:[branch idx]})` → main path + branches, drawn with staggered `a.draw` | s4 l.58–85, l.180–185 |
| 9 | **Causes: sun + wind** | heat / evaporation / drying causes | `B.sun` (slow linear rotation via `svgOrigin`), local `windLine` streamlines in two passes, `B.wisps` evaporation, moisture dots leaving | s4 l.86–112, l.143–172 |
| 10 | **Three-panel small multiple (Fig. 5a/5b/5c)** | "three ways to…": methods, options, stages | three panels, text column left / drawing right, each lands on its spoken word; local drawings: ponding bunds, sacked column (ties, drips), brick wall + nozzle + spray fan + wet patch | s5 l.43–158 build, l.159–240 beats |
| 11 | **Site-record card with blank fields** | "ask your engineer for the number": the answer is a blank line that stays blank | card outline + ruled rows; field glyphs (sack, weather); a pen nib (`nib`) that underlines the start of the blank | s6 l.49–115, l.161–200 |
| 12 | **Open-ended day strip** | "every day" without ever showing a countable period | a tape of generic day squares that scrolls in from the right and out to the left, under a horizontal fade mask (gradient stops 0/0.42/0.58/1) so ~4 squares read at once; open at both ends | s6 l.116–143, l.202–214 |
| 13 | **End card** | the save/send CTA + sign-off | bookmark drawn then filled through a clipPath, hero headline word by word on the VO, rule + series mark + episode line; no exit | `compositions/_endcard-template.html` (generic) · s7 (original) |

## Patterns worth copying exactly

- **Word-locked beats:** `var at = B.sceneAt(SC.start, "L03"); B.a.callout(tl, co, at("water"));` — for a second line in
  the same scene make a second `at` (`var at5 = B.sceneAt(SC.start, "L05")`).
- **Wisps / repeated passes:** two waves with `immediateRender: k === 0` on the first `fromTo` only (s1 l.96–103).
- **Focus pull after the point lands:** everything that is not the point tweens to opacity 0.3 (s1 l.135).
- **Seeded texture:** stamp ink mask built from `B.rng(42)` into a data-URI SVG mask (s1 l.76–86).

## Promoting a drawing

When a second scene needs a local drawing, move it into `assets/bnb.js` as `B.<name>(svg, parent, o)` returning element
refs (never DOM created after init, no `Math.random`, prefix any defs ids with the owning svg id like `B.hatch`).
Add it to DESIGN.md §6 and to this table.
