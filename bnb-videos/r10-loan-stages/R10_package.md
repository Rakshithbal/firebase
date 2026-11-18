# R10 · Loan Lens · "Construction loans pay in stages" — Publishing package

| | |
|---|---|
| Brand | BUYNBUILD (BNB) · The Honest Builder's Guide · Hubballi-Dharwad |
| Format | Instagram reel, vertical 9:16, 1080×1920, 30 fps, H.264 + AAC 48 kHz |
| Series | Loan Lens (money side of building, in plain words) |
| Topic | Construction loans pay in stages: what that means for your cash flow |
| Publish date | 1 Dec 2026 |
| Runtime | 41.93 s (VO 0.40 s to 40.54 s), source: `timing.json` |
| Voice | AI voice (`hm_omega`, speed 1.05), file `audio/narration.wav` (locked, not regenerated) |
| Final file | `out/R10_loan_stages_v1.mp4` · contact sheet `out/R10_contact.png` |
| Reveal level | Education only. No amounts, rates, percentages, timelines, bank names or loan products. Nothing about what BNB sells. |
| Status | **Blocked until a bank contact (and the family's CA, where named) signs Section 8.** |

---

## 1. Hook options (first 3 seconds)

| # | Spoken line | On-screen text | Notes |
|---|---|---|---|
| **A, USED** | "Your home loan will not come as one big amount." (L01, 0.40 to 3.47 s) | **ONE BIG AMOUNT?** → struck through on "not" → **NOT IN ONE GO**; the bag splits into packets at 3.14 s | Starts from what most families picture (one sanction, one payment) and corrects it calmly. |
| B | "The bank pays in parts. Your bills do not wait." | **BANK: IN PARTS · BILLS: DAILY** | Gets to the cash-flow point faster, but sounds a little like a warning. |
| C | "Plan the loan, and the gap between releases." | **PLAN THE GAP** | Practical, but "gap" means nothing yet in the first second. |

Hook A was used because it names the expectation first and then corrects it, without blaming the bank or the family.

---

## 2. Script with timestamps

Locked and voiced. Times in seconds from `timing.json`.

| Line | Start | End | Voiceover (verbatim) |
|---|---|---|---|
| L01 | 0.400 | 3.468 | Your home loan will not come as one big amount. |
| L02 | 3.818 | 8.284 | For construction, the bank releases it in stages, as the building goes up. |
| L03 | 8.684 | 14.960 | Stages like plinth, slab, walls and finishing. Each one gets checked before the next part is released. |
| L04 | 15.410 | 19.381 | But your contractor and your material bills do not wait for the bank. |
| L05 | 19.681 | 23.478 | So between two releases, you may need to cover the gap yourself. |
| L06 | 23.978 | 26.558 | Before you sign, ask your bank three things. |
| L07 | 26.908 | 32.124 | What are the stages? What do you need to see before each release? And how long does a release take? |
| L08 | 32.524 | 37.649 | Then plan your own cash for each gap, and confirm the details with your bank or C A. |
| L09 | 38.199 | 40.535 | Send this to someone building this year. |

The video holds on the end card until 41.93 s.

---

## 3. Scene list

| Scene | Time | Shot type | Visual | Dur | VO | On-screen text |
|---|---|---|---|---|---|---|
| s1 Hook | 0.00–3.85 | Centred icon, push on beat | Big rupee bag pops in; dashed orange cut lines appear on "one big amount"; bag bursts into four cash packets at 3.14 s | 3.85 s | L01 | HOME LOAN · ONE BIG AMOUNT? (struck on "not") · NOT IN ONE GO |
| s2 Stages | 3.85–15.20 | Split diagram: house left, stage track right, bank top right | Packets fly into the bank's vault. Track rows appear on "stages". House builds part by part on each spoken stage (plinth, slab, walls, finishing). An inspection lens checks each part; the row gets a green check, then one packet travels from the bank into that stage's slot. The last packet lands on "released" | 11.35 s | L02, L03 | CONSTRUCTION LOAN · RELEASED IN STAGES · PLINTH / SLAB / WALLS / FINISHING · CHECK, THEN RELEASE |
| s3 The gap | 15.20–23.75 | Line chart, no axis values | Hard hat (contractor) and bricks + cement bag (material) pop on their words and send bills onto a continuous orange "bills" line. A green step line rises only at each release. On "between two releases" one interval is bracketed; on "cover" every gap between the lines shades orange; THE GAP lands on "gap" | 8.55 s | L04, L05 | BANK RELEASES · YOUR BILLS · CONTRACTOR · MATERIAL · MONEY · BUILD TIME · BILLS DON'T WAIT · BETWEEN TWO RELEASES · THE GAP · YOU COVER THIS |
| s4 Ask your bank | 23.75–32.35 | Card | Pen signs a line on "sign". ASK YOUR BANK card slides up; three empty slots appear on "three"; each question pops in on its "What/And" with an icon (steps, document with check, clock); key words underline in green as spoken | 8.60 s | L06, L07 | BEFORE YOU SIGN · ASK YOUR BANK · THINGS · What are the stages? · What proof do you need before each release? · How long does a release take? |
| s5 Cash plan | 32.35–37.95 | Bar chart, no values | Four dashed orange gap boxes (one per stage) fill with green "your cash" on "each gap", each gets a check. Note card rises on "confirm"; "bank" and "CA" underline on their words | 5.60 s | L08 | YOUR CASH PLAN · GAP · YOUR CASH · stage names · ILLUSTRATION ONLY · NOT TO SCALE · Confirm with your bank or CA |
| s6 CTA | 37.95–41.93 | End card | Paper plane flies in along a dashed trail on "Send"; headline builds word by word; sign-off fades in | 3.98 s | L09 | Send this to someone building this year · BUYNBUILD · Loan Lens |

Always on screen: navy blueprint grid, LOAN LENS tag (green) at top, word-by-word burned-in captions at y ≈ 1470. Green = money in (releases, your cash). Orange = money out (bills, the gap).

---

## 4. Animation notes and how to re-render

- Code: `index.html` (background grid, series tag, captions, cross-fades of 0.28 s), `lib.js` (palette `P`, helpers `L`, and icons: `L.bag`, `L.packet`, `L.bank`, `L.bill`, `L.badge`), `scenes/s1.js`…`s6.js`.
- Every hit is placed with `L.wordTime(T, lineId, word, n)` from `timing.json`, so a new voice take only needs a new `timing.json`. The s2 check/release cycle times are fixed at 11.46 / 12.20 / 12.95 / 13.70 s (constant `CHECK` in `s2.js`) so the last packet lands on "released."; s3's chart cursor runs 16.0–19.3 s (`CUR0/CUR1`). Update those two if the voice changes.
- Deterministic: no `Math.random`/`Date`; seeded `L.rng` only. All scene content sits within x 60–1020, y 230–1340.
- Gap and cash heights are illustrative shapes, not data. No numbers appear anywhere on screen.
- Re-render stills: `cd r10-loan-stages && NODE_PATH=$(npm root -g) node render.mjs --stills 3.5,13.4,22.9 --out /tmp/stills`
- Re-render a frame range: `NODE_PATH=$(npm root -g) node render.mjs --from 15.2 --to 23.75`
- Full build (4 parallel chunks + encode): `PATH=/root/.local/bin:$PATH ./build.sh` (about 3.5 min). Output `out/R10_loan_stages_v1.mp4`.
- Audio: `/root/lemo-opuscar/.venv/bin/python audio/make_audio.py` → `audio/music.wav`, `audio/sfx.wav`, `audio/final_mix.wav`. Run it before `build.sh` if the cues change.

---

## 5. Cover text (max 6 words)

| # | Cover text | Frame |
|---|---|---|
| A | Your loan comes in stages | s2 at ~14.9 s (house finished, all stages checked) |
| **B, PICKED** | **Loan in stages? Plan the gap.** | s3 at ~23.3 s (THE GAP chart, orange shading) |
| C | Mind the gap between releases | s3 at ~23.3 s |

B was picked because it names both halves of the lesson. The orange gap chart is the most distinctive frame on the grid. Put the cover text in the top third (above the chart) in Inter 800, chalk white, with "Plan the gap." in orange.

---

## 6. Instagram caption (75 words + hashtags)

See `R10_caption.txt` (paste as is):

> A construction loan does not come as one big amount. The bank releases it in stages, after checking each stage. Your contractor and material bills do not wait.
>
> Before you sign, ask your bank: What are the stages? What do you need to see before each release? How long does a release take?
>
> Plan your own cash for each gap. Confirm the details with your bank or CA.
>
> Send this to someone building this year.
>
> #Hubballi #HubballiDharwad #KarnatakaHomes #HomeLoan #ConstructionLoan

CTA: **send** (main, matches VO). Optional pinned first comment: "Which of the three questions did your bank answer clearly? Tell us below." (comment prompt; no advice in replies, point people to their bank or CA).

---

## 7. Music, pacing and subtitles

- **Music:** original, fully synthesized (no samples or downloads): felt piano, soft pad, muted plucks and bass, a light kick and shaker in the second half. It is the R05 Buildpedia underscore re-cut and moved a whole tone down to C major, so the account sounds consistent without repeating the same bed. 90.1 BPM; bar 9 (the lift with a soft riser) lands exactly on L06 "Before you sign" at 23.98 s, so the action part of the reel feels like a step up. A rolled Cmaj9 resolves at 39.97 s under "building this year"; fade to silence 41.25–41.93 s.
- **SFX:** small UI foley on the visual hits: bag pop, pen strike on "not", ascending chimes as packets split, soft build thuds on each stage word, tick + landing chime for each check and release (ascending, money-in feel), paper flicks for bills, a soft stamp on "THE GAP", pops and chimes for the three questions, pencil scribble on "sign", whoosh for the paper plane.
- **Mix:** voice HPF 70 Hz + 2.5:1 compression; music bed -11 LU under voice and ducked 9 dB during speech; master -14.0 LUFS integrated, true peak -2.0 dBTP on the WAV (-1.9 dBTP measured on the AAC in the MP4), LRA 1.5 LU.
- **Pacing:** one idea per scene. The hook is solved by 3.5 s; the longest scene (s2, 11.3 s) keeps moving with a build or check about every 0.4–0.8 s.
- **Burned-in subtitles:** word-by-word from `timing.json`, chunks of up to 4 words that break at punctuation, Inter 800 58 px in a dark pill at y ≈ 1470 (above the IG UI), spoken word in orange, past words white, next words dimmed. They follow the VO verbatim, so L08 reads "C A." in the captions while the on-screen card says "CA". If IG auto-captions are on, they will duplicate; leave them off.

---

## 8. Reviewer checklist (sign before publishing)

Every factual line, and who confirms it. Nothing here is a rule for every loan; the reel tells viewers to confirm with their own bank or CA.

| # | Where | Claim / element | Confirms | Check |
|---|---|---|---|---|
| 1 | L01, s1, caption | A construction home loan is not paid out as one lump sum. | Bank (home-loan officer) | ☐ |
| 2 | L02, s2 | For construction, the bank releases the loan in stages as the building progresses. | Bank | ☐ |
| 3 | L03, s2, s3, s5 labels | Plinth, slab, walls, finishing are given as *examples* of stages. The four-stage drawing is an illustration, not a fixed schedule. [VERIFY: whether the stage names/order match common local practice — bank] | Bank | ☐ |
| 4 | L03, s2 ("CHECK, THEN RELEASE", lens, check marks) | Each stage is checked before the next release. The visual shows a site inspection; some banks may ask for documents, photos or an engineer/valuer report instead. [VERIFY: what the "check" usually is — bank] | Bank | ☐ |
| 5 | s3 chart | The chart shows the first release only after the first stage, so the family carries cost before any release. [VERIFY: whether a release can come before work starts, and whether an own contribution is expected first — bank] If not typical, soften the chart before posting. | Bank | ☐ |
| 6 | L04, s3 | Contractor and material bills come on their own schedule, not the bank's. | Family's contract / site engineer (payment terms in the contractor agreement) | ☐ |
| 7 | L05, s3 ("THE GAP", "YOU COVER THIS") | Between releases the family *may* need to pay from their own funds. Says "may", not "will". | Bank + CA | ☐ |
| 8 | L06–L07, s4 | The three questions (stages, what is needed before each release, how long a release takes) are fair, standard questions to ask before signing. No answers or timelines are given. | Bank | ☐ |
| 9 | L08, s5 | "Plan your own cash for each gap" is general planning advice; the bars are illustrative ("ILLUSTRATION ONLY · NOT TO SCALE"). | CA | ☐ |
| 10 | L08, s5 card, caption | Confirm the details with your bank or CA (education-only disclaimer). | Content lead | ☐ |
| 11 | Whole video, cover, caption | No amounts, percentages, interest rates, timelines, stage counts as rules, bank names, loan product names or logos. ₹ appears only as a symbol on bags/packets. Bank icon is generic. No faces. | Content lead | ☐ |
| 12 | Voice | Brand voice: plain words, no hype, no exclamation marks, no "leverage"/"comprehensive", nothing about BNB's business. | Content lead | ☐ |

Sign-off: Bank contact ____________ Date ______ · CA ____________ Date ______ · Content lead ____________ Date ______
