# R05 v2 — final review (art director integration pass)

## Delivered
- `out/R05_curing_v2.mp4` — 1080x1920, 30 fps, H.264 High yuv420p (CRF 17, ~24 Mb/s), AAC 192k 48 kHz, 45.53 s,
  soundtrack = `r05-curing/audio/final_mix.wav` unchanged (measured -14.0 LUFS integrated).
- `out/R05_v2_contact.png` — 12 frames from the MP4 (1.2 s + 3.8 s steps), 6x2.
- HyperFrames render 252 s (software capture, screenshot mode) + final x264/AAC encode 177 s.

## Integration fixes
- `BNB.hatch`: pattern ids are now prefixed with the owning svg's id (`s4-fig-bnb-hatch-strength` …), so a
  `url(#…)` can no longer resolve into a hidden scene. s4/s5's rename-after-build workaround removed (it had
  become a no-op).
- `BNB.text`: an explicit `fill` is also written inline, so it beats `.t-head/.t-data` class fills (s1 "CORE"
  head is water-blue again; s4/s5 inline `style.fill` overrides still work).
- s6 day strip: fade window narrowed (x 310–770) so ~4 squares read at once while the tape scrolls, open at
  both ends — never a countable set.
- v1 registry components removed from `compositions/components/` (unreferenced; banned motion); registry
  entries cleared from `hyperframes.json` / `hyperframes.lock.json`.

## Seams (checked at each boundary ±0.2 s)
- s1→s2 (4.411): blur swap; slab geometry identical, so the slab reads as continuous.
- s2→s3 (8.841): match cut on the slab + CURING callout; s3's drift starts at -12 as briefed.
- s3→s4 (14.944): s3 bar fills linearly to FMAX 0.62 exactly at its exit; s4 starts at F0 0.62 with the same
  bar geometry (x858/top590/h420/w52) — continuous. s3 lens (transform-attribute workaround) renders correctly.
- s4→s5 (24.97), s5→s6 (32.304), s6→s7 (42.214): blur swaps on one stage; no overlaps, rail/kicker/figcap
  positions consistent with s1.

## Checked rules
One orange idea per scene (s1 strike+stamp, s2 "Curing.", s3 "slow", s4 shortfall, s5 "wet", s6 "?",
s7 "slab day."). Only digits on screen: kicker 0N and Fig. N/5A–5C. No logos, faces, AI imagery.

## Accepted warnings / known issues
- `npm run check`: 0 errors. Warnings kept: social safe-zone edges (TikTok/Shorts), caption band, 22–24 px mono
  labels under the 28 px floor, contrast on deliberate muted states (unspoken caption words, struck "done.").
- s2 opens ~2 s before its headline lands (kicker + slab only) and s5 shows three empty small-multiple
  panels for ~2.5 s before "Ponding" — intentional anticipation, but the quietest stretches of the film.
- s6 pen nib briefly crosses the "Curing period" label while it writes (transient, ~1 s).
- The grain keeps the bitrate high (~24 Mb/s, 137 MB); Instagram re-encodes anyway.
- Raw HyperFrames render kept at `renders/r05_v2_raw.mp4` (193 MB) — safe to delete.
