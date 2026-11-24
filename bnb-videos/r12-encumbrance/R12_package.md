# R12 · Paper Trail · "Encumbrance certificate": publishing package

| | |
|---|---|
| Brand | BUYNBUILD (BNB) · The Honest Builder's Guide · Hubballi-Dharwad |
| Format | Instagram reel, vertical 9:16, 1080×1920, 30 fps |
| Series | PAPER TRAIL (the documents to see before money moves) |
| Topic | Ask for the encumbrance certificate (EC) before paying a token, and what to check on it |
| Style | "Document board" (style sample 01): one continuous camera over a cork desk of SAMPLE papers, cinematic-film engine (Skia) |
| Runtime | 40.40 s (VO 0.40 s to 38.46 s), source: `timing_michael.json` |
| Voice | AI voice (Kokoro `am_michael`, speed 1.0), `audio_michael/narration.wav`; word times estimated by character length |
| Master file | `out/R12_encumbrance_michael.mp4` (H.264 yuv420p + AAC 48 kHz, -14.1 LUFS integrated, -1.9 dBTP measured on the MP4) |
| Reveal level | Guide only. Nothing about what BNB sells. |
| Status | **Blocked until an advocate signs Section 8.** |

---

## 1. Hook (first 3 seconds)

| # | Spoken line | On-screen | Notes |
|---|---|---|---|
| **A, USED** | "Paying a token for a property? Ask for the encumbrance certificate first." (L01, 0.40 to 4.99 s) | Sticky note **PAYING A TOKEN?**, orange pen ring on "token", then the EC sheet drops onto the desk | Starts from the moment the viewer is about to pay. A question, not a warning. |
| B | "Before the token, ask for one paper." | ONE PAPER FIRST | More curiosity, but hides the keyword (EC) that search and saves depend on. |

## 2. Script with timestamps (locked, `lines.json`)

| Line | Start | End | Voiceover (verbatim) |
|---|---|---|---|
| L01 | 0.400 | 4.990 | Paying a token for a property? Ask for the encumbrance certificate first. |
| L02 | 5.340 | 12.635 | It's a record of registered transactions on that property, like sales or mortgages, for the period you ask for. [VERIFY: advocate] |
| L03 | 13.035 | 17.878 | It can show you if the property is already mortgaged, or has been sold before. [VERIFY: advocate] |
| L04 | 18.328 | 22.698 | Check that the owner's name and the property details match your agreement. |
| L05 | 22.998 | 27.031 | If something doesn't match, or the record has gaps, stop and ask why. |
| L06 | 27.531 | 30.672 | Then show it to your advocate before any money moves. |
| L07 | 31.022 | 36.063 | This is general guidance. Your advocate will tell you what applies to your property. |
| L08 | 36.463 | 38.458 | Save this before you pay a token. |

Logo end card: 37.90 to 40.40 s (last 2.5 s).

## 3. Scene list (one continuous camera, no cuts)

| Beat | Time (s) | Visual | On-screen text |
|---|---|---|---|
| Token | 0.0 to 4.0 | Yellow sticky note; orange pen ellipse lands on "token" | PAYING A TOKEN? |
| EC lands | 4.0 to 5.3 | Camera glides to a generic EC sheet as it drops; red underline under the title on "certificate" | ENCUMBRANCE CERTIFICATE (SAMPLE) · RECORD OF REGISTERED TRANSACTIONS · SAMPLE FORMAT |
| What it records | 5.3 to 12.6 | Push-in over the placeholder table: yellow highlighter on the SALE DEED row ("sales"), the MORTGAGE row ("mortgages"), red underline under the PERIOD field ("period") | PROPERTY / OWNER / PERIOD · TRANSACTION / DATE / PARTIES · SAMPLE SELLER, SAMPLE OWNER, SAMPLE LENDER · DD/MM/YYYY |
| What it can show | 13.0 to 17.9 | Orange rings on MORTGAGE ("mortgaged") and SALE DEED ("sold before"), with orange bar tags | ALREADY MORTGAGED? · SOLD BEFORE? |
| Match | 18.3 to 22.7 | A sample AGREEMENT FOR SALE drops beside the EC. Owner name highlighted on both, red string joins them; property details highlighted on both; two green ticks on "match" | AGREEMENT FOR SALE · SELLER : SAMPLE OWNER · PROPERTY : SAMPLE PROPERTY, SITE NO. XX |
| Gap → stop | 23.0 to 27.0 | PERIOD COVERED strip with one empty dashed stretch; orange ring + tag on "gaps"; the film's one slam: rubber stamp on "stop" with a small camera shake | GAP IN THE RECORD · STOP. ASK WHY. |
| Hand-off | 27.5 to 30.7 | String runs from the EC down to a kraft card with a balance-scale glyph (no person); an envelope gets an orange HOLD band on "moves" | YOUR ADVOCATE · SHOW THE EC FIRST · TOKEN · HOLD |
| Disclaimer | 31.0 to 36.1 | Ruled index card types on during L07 | PLEASE NOTE · GENERAL GUIDANCE, NOT LEGAL ADVICE. CONFIRM WITH YOUR ADVOCATE. |
| Pull-back + end | 36.5 to 40.4 | Camera pulls back over the whole desk, then the logo end card | BNB logo · PAPER TRAIL · SAVE BEFORE YOU PAY A TOKEN |

Throughout: top-left series bar **PAPER TRAIL · ENCUMBRANCE CERTIFICATE** with "Sample documents for illustration - not real records", BNB mark top right (x 900, y 150), typed paper-strip captions at y≈1430 to 1520 with the spoken word in yellow.

## 4. Editor notes

- Files: `scene.py` (world, items, camera keys), `render.py` (overlay: series bar, watermark, captions, end card; renders 3 workers straight into ffmpeg, no frame folder), `audio/make_audio.py` (music + foley + master), `audio/timing.json` (engine copy of `timing_michael.json`). `assets/` and `fonts/` are symlinks to `style-samples/01-document-board/`.
- Engine: `/home/user/firebase/.claude/skills/cinematic-film/scripts/engine.py`; Python with skia-python (session venv).
- Rebuild:
  ```bash
  cd r12-encumbrance; V=<venv>/bin/python
  $V render.py --probe 2,8,16,21,25,34       # stills/
  $V render.py --cues                        # audio/sfx_cues.json
  /root/lemo-opuscar/.venv/bin/python audio/make_audio.py
  $V render.py --out out/_video.mp4 --workers 3   # ~3.5 min
  ffmpeg -i out/_video.mp4 -i audio_michael/final_mix.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/R12_encumbrance_michael.mp4
  ```
- Every document is drawn in code with placeholder values only. There is no government format, seal, emblem, office name, real name, survey number, date or amount anywhere.

## 5. Cover text (max 6 words)

| # | Cover text | Notes |
|---|---|---|
| **1, PICK** | **CHECK THE EC BEFORE THE TOKEN** | Frame ≈15.6 s (EC with orange rings). |
| 2 | PAYING A TOKEN? READ THIS | Uses the sticky-note frame at ≈1.5 s. |

## 6. Instagram caption, alt text, on-screen text

Paste-ready caption: `R12_caption.txt` (keyword-first line, 24 hashtags: property buying, EC, land records, Karnataka, Hubballi-Dharwad, home construction).

**Alt text:** "Animated reel over a desk of sample papers. A sticky note asks 'Paying a token?'. A sample encumbrance certificate shows a table of transactions with sale and mortgage rows highlighted, a sample sale agreement is matched to it with green ticks, a gap in the record is circled and stamped 'Stop. Ask why.', and the papers go to an 'Your advocate' card. A note reads 'General guidance, not legal advice. Confirm with your advocate.' Ends on the BuyNBuild logo."

**On-screen text list:** PAPER TRAIL · ENCUMBRANCE CERTIFICATE · Sample documents for illustration - not real records · PAYING A TOKEN? · ENCUMBRANCE CERTIFICATE · (SAMPLE) · RECORD OF REGISTERED TRANSACTIONS · SAMPLE FORMAT · PROPERTY · SAMPLE PROPERTY, SITE NO. XX · OWNER · SAMPLE OWNER · PERIOD · DD/MM/YYYY TO DD/MM/YYYY · TRANSACTION · DATE · PARTIES · SALE DEED · MORTGAGE · SAMPLE SELLER · TO SAMPLE OWNER · TO SAMPLE LENDER · PERIOD COVERED · FROM · TO · REMARKS · FOR ILLUSTRATION ONLY · NOT A REAL RECORD · SAMPLE (watermark) · ALREADY MORTGAGED? · SOLD BEFORE? · AGREEMENT FOR SALE · SAMPLE PAGE · SELLER : · PROPERTY : · BUYER : · GAP IN THE RECORD · STOP. ASK WHY. · YOUR ADVOCATE · SHOW THE EC FIRST · TOKEN · HOLD · PLEASE NOTE · GENERAL GUIDANCE, NOT LEGAL ADVICE. CONFIRM WITH YOUR ADVOCATE. · PAPER TRAIL · SAVE BEFORE YOU PAY A TOKEN · captions (verbatim VO).

**Comment reply template** ("where do I get an EC?" / "how many years should it cover?"): "Good question. That depends on the property and the purchase, so ask your advocate which period and which documents you need." Never answer with a period, fee, office or timeline in comments.

## 7. Sound

- Music: original, synthesized (`audio/make_audio.py`): briefing-room ensemble from style 01 (walking bass, brushed kit, wood block, mallet comp, Dm7 G7 Cmaj7 Am7) at 96 BPM, grid placed so a downbeat lands on the stamp; kit drops out for the advocate hand-off and disclaimer; resolve chord on "Save this".
- Foley (synthesized, from the film's own cues): paper drops, pen scribbles, highlighter squeaks, string swish, ticks, camera whooshes, one rubber-stamp hit.
- Mix: voice HPF + 2.5:1 compression; music -12 LU under voice, ducked 9 dB under speech; SFX -14 LU. Master **-14.0 LUFS (wav) / -14.1 LUFS (MP4), limiter ceiling -2.0 dBTP, MP4 true peak -1.9 dBTP**.
- Captions are burned in (turn Instagram auto-captions off).

## 8. Reviewer checklist (advocate gate)

**Rule:** do not publish until a practising advocate has ticked every line. Education only: "General guidance, not legal advice. Confirm with your advocate." is on screen during L07 and in the caption.

| # | Statement as voiced / shown | Where | OK? | Note |
|---|---|---|---|---|
| F1 | Ask for the encumbrance certificate before paying a token. | L01 | ☐ | |
| F2 | [VERIFY] An EC is a record of **registered** transactions on that property, like sales or mortgages, for the period you ask for. | L02 · EC sheet, SALE DEED / MORTGAGE rows, PERIOD field | ☐ | Advocate to confirm the description, incl. whether unregistered dealings (e.g. some agreements, leases) would not appear, and whether a caveat line is needed. |
| F3 | [VERIFY] It can show if the property is already mortgaged, or has been sold before. | L03 · ALREADY MORTGAGED? / SOLD BEFORE? tags | ☐ | Advocate: is "can show" accurate for mortgages (e.g. equitable mortgage by deposit of title deeds may not be registered)? |
| F4 | Check the owner's name and property details match your agreement. | L04 · agreement match + ticks | ☐ | |
| F5 | If something doesn't match, or the record has gaps, stop and ask why. | L05 · GAP IN THE RECORD · STOP. ASK WHY. | ☐ | The "period covered" strip with an empty stretch is a simplification, not a real EC layout. OK? |
| F6 | Show it to your advocate before any money moves. | L06 | ☐ | |
| F7 | Disclaimer on screen with L07; caption carries it too. | L07 index card | ☐ | |
| F8 | All documents are clearly marked SAMPLE / FOR ILLUSTRATION ONLY; no real government format, seal, office, name or number. | All | ☐ | |
| F9 | No numbers spoken or shown (no years, fees, periods, amounts). Only placeholders DD/MM/YYYY and XX. | All | ☐ | |
| F10 | No faces, no logos except BNB, nothing about what BNB sells; tone protects, blames nobody (sellers, brokers, officials). | All | ☐ | |

**Sign-off:** Advocate name ____________ · Date ____________ · Changes required ____________

## 9. Credits

Script: BNB content team (locked). Voice: Kokoro TTS `am_michael` (offline). Visuals: code-drawn with the cinematic-film engine (skia-python), cork/paper textures and fonts from style sample 01. Music and SFX: original, synthesized in numpy. Logo: BUYNBUILD brand files.
