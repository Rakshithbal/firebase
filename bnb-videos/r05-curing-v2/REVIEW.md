# R05 v2 — review notes (art director pass)

## State
- Engine: HyperFrames 0.9.58, 1080x1920 @30, 45.51 s, client mix `assets/audio/final_mix.wav` unchanged.
- New: editorial system (`DESIGN.md`, `assets/bnb.css`, `assets/bnb.js`), fonts (Fraunces / Inter / IBM Plex Mono, OFL),
  bg (grid + vignette), chrome (series rail, chapter progress, grain), sentence-level captions (`tools/gen.py`).
- s1 rebuilt at v2 quality (golden reference). s2–s7 are still the v1 compositions (placeholders) so the film
  renders end to end; their old headers collide with the new rail at y 272 until they are rebuilt.

## s1 beats (scene seconds)
0 thumbnail: kicker, hero headline "Looks done.", deck, damp slab section · 0–1 dims, sun, wisps draw; camera settles ·
0.6 "slab" rebar + distribution steel · 1.38 "dry" section pales, SURFACE callout · 1.88 "hard." check ticks ·
2.80 "not" orange strike, check greys · 3.06 "mean" moisture appears in the core, CORE callout ·
3.77 "done." NOT YET stamp slam + 3-frame shake (the film's only slam) · 4.19 blur-swap exit.

## Accepted warnings
outside_safe_zone for TikTok/Shorts edges and for the caption band; text_below_floor for 22–24 px mono rail/labels;
contrast on the dimmed struck "done." and on unspoken caption words (intentional states).

## Next
s2–s7 rebuild per DESIGN.md; then a full `snapshot --review` and render.
