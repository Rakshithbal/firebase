# R05 v2 "What curing means" — reference scenes (not wired into index.html)

The finished R05 v2 scenes (45.5 s, 9:16), kept as working examples of every recipe in `scene-recipes.md`.
`s1.html` is the golden reference scene. Also here: the original `lines.json` / `timing.json`, the R05 DESIGN.md
(`DESIGN-r05.md`), the art director's `REVIEW-r05.md` and the R05 helper library `bnb-r05.js`.

They read `window.R05` timing and fixed `B.SCENES[k]` indices; the template's `bnb.js` exposes the same API under
`window.TIMING` + `BNB.scene(id)`. To reuse a block: copy it into a scene made from `_scene-template.html`, rename
ids, re-time on your words with `at("word")`, and replace literal geometry with `BNB.STAGE` maths.
