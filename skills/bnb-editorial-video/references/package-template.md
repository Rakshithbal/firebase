# Publishing package template (8 sections)

Every video ships with `<ID>_package.md` in the project folder (format of `bnb-videos/r05-curing/R05_package.md`).
Fill every section from the real files (`lines.json`, `timing.json`, the rendered MP4), never from memory.
Write in plain English, no hype. All times come from `timing.json`.

```markdown
# RNN · <Series> · "<Topic>" — Publishing package

| | |
|---|---|
| Brand | BUYNBUILD (BNB) · The Honest Builder's Guide · Hubballi-Dharwad |
| Format | Instagram reel, vertical 9:16, 1080×1920, 30 fps, H.264 + AAC 48 kHz   (or: YouTube 16:9, 1920×1080) |
| Series | <Series> (<series promise>) |
| Topic | <one line> |
| Publish date | <date> |
| Runtime | <total> s (VO <first start> s to <last end> s), source: `timing.json` |
| Voice | AI voice (Kokoro `hm_omega`, speed 1.05), file `assets/audio/narration.wav` |
| Final file | `out/<slug>_ig.mp4` (delivery) · master `out/<slug>_master.mp4` · contact sheet `out/<slug>_contact.png` |
| Reveal level | Guide only / Education only. No <numbers…>. Nothing about what BNB sells. |
| Status | **Blocked until <engineer | bank + CA | advocate> signs Section 8.** |

## 1. Hook options (first 3 seconds)
| # | Spoken line | On-screen text | Notes |   ← 3 options, mark the USED one, say why (starts from the viewer's site, blames nobody)

## 2. Word-for-word script with timestamps
| Line | Start | End | Voiceover (verbatim) |   ← from timing.json; then "Where a Kannada line could land" with [NATIVE WRITER: …] slots

## 3. Scene list
| # | Time | Dur. | Shot type | Visual description | Voiceover | On-screen text |
+ "Image-generation prompts (fallback only)": normally "None were needed" — everything is drawn in code.

## 4. Animation notes for the editor
Files (project.json, lines.json, timing.json, compositions/sN.html, assets/bnb.*), "timing.json is the master clock",
transitions, key sync points (word → visual, with times), palette, the no-numbers notes, and the exact re-render
commands (python3 tools/gen.py · npm run check · bash build.sh).

## 5. Cover text (max 6 words)
| Option | Words | |   ← 3 options, CHOSEN one, + cover build (which frame, text inside the central 3:4, y≈240–1680, no digits)

## 6. Instagram caption, CTA and hashtags      (YouTube: title ≤ 60 chars, description, chapters from scene starts)
Caption + CTA 40–80 words · CTA = save or send · 5 hashtags (2 local, 3 topic; no brand tags)
+ "Caption check against the HARD RULES" bullet list + comment-reply template (never a figure) + AI disclosure.

## 7. Music, pacing and subtitles
Music (original, synthesized by make_audio.py: no licence needed; bed ~-20 LU under speech, extra duck on the key
instruction, -14 LUFS, TP ≤ -1.5 dBTP) · pacing (breaths between lines = scene changes; don't trim) · SFX cue list ·
burned-in subtitles (editorial, sentence-level, verbatim; turn platform auto-captions off) + export an SRT.

## 8. Reviewer's checklist (<professional> gate)
8a. Fact lines: | # | Fact as stated | Where it appears | Confirm by | OK? | Note / fix |  ← every factual claim, VO + screen
8b. No-number check: VO, every scene, cover, caption, comments; day-strip decision; blanks stay blank.
8c. Brand and production: no brands/logos/rankings · nothing about what BNB sells · no invented quotes ·
    everything drawn (no AI image presented as real) · protect-not-scare, no blame · Kannada lines checked.
Sign-off: <Professional> name ____ · Date ____ · Changes required ____
```

## Caption rules (Section 6)

- 40–80 words including the CTA. First line restates the hook in plain words (it shows before "more").
- Same facts as the VO, nothing new; no digits at all; ends by sending the reader to the professional.
- CTA verb matches the VO's last line (save / send). One CTA.
- Hashtags: exactly 5 — 2 local (`#Hubballi #HubballiDharwad`), 3 topic (`#ConcreteCuring #SlabCasting
  #HouseConstruction`); swap one for the series tag if the team wants (`#Buildpedia`). No brand tags.
- Comment replies: a template that never gives a figure ("It depends on … Your site engineer will give you the
  number for your slab. Write it down and stick to it.").
- YouTube variant: title (≤ 60 chars, no clickbait), first 2 lines of description = the hook + the promise,
  chapters = scene starts (`0:00 The myth`), same hard rules, pinned comment = the professional reminder.

## SRT export (one cue per voice line)

```bash
python3 - <<'EOF'
import json; T=json.load(open('timing.json'))
f=lambda t:'%02d:%02d:%02d,%03d'%(t//3600,t%3600//60,t%60,round(t%1*1000))
open('out/captions.srt','w').write(''.join('%d\n%s --> %s\n%s\n\n'%(i+1,f(l['start']),f(l['end']),l['text']) for i,l in enumerate(T['lines'])))
EOF
```
