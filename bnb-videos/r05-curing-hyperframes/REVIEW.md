# R05 Curing · HyperFrames rebuild · review notes

Remake of `../r05-curing` (hand-built canvas version). The script, the audio and the timing are the same. Only the visual build is new.

## Build
- `index.html`: the root. It mounts `bg` (blueprint grid and parallax camera), `s1` to `s7` (one scene per beat, back to back), `chrome` (the BUILDPEDIA tag and film grain), `captions`, and `<audio id="mix">` = `assets/audio/final_mix.wav`.
- `tools/gen.py` turns `r05-curing/timing.json` into `assets/timing.js` (`R05.at(line, word)` plus a seeded RNG) and `compositions/captions.html`. Every sync point is a word lookup. Nothing is retimed by hand. Re-run it if the voiceover changes.
- GSAP is vendored at `assets/vendor/gsap.min.js` because the network blocks public CDNs.
- Registry items, adapted rather than mounted as-is:
  - `success-check`: the s1 check and the s6 ticks.
  - `headline-slam`: the NOT YET stamp and the "?". The scale-down slam uses expo.out with a three-frame shake.
  - `strikethrough-replace`: DRYING → CURING.
  - `hw-underline`: the squiggle under CURING and the blanks drawn by the pencil.
  - `caption-pill-karaoke`: the grouping logic and pill. It is restyled to navy with an orange marker on the spoken word.
  - `grain-overlay`: made finite so it is seek-safe.
  - `icon-swap` pattern: the sun/moon swap for "day by day".
  - `zoom-through-transition` idea: the s2 exit.

## Transitions (each with a cause)
- s1 → s2: blur swap on one stage.
- s2 → s3: zoom through CURING.
- s3: a spot on the slab becomes the lens. The object becomes the world.
- s3 → s4: carry across. The slab and the strength bar keep their geometry through the cut.
- s4 → s5: vertical whip.
- s5 → s6 and s6 → s7: blur swap.
- The grid nudges on every cut, as a parallax camera.

## Measured
- `check`: ok, 0 errors.
- Warnings kept:
  - `outside_safe_zone` is for TikTok and YouTube Shorts edges. The brief's Instagram band is y 230–1340, and captions sit at y 1392–1560 as briefed.
  - `contrast_aa_failure` on caption words caught mid colour-tween.
  - `timeline_track_too_dense` on captions: 35 groups in one host is the captions convention.

## Content rules
- No digits anywhere on screen. The strength bar has no scale.
- The day strip runs off both edges through a fade mask. It never shows a countable row.
- No logos, no faces, no generated imagery.

## Weakest shot / next pass
- s6: the board's empty lower half before "every single day".
- s1: there is a dead zone below the slab.
- With more time: a subtle water caustic over s5's cards, and a strength bar that dips when the crack lands.
- Sound was not re-mixed. It is the client's final mix, muxed unchanged.
