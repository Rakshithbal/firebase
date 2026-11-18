# YT01 hook: Higgsfield (AI video) version, for A/B against the code version

The video is "20x30 house plan, best layout ideas" (BUYNBUILD, faceless explainer, 16:9). The code version is `out/YT01_hook_code_v1.mp4`, 10.4 s.

The voice-over stays the same in both versions: reuse `audio/vo_track.wav`, or the whole `audio/final_mix.wav` with the music swapped if needed.
- H1 (0.25–3.1 s): "Twenty by thirty. Six hundred square feet."
- H2 (3.3–6.2 s): "Most people think that's too small for a real home."
- H3 (6.35–9.0 s): "Let's see what actually fits, room by room."

Guardrails for every shot:
- 16:9, about 5 s each.
- No text, logos, signage or readable number plates.
- No recognisable people. Distant generic figures are fine only if they can't be avoided; it's better to have none.
- No real or identifiable BNB site, street or landmark. Nothing should look like a real BNB project.
- Overlay any numbers ("20 ft", "30 ft", "600 sq ft", "too small?") afterwards in the edit, never in the AI image.

---

## Shot A: the empty plot (under H1, about 0–3.2 s, trim from 5 s)

> Slow aerial drone shot descending over a generic empty rectangular residential plot, roughly 20 by 30 feet, in a small South Indian town at golden hour. Bare red-brown earth, four small survey pegs with string marking the plot edges, low compound walls of neighbouring modest concrete houses on either side, coconut palms and a few tile roofs in the distance, warm low sun, long soft shadows, light dust in the air, top-down camera slowly tilting to a 60-degree angle. Calm, quiet, unbranded, no people. Cinematic, 16:9, realistic, no text

## Shot B: the doubt beat (under H2, about 3.2–6.3 s)

> Ground-level slow dolly along the edge of the same kind of narrow empty residential plot in a South Indian town, late golden hour, the narrow 20-foot frontage emphasised by tall neighbouring houses on both sides making the plot feel tight and small, string line between pegs in the foreground slightly out of focus, a few dry leaves moving in the breeze, muted warm colours, slight melancholy mood, no people, no vehicles with visible plates. Cinematic, 16:9, realistic, no text

## Shot C: what fits (under H3 to the end, about 6.3–10.4 s)

> Slow push-in toward a finished modest two-storey family house on a narrow 20-foot-wide plot in a South Indian town at golden hour, simple plastered walls in warm off-white and terracotta, a small front verandah, a staircase visible at one side, potted plants, a steel gate left open, warm interior lights just turning on, generic street, no signage, no house name, no people. Gentle, hopeful mood, shallow depth of field. Cinematic, 16:9, realistic, no text

(Optional alternative to C if a plan-like feel is wanted: "Slow overhead camera over a hand-built architectural white card model of a small two-bedroom house on a narrow rectangular plot, roof removed so the rooms are visible, soft warm desk-lamp light, shallow depth of field, no labels. 16:9, realistic, no text". Keep in mind that AI room proportions are not checked, so this alternative should never carry dimensions.)

---

## Which code shots these would replace

| Time | Code version (keep or replace) | Higgsfield shot |
|---|---|---|
| 0–3.2 s | Plot outline draws, "20 ft" and "30 ft" dimension lines, "600 sq ft" count-up | **Shot A** replaces the background. Keep the "20 ft", "30 ft" and "600 sq ft" overlays from code, composited on top (they carry the information; AI must not render numbers). |
| 3.2–6.3 s | Empty hatched plot, "?" and "too small?" tag | **Shot B** replaces it. Keep the "too small?" tag as an overlay. |
| 6.3–9.0 s | Rooms snap into the plan with labels (living, stairs, kitchen, toilet, 2 bedrooms) | **No good AI replacement.** Keep the code plan here: it is the promise of the video, and the layout has to be accurate and labelled. A hybrid could cut from Shot B to the code plan. |
| 9.0–10.4 s | Isometric wall extrusion and the title card "20×30 HOUSE PLAN / LAYOUT IDEAS" | **Shot C** could replace the extrusion behind the title card. Keep the title text from code. |

Suggested comparison: (1) pure code version (done), (2) a hybrid: A, then B with code overlays, then the code room snap, then C behind the code title. Both use the same VO and the same "Example layout · check setbacks with your local authority" note whenever a layout is on screen.
