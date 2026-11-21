# BUYNBUILD (BNB) — brand voice, hard rules, series

BUYNBUILD · *The Honest Builder's Guide* · Hubballi-Dharwad. Audience: families building their own house (often for
the first time), and the people building with them. Job of every video: **protect, don't scare** — explain one thing
in plain words and send the viewer to the right professional.

## Voice

- Plain spoken English a site engineer would use with a family. Short sentences. One idea per line.
- Starts from what the family sees on their own site ("Your slab looks dry and hard…"), then corrects it calmly.
- Possibility, not fear: "can crack", "may need to pay", never "will fail", "disaster", "danger", "warning".
- Blame nobody: not the mason, contractor, dealer, bank or the family. A mason may be named only as one of the
  people who could do a task.
- No hype or filler: no exclamation marks, no "leverage", "comprehensive", "game-changer", "ultimate", "secret",
  "hack", no rankings ("best cement").
- CTA is **save** (reference value: "Save this before your slab day") or **send** ("Send this to someone building
  this year"). One CTA per video, spoken in the last line and shown on the end card.
- Kannada lines are written only by a native writer; mark slots as `[NATIVE WRITER: …]` and never add facts there.

## Hard rules (from the client prompt; a video that breaks one does not ship)

1. **No invented numbers.** No number of days, prices, rates, percentages, MPa/strengths, codes (IS/clause numbers),
   sizes, quantities, timelines or statistics — spoken, on screen, in the caption, cover, hashtags or comment replies.
   The only on-screen digits are the editorial indices `0N` (kicker) and `Fig. N`. If a figure is essential, the
   client must supply and verify it; otherwise show a blank ("Engineer's number ____") or a bar with no scale.
   Never answer "how many days?" with a figure, even one a commenter quotes.
2. **Never a countable day strip.** "Every day" is drawn as an open-ended tape faded at both ends (≈4 squares
   readable), never 7 ticks that read as "7 days".
3. **Education only.** Every structural, legal or money point ends with the right professional:
   structure/curing/cracks → **engineer**; land/title/approvals → **advocate**; loans/tax/cash plan → **bank or CA**.
   The package's Section 8 is a sign-off gate for that professional.
4. **No brands, no logos, no rankings.** No cement/steel/admixture/bank/product names or marks. The mono word
   BUYNBUILD in the sign-off mark is type, not a logo.
5. **Nothing about what BNB sells.** No business-model line; never mention materials, property and a directory
   together; never call BNB a club or ecosystem. End card reads only `BUYNBUILD · <Series>`.
6. **No faces, people or hands; no photos; no AI imagery; no stock icons.** Everything is drawn in the design system.
   Nothing may be presented as a real site, worker, family, before/after or testimonial.
7. **No invented quotes, reviews, testimonials or case studies.**
8. AI disclosure: voice and visuals are AI/code-made; turn on the platform AI label if BNB policy calls for it.

## Series (rail text and sign-off)

| Series | Promise (package "Series" row) | Typical professional | Rail / sign-off |
|---|---|---|---|
| **Buildpedia** | one construction term in plain words | engineer | `BUILDPEDIA • <TERM IN PLAIN WORDS>` · `BuyNBuild · Buildpedia` |
| **Loan Lens** | the money side of building, in plain words | bank / CA | `LOAN LENS • …` · `BuyNBuild · Loan Lens` |
| **Fix It Before It Spreads** | small problems, caught early | engineer | `FIX IT BEFORE IT SPREADS • …` · `BuyNBuild · Fix It Before It Spreads` |

Set them in `project.json`: `"series"` (rail, left), `"title"` (rail, right of the dot: the episode in plain words),
`"brand": {"signoff": "BuyNBuild · Buildpedia"}`. Reel ids `RNN` (`r05-curing`), YouTube `ytNN-…`.

## Kicker conventions

Kicker = `0N — Title`, 2–3 words, the job of the scene in the argument, fixed per scene in `project.json`.
The R05 arc is the default for a 45 s Buildpedia reel (7 scenes):

`01 — The myth` · `02 — The truth` · `03 — Inside the <thing>` · `04 — What goes wrong` · `05 — How to <do it>` ·
`06 — How long` / `Who decides` · `07 — Keep this`

Short teaser (2–3 scenes): `01 — The term` · `02 — Why it matters` · `03 — Keep this`.
Loan Lens: `01 — The idea` · `02 — How it works` · `03 — The gap` · `04 — Ask your bank` · `05 — Your plan` · `06 — Send this`.

## Script shape (reel, 35–50 s, 7–9 lines)

1. Hook (≤ 4 s): what the family sees → the correction. Three hook options go in the package; pick the one that
   starts from the viewer's own site and blames nobody.
2. Truth in one line. 3. The mechanism (inside / why). 4. What goes wrong (possibility). 5. What to do (2–3 concrete
   methods). 6. The number → "ask your engineer / bank / CA, and write it down" + who does it. 7. CTA (save/send).

Lines are locked before voicing (`lines.json`); captions are verbatim. Use a `"say"` field in lines.json for
pronunciation only (e.g. `"text": "CA", "say": "C A"`).
