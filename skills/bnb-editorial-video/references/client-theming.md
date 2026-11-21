# Re-theming the system for a paid client

The editorial system is the product; the BNB blueprint palette is one theme of it. A client explainer keeps the
*grammar* (anatomy, motion, one-idea scenes, drawn figures, word-locked beats, editorial captions) and swaps the
*skin* (colours, fonts, rail text, sign-off). Everything below is config; no shared file is forked.

## 1. Palette — `project.json` `"theme"`

Keys are `BNB.C` names; gen.py writes `assets/theme.css` (CSS vars, loaded after bnb.css) and `window.PROJECT.theme`
(merged into `BNB.C`), and uses `chalk`/`capMuted` for the captions. Raw CSS vars (`"--hl-size": "96px"`) also pass through.

```json
"theme": {
  "ground": "#14110f", "ink": "#0a0807", "ground2": "#1e1a17",
  "chalk": "#f4efe6", "chalk2": "rgba(244,239,230,0.74)", "chalk3": "rgba(244,239,230,0.44)", "chalk4": "rgba(244,239,230,0.16)",
  "blue": "#b8c4b0", "capMuted": "#8f8a80",
  "point": "#e4572e"
}
```

Rules that keep the quality:
- **Dark, flat ground + one light "chalk".** Ground luminance ≤ ~12 %, chalk ≥ ~90 %. Keep the chalk-2/3/4 alphas
  (74/44/16 %) — the hierarchy depends on them.
- **One `point` colour, and it is the client's accent.** It is still used once per scene. If the brand accent is
  low-contrast on the ground (< 3:1), lighten it for `point` rather than breaking the rule.
- `blue` = the "technical" secondary (kickers, dims, labels): a desaturated tint that reads as annotation.
- Semantic colours (`water`, `green`, `red`, `heat`) keep their meanings; retune hue only if they clash.
- `bg.html` lift/vignette gradients are `--bg-lift` / `--bg-vignette` in bnb.css; override them in `theme` with
  the new ground tones (`"--bg-lift": "radial-gradient(…)"`) if the ground changes hue.
- Run `npm run check`: the Contrast section must pass (deliberately muted states excepted).

## 2. Fonts — `project.json` `"fonts"`

Replace the `@font-face` list (files in `assets/fonts/`, woff2, licence file next to them), then map families with
`"theme": {"--f-serif": "\"Client Serif\", Georgia, serif", "--f-sans": "…", "--f-mono": "…"}`.
Keep the three roles: a display serif (or a characterful display face) for headlines, a neutral sans for deck,
captions and callout bodies, a mono for kickers/labels/rail. Only open-licence or client-licensed fonts; no CDN
(render is offline). Re-check headline widths: a wider face needs `--hl-size` down a step.

## 3. Series rail, title, sign-off

`"series"`: the client's programme or product line (`CLIENT EXPLAINS`), `"title"`: the episode in plain words,
`"brand": {"name": "Client", "signoff": "Client · Series"}`. The end card shows the sign-off mark as mono type; a
client logo is allowed **only** if the client supplies it and wants it, as an SVG in `assets/`, placed in the end
card sign-off block at mark height (never animated, never on other scenes). Default is no logo.

## 4. Voice and audio

`"voice"` in project.json (Kokoro voice id + speed), or the ElevenLabs hook in `make_vo.py` when the client supplies
a voice and a key. The house music (`make_audio.py`) is original and licence-free; for a client either keep it (it is
neutral) or transpose: change the `CH`/`MEL` tables in a project-local copy of make_audio.py. Keep the master spec
(-14 LUFS, TP ≤ -1.5 dBTP).

## 5. What must stay (non-negotiable for the look)

- Scene anatomy: rail → kicker → headline → deck → figure → Fig. caption → captions band; same positions every scene.
- One idea per scene, one `point` element per scene, one slam per film, eases from `BNB.E` only.
- Drawn figures (sections/elevations/diagrams) built with `BNB.*`, seeded, no photos/AI imagery/stock icons.
- Word-locked beats from `timing.json`; editorial captions (sentence-level, no pills, no orange).
- Grid + grain texture, blur-swap transitions, frame 0 = thumbnail.
- Content honesty: the client's numbers only if supplied and verified (note the source in the package); otherwise
  bars without scales and blanks. Client hard rules go into a project-local copy of `brand-bnb.md`.

## 6. Checklist for a client job

1. `new_project.py … --series "<Client series>" --title "<episode>" --brand "<Client>" --format 16:9|9:16`
2. Fill `theme` / `fonts`, run `python3 tools/gen.py`, snapshot scene 1 → approve the skin on one frame first.
3. Script → client approval → `make_vo.py` → scenes → check → build → package (client facts table in Section 8).
