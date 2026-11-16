---
name: style-presets
description: A library of ~55 named visual/animation styles (Woodblock Print, Knitted Puppet, PS2, Synthwave, Glassmorphism, Y2K Chrome, Risograph, Madhubani, Kinetic Type, Low Poly, Neobrutalism, Vaporwave, Clay Diorama, CRT Vector…) as concrete recipes — palette hexes, shapes and line, texture, lighting, type, motion rules, signature moves, things to avoid, and which renderer to use. Use whenever the user names a visual style for a video, animation, reel, carousel, poster or web page ("in Risograph style", "make it look PS2", "Synthwave version", "knitted puppet look"), asks "what styles are there", or wants to pick a style. Routes to the Lemo-Opuscar library when it already has that style.
---

# Style Presets

Each style in `references/styles.md` is a recipe you apply to whatever you are making (Remotion, HyperFrames, GSAP, Three.js, p5.js, plain canvas/SVG, a still image or a carousel).

## How to use

1. **Find the style.** `grep -n -i "<name>" "<skill base directory>/references/styles.md"` — headings are `## Style Name`, and each recipe lists **Aliases** (e.g. "Lego" → Brick Toy, "Dan Koe" → Minimal Essay Mono, "ZackD" → 3D Medical Explainer). Read only that section.
2. **Check `Lemo-Opuscar:`.** If it names a slug and the Lemo-Opuscar library is installed (`~/lemo-opuscar/styles/<slug>/STYLE.md`), prefer the `lemo-opuscar` skill for a full film in that style — its STYLE.md is more complete than this recipe. Use this recipe when the user wants a short loop, a single scene, a carousel, a web page, or a style Lemo doesn't have.
3. **Pick the renderer** from the recipe's `Build with:` line and use the matching installed skill (remotion-*, hyperframes, gsap-*, threejs-*, algorithmic-art / p5.js, motion-effects, canvas-design).
4. **Commit to the style completely.** Palette, shapes, line, texture, lighting and the way things move must all come from the recipe. Do not mix in default "AI look" habits (soft purple gradients, glassy cards, generic sans, ease-in-out on everything) unless the recipe asks for them.
5. **Respect `Avoid:`** — these are the mistakes that break the look.
6. **Show stills first.** Render 3 key frames (or a 6-frame contact sheet) and let the user approve the look before a full render. Seed all randomness so re-renders match.

## Rules

- Hex values are starting palettes; if the user gave brand colours, keep the style's *structure* (value range, number of inks, contrast) and swap hues.
- Never imitate a named living creator or use a trademark in output. Aliases like "Dan Koe" or "Lego" map to a neutral description of the look; don't put those names, logos or characters in the work.
- Indian folk styles (Madhubani, Rajasthani Miniature) are living traditions: follow their real conventions, don't caricature them, and credit the tradition if the user publishes.
- If a requested style isn't listed, build a recipe in the same format (palette, shape & line, texture, lighting, type, motion, signature, avoid, build with) and offer to append it to `references/styles.md`.

## Index (by family)

- **Print & graphic:** Woodblock Print, Risograph, Swiss, Bauhaus, Memphis, Pop Art, Editorial, Minimalism, Maximalism, Neobrutalism, Ransom Note, Victorian, Handwritten, Kinetic Type, Minimal Essay Mono
- **Ink, paint & paper:** Sumi Ink, Watercolour Sticker, Paper Collage, Paper-Cut, Madhubani, Rajasthani Miniature, Line Art, Glow Sketch, Chalkboard, Graffiti, Bohemian
- **Cartoon & comic:** 1930s Cartoon, Noir Comic, Comic Art, Flat Vector
- **Tactile & toy:** Clay 3D, Clay Diorama, Knitted Puppet, Brick Toy
- **Retro digital:** Pixel Art, PS2, CRT Vector, Y2K Chrome, Synthwave, Vaporwave, Glitch, Retro
- **Modern UI & light:** Glassmorphism, Futuristic, Cyberpunk, Aurora, Particles, Surreal
- **3D & explainer:** Isometric, Low Poly, CGI Motion, 3D Explainer, 3D Data Chart, 3D Medical Explainer, Glowing Atom
