# Style recipes

Format per style: Aliases · Source (where it was seen) · Lemo-Opuscar (matching library style, or —) · Palette · Shape & line · Texture · Lighting · Type · Motion · Signature · Avoid · Build with.

---

# Print & graphic

## Woodblock Print
- **Aliases:** woodcut, ukiyo-e, block print, linocut
- **Source:** skaleout
- **Lemo-Opuscar:** `woodcut` (European/lino), `ukiyoe` (Japanese)
- **Palette:** washi #F1E6CF, sumi black #1C1A17, indigo #2E4A6B, vermilion #C8452D, moss #7A8A4E — max 4 inks plus paper
- **Shape & line:** carved outlines that taper and swell; flat colour areas inside; stylised wave curls, cloud bands, parallel cut hatching
- **Texture:** wood-grain streaks in flat fills, slight ink unevenness, mis-registration of 1–2 px between colour plates, paper fibre
- **Lighting:** none — flat, gradation only via bokashi (one soft-graded band, e.g. sky)
- **Type:** vertical cartouche label, brush or serif
- **Motion:** stepped (on twos/threes); layers slide as flat planes; waves loop as cycled drawings, not smooth deformation
- **Signature:** bokashi sky band, plate mis-registration, a red seal stamp in a corner
- **Avoid:** gradients beyond the one bokashi band, drop shadows, 3D shading
- **Build with:** SVG/canvas 2D layers (HyperFrames or p5.js), grain via noise texture

## Risograph
- **Aliases:** riso, duotone print, zine print
- **Source:** andremass.ai
- **Lemo-Opuscar:** `risograph`
- **Palette:** paper #F4EFE4 + 2–3 riso inks: fluorescent pink #FF48B0, medium blue #0078BF, yellow #FFE800 (overprints create new colours)
- **Shape & line:** bold simple shapes, halftone-dot shading, no outlines
- **Texture:** grainy ink coverage, halftone dots, 2–4 px plate mis-registration, multiply blending where inks overlap
- **Lighting:** flat; tone via halftone density
- **Type:** chunky grotesk or condensed, printed in one ink
- **Motion:** stop-motion feel (12 fps), shapes slide/rotate, halftone density animates
- **Signature:** overprint colour where two inks overlap (multiply blend)
- **Avoid:** pure black, smooth gradients, perfect registration
- **Build with:** canvas 2D with multiply composite + halftone shader, or HyperFrames

## Swiss
- **Aliases:** Swiss design, International Typographic Style, Swiss grid, Swiss motion
- **Source:** sebintel, andremass.ai
- **Lemo-Opuscar:** `swiss-motion`
- **Palette:** white #FFFFFF, black #111111, signal red #E3000F (one accent only)
- **Shape & line:** strict modular grid, flush-left ragged-right, big numbers, circles/rectangles aligned to grid
- **Texture:** none, crisp
- **Lighting:** none
- **Type:** Helvetica/Akzidenz-style grotesk, huge headline + tiny captions, tight leading
- **Motion:** elements snap along the grid, wipes and masks, fast ease-out (expo), holds long enough to read
- **Signature:** asymmetric layout with lots of white space, one red element doing the work
- **Avoid:** centring everything, decoration, more than one accent colour
- **Build with:** HyperFrames/GSAP or Remotion

## Bauhaus
- **Aliases:** Bauhaus shapes, constructivist geometric
- **Source:** andremass.ai
- **Lemo-Opuscar:** `bauhaus-shapes`
- **Palette:** cream #EFE6D2, red #D7263D, blue #1B4F9C, yellow #F2C12E, black #151515
- **Shape & line:** primitive circle/square/triangle, half-circles, thick bars, diagonals at 45°
- **Texture:** light paper grain
- **Lighting:** flat
- **Type:** geometric sans (Futura-like), lowercase, sometimes rotated 90°
- **Motion:** shapes roll, stack and balance like a mechanism; snappy with slight overshoot
- **Signature:** compositions assembled from 3 primitives in 3 primaries
- **Avoid:** gradients, thin lines, more than 5 colours
- **Build with:** SVG + GSAP or HyperFrames

## Memphis
- **Aliases:** Memphis design, 80s Memphis, Memphis diorama
- **Source:** andremass.ai
- **Lemo-Opuscar:** `memphis-diorama`
- **Palette:** pink #FF7AB6, teal #2EC4B6, yellow #FFD23F, black #111, lilac #B8A1FF, white
- **Shape & line:** squiggles, confetti triangles, terrazzo dots, zig-zags, black outlines
- **Texture:** dot and grid patterns as fills
- **Lighting:** flat (2D) or bright toy-like (3D diorama)
- **Type:** bold rounded or geometric display
- **Motion:** bouncy, elastic, objects wobble and pop on beats
- **Signature:** clashing patterns side by side, floating squiggles
- **Avoid:** muted colours, realism
- **Build with:** SVG/GSAP; Three.js for diorama version

## Pop Art
- **Aliases:** Lichtenstein-style, Ben-Day comic pop
- **Source:** sebintel, andremass.ai
- **Lemo-Opuscar:** `pop-art`
- **Palette:** red #E4002B, yellow #FFE500, blue #0055A4, black #000, white
- **Shape & line:** thick black outlines, speech balloons, starburst "POW" shapes
- **Texture:** Ben-Day dots for skin/sky, flat primaries
- **Lighting:** graphic highlights (white shapes), no soft shading
- **Type:** comic caps, outlined display
- **Motion:** panel cuts, zoom punches, repeated-grid (Warhol) variations
- **Signature:** Ben-Day dots + one dramatic close-up
- **Avoid:** subtle colour, realistic rendering
- **Build with:** canvas 2D/SVG with dot-pattern fills

## Editorial
- **Aliases:** magazine, editorial layout
- **Source:** sebintel
- **Lemo-Opuscar:** — (close: `swiss-motion`)
- **Palette:** off-white #F6F3EE, ink #1A1A1A, one muted accent (oxblood #7A1F2B or forest #234A3A)
- **Shape & line:** column grid, hairline rules, pull quotes, image crops with generous margins
- **Texture:** subtle paper
- **Lighting:** photographic if images; otherwise flat
- **Type:** high-contrast serif headlines (Didone) + clean sans body, drop caps
- **Motion:** slow, dignified: text reveals line by line, images drift (Ken Burns), page-turn transitions
- **Signature:** big serif headline over a cropped photo, small-caps kicker
- **Avoid:** fast cuts, neon, emoji
- **Build with:** HyperFrames / Remotion

## Minimalism
- **Aliases:** minimal, clean
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** white #FAFAFA, near-black #121212, one accent; or monochrome
- **Shape & line:** few elements, lots of negative space, thin lines
- **Texture:** none
- **Lighting:** flat or very soft single shadow
- **Type:** one typeface, two sizes max
- **Motion:** slow, one thing moves at a time, long holds
- **Signature:** a single object or word carrying the whole frame
- **Avoid:** clutter, more than 2 colours, busy transitions
- **Build with:** any (GSAP/HyperFrames simplest)

## Maximalism
- **Aliases:** more is more, dense collage
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** saturated clashing set — magenta #E0218A, emerald #00A86B, orange #FF6B00, cobalt #0047AB, gold #D4AF37
- **Shape & line:** layered patterns, ornaments, stacked type, framed elements
- **Texture:** pattern-on-pattern, fabric, wallpaper
- **Lighting:** rich, mixed
- **Type:** several display faces mixed deliberately
- **Motion:** many elements in motion, but on a shared beat so it reads as one rhythm
- **Signature:** every inch filled yet one clear focal point
- **Avoid:** no focal point; random timing
- **Build with:** HyperFrames/GSAP; canvas for pattern fills

## Neobrutalism
- **Aliases:** neubrutalism, brutalist UI
- **Source:** andremass.ai
- **Lemo-Opuscar:** —
- **Palette:** cream #FFF4E0, black #000, flat pops: yellow #FFD600, pink #FF8AD8, mint #7CF2C4, blue #6C8BFF
- **Shape & line:** thick 3–4 px black borders, hard offset shadows (6–8 px, no blur), chunky rounded-rect buttons
- **Texture:** none
- **Lighting:** none — only hard offset shadows
- **Type:** heavy grotesk (Archivo Black-like), big
- **Motion:** buttons press into their shadow, cards drop in with hard stops, quick linear moves
- **Signature:** hard black offset shadow on every card
- **Avoid:** blur, gradients, soft shadows
- **Build with:** HTML/CSS + GSAP (HyperFrames)

## Ransom Note
- **Aliases:** cut-out letters, magazine letters
- **Source:** graphix_vicky
- **Lemo-Opuscar:** — (close: `vintage-collage`)
- **Palette:** dark background #141414 with each letter on its own paper colour (newsprint #EDE6D6, red #C62828, yellow #F2C94C, white)
- **Shape & line:** each letter a different font, size and rotation (±8°), torn/cut paper edges
- **Texture:** paper scraps, slight shadows under each letter, tape
- **Lighting:** soft top light so scraps cast small shadows
- **Type:** mixed (serif, slab, script, stencil) — never the same font twice in a word
- **Motion:** letters slap down one by one with tiny bounce, stop-motion jitter
- **Signature:** jittering mismatched letters forming one word
- **Avoid:** uniform fonts, perfect alignment
- **Build with:** HTML/CSS + GSAP or canvas

## Victorian
- **Aliases:** Victorian engraving, ornate 1800s
- **Source:** sebintel
- **Lemo-Opuscar:** `engraving` (close)
- **Palette:** aged paper #E9DCC0, sepia ink #3B2A1A, oxblood #6E1E1E, gold #B08D3C
- **Shape & line:** fine engraved cross-hatching, ornate borders, filigree, cartouches
- **Texture:** foxed paper, letterpress impression
- **Lighting:** engraved shading only
- **Type:** decorative slab + serif mix, banners, ornaments
- **Motion:** slow reveals, frames unfold, iris-in/out, sepia film flicker
- **Signature:** ornate frame around a hatched illustration
- **Avoid:** flat modern vectors, neon
- **Build with:** SVG + hatching shader or p5.js

## Handwritten
- **Aliases:** handwriting, journal, notebook
- **Source:** sebintel
- **Lemo-Opuscar:** `sketchnote`, `marker-paper` (close)
- **Palette:** lined paper #FBF8F0, blue ink #1F3A93, pencil grey #555, highlighter yellow #FFF176
- **Shape & line:** hand-drawn arrows, circles, underlines, doodles
- **Texture:** paper lines, ink bleed
- **Lighting:** flat (or a soft desk light vignette)
- **Type:** real handwriting fonts with variation; write-on animation
- **Motion:** strokes draw on in writing order, slight wobble (boil) on held frames
- **Signature:** write-on text with a highlighter swipe
- **Avoid:** perfectly geometric shapes, single repeated glyphs
- **Build with:** SVG stroke-dashoffset animation (GSAP/HyperFrames)

## Kinetic Type
- **Aliases:** kinetic typography, motion type
- **Source:** andremass.ai
- **Lemo-Opuscar:** `text-flash-cuts` (close)
- **Palette:** black #0A0A0A / white, one accent (#FF3D00 or brand)
- **Shape & line:** type is the image; masks, splits, stacking
- **Texture:** none (or subtle grain)
- **Lighting:** none
- **Type:** bold condensed or wide grotesk; variable fonts (weight/width animated)
- **Motion:** word-by-word on the voice/beat, scale punches, masked slides, rotations; every word has a reason to move
- **Signature:** words timed exactly to speech/beat
- **Avoid:** whole sentences fading in together; generic fades
- **Build with:** GSAP SplitText-style / HyperFrames / Remotion with word timestamps (faster-whisper)

## Minimal Essay Mono
- **Aliases:** "Dan Koe style" (describe the look, never name the creator)
- **Source:** theaigeekk
- **Lemo-Opuscar:** —
- **Palette:** black #000, white #FFF, grey #8A8A8A; optionally one muted gold #B89B5E
- **Shape & line:** single sentences centred, thin lines, simple geometric diagrams, occasional classical statue/photo in B&W
- **Texture:** film grain, slight vignette
- **Lighting:** high-contrast B&W
- **Type:** elegant serif for statements, mono for labels
- **Motion:** slow push-ins, text fades word by word, long contemplative holds
- **Signature:** one profound line on black, then a simple diagram
- **Avoid:** colour, fast cuts, emojis, the creator's name/likeness
- **Build with:** HyperFrames / Remotion

---

# Ink, paint & paper

## Sumi Ink
- **Aliases:** ink wash, sumi-e, Chinese ink landscape, shan shui
- **Source:** skaleout
- **Lemo-Opuscar:** `ink-wash`
- **Palette:** rice paper #F3EEE2, ink black #1A1A1A through 5 greys, one accent: gold leaf #C9A227 or seal red #B0302A
- **Shape & line:** brush strokes with pressure (thick→thin), dry-brush edges, mountains as layered washes
- **Texture:** paper fibre, ink bleed/feathering, wet-on-wet blooms
- **Lighting:** none — depth by ink dilution (far = paler)
- **Type:** vertical brush calligraphy + red seal
- **Motion:** slow; strokes paint on, mist drifts, layers parallax gently
- **Signature:** pale distant mountains + one gold element + red seal
- **Avoid:** saturated colour, hard vector edges
- **Build with:** canvas 2D/p5.js with brush stamping and blur; WebGL for ink diffusion

## Watercolour Sticker
- **Aliases:** watercolour, watercolor brush, painted paper stickers
- **Source:** thatsalariedwoman.ai (Bairan)
- **Lemo-Opuscar:** `watercolor`
- **Palette:** soft washes — rose #E8A3A8, sky #9CC3D5, sage #A9C29A, ochre #E3B76B on paper #FAF6EE
- **Shape & line:** loose painted shapes, cut out with a white paper border (sticker), soft drop shadow
- **Texture:** cold-press paper grain, pigment granulation, edge darkening
- **Lighting:** soft ambient; sticker shadow implies a light from top-left
- **Type:** handwritten or soft serif lyrics
- **Motion:** stickers peel, slide and flutter like paper; props pop in on sung words; camera pushes slowly
- **Signature:** white-bordered painted cut-outs over soft painted walls
- **Avoid:** crisp vectors, saturated digital colours
- **Build with:** canvas/WebGL watercolour shader or HyperFrames layers

## Paper Collage
- **Aliases:** collage, collage art, vintage collage, cut-paper collage, halftone paper collage
- **Source:** sebintel, andremass.ai, george.automates (gbro-collage-broll)
- **Lemo-Opuscar:** `vintage-collage` (also `halftone-dossier`)
- **Palette:** newsprint #E9E2D0, black halftone, one or two bright papers (#E94F37, #3C6E71, #F2C14E)
- **Shape & line:** cut-out photos (B&W halftone), torn edges, tape, arrows, stamps
- **Texture:** paper grain, halftone dots, tape gloss, slight shadows under each layer
- **Lighting:** soft top light
- **Type:** cut-out headlines, typewriter labels
- **Motion:** stop-motion (on twos), pieces slide/flip in, slight jitter on holds
- **Signature:** halftone photo cut-out with torn edge + coloured paper behind
- **Avoid:** smooth 60 fps motion, clean vector fills
- **Build with:** HyperFrames/canvas with layered PNG/SVG pieces

## Paper-Cut
- **Aliases:** papercut, layered paper, paper pop-up, kirigami
- **Source:** matt_penny_applied_ai
- **Lemo-Opuscar:** `papercut-red`, `paper-popup`
- **Palette:** 4–6 tones of one or two hues (e.g. #1D3557 → #A8DADC) or warm #F4A261/#E76F51/#2A9D8F
- **Shape & line:** stacked flat layers with clean cut edges, no outlines
- **Texture:** fine card grain
- **Lighting:** directional light casting soft drop shadows between layers (depth)
- **Type:** cut-paper letters or clean sans
- **Motion:** layers parallax, fold up/pop up, slight sway
- **Signature:** depth from shadowed stacked layers
- **Avoid:** gradients inside a layer, outlines
- **Build with:** Three.js planes with shadows, or CSS 3D layers

## Madhubani
- **Aliases:** Mithila painting
- **Source:** aansh.ai ("any katha → a painted video")
- **Lemo-Opuscar:** —
- **Palette:** natural pigments — vermilion #D7372B, turmeric #E8A317, indigo #2D3A8C, leaf green #3E7B3A, lamp black #1B1B1B on handmade paper #F1E3C6
- **Shape & line:** double black outlines filled with fine parallel lines/hatching; no empty space — fish, peacocks, lotus, sun, trees fill gaps; decorative double border
- **Texture:** handmade paper, slightly uneven pigment
- **Lighting:** none — completely flat, no perspective, no shading
- **Type:** Devanagari/Latin in a painted panel
- **Motion:** gentle: borders draw on, figures move as flat cut-outs, fish/birds cycle; transitions via the border pattern
- **Signature:** dense filled space + double outline + nature motifs + border
- **Avoid:** perspective, shading, empty background, caricatured faces; follow the tradition respectfully
- **Build with:** SVG line art + GSAP stroke draw-on; canvas for fill patterns

## Rajasthani Miniature
- **Aliases:** Mughal/Rajput miniature, Indian miniature painting
- **Source:** thatsalariedwoman.ai (Alfaaz)
- **Lemo-Opuscar:** — (close: `gilded-illumination`)
- **Palette:** lapis #24408E, vermilion #C0392B, saffron #E39B2D, malachite #2E8B57, gold #C9A227, ivory #F3E9D2, night #13203A
- **Shape & line:** fine outlines, profile faces, flattened architecture (terraces, arches, domes), patterned carpets, stylised trees and birds
- **Texture:** burnished paper, gold highlights, ornamental border panels
- **Lighting:** flat; night scenes with stars and a lantern glow
- **Type:** Nastaliq/Devanagari calligraphy panels
- **Motion:** slow and courtly: lamps flicker, birds glide, figures shift pose in held tableaux, camera tilts across the scene
- **Signature:** profile figures on a palace terrace under a starry sky inside a decorative border
- **Avoid:** realistic 3D shading, modern props, stereotyped costume mash-ups
- **Build with:** SVG/canvas layers (HyperFrames); AI-generated stills + Claude compositing for painted detail

## Line Art
- **Aliases:** one-line, single line, contour line
- **Source:** andremass.ai
- **Lemo-Opuscar:** `one-line`
- **Palette:** background #F5F2EA, line #111 (or white on black), optional one fill colour
- **Shape & line:** one continuous stroke of constant width forming everything
- **Texture:** none
- **Lighting:** none
- **Type:** thin sans or handwritten
- **Motion:** the line draws on and morphs from one subject into the next without lifting
- **Signature:** continuous morphing line
- **Avoid:** fills, multiple stroke widths
- **Build with:** SVG path morph + stroke-dashoffset (GSAP)

## Glow Sketch
- **Aliases:** neon sketch, light drawing
- **Source:** theaigeekk
- **Lemo-Opuscar:** `neon-tubes` (close)
- **Palette:** black #05060A, glowing cyan #00F0FF, magenta #FF2BD6, warm white #FFF4D6
- **Shape & line:** loose hand-drawn strokes, unclosed shapes
- **Texture:** bloom around strokes, faint chalk-like grain
- **Lighting:** the lines are the light source
- **Type:** handwritten glowing
- **Motion:** strokes draw on with a bright leading tip, then settle to steady glow; slight flicker
- **Signature:** bright tip tracing a sketch on black
- **Avoid:** fills, daylight backgrounds
- **Build with:** canvas 2D with additive blending + blur, or Three.js lines + bloom

## Chalkboard
- **Aliases:** blackboard, chalk
- **Source:** theaigeekk
- **Lemo-Opuscar:** `chalkboard`
- **Palette:** board #2F3E35, chalk white #EDEDE6, chalk yellow #F6E27F, chalk pink #F4A6B7, blue #9CC9E8
- **Shape & line:** chalk strokes with broken edges, arrows, boxed formulas, underlines
- **Texture:** chalk grain, smudge/eraser marks, dust
- **Lighting:** flat with slight board vignette
- **Type:** chalk handwriting
- **Motion:** write-on stroke by stroke; erase with a smear; diagrams build step by step
- **Signature:** half-erased smudges in the background
- **Avoid:** crisp vector lines
- **Build with:** canvas 2D stamped chalk texture; HyperFrames

## Graffiti
- **Aliases:** street art, spray paint
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** concrete #8A8A86, black #111, spray pops #FF3B30 #34C759 #FFCC00 #00A6FF #AF52DE
- **Shape & line:** wildstyle letters, bold outlines, drips, arrows, tags
- **Texture:** brick/concrete wall, overspray, drips
- **Lighting:** daylight on a wall, slight vignette
- **Type:** graffiti letterforms, stencil
- **Motion:** spray reveal with overspray mist, drips run down, stencil slaps
- **Signature:** drip lines under fresh paint
- **Avoid:** clean edges
- **Build with:** canvas particles for spray; HyperFrames

## Bohemian
- **Aliases:** boho
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** terracotta #C8643B, mustard #D9A441, sage #8A9A5B, dusty rose #D8A7A0, cream #F5EBDD
- **Shape & line:** hand-drawn botanicals, suns, moons, arches, rainbows, macramé patterns
- **Texture:** paper/linen, grain
- **Lighting:** warm soft
- **Type:** organic serif + script
- **Motion:** gentle sway, leaves growing, slow fades
- **Signature:** arch frame with sun/moon and botanicals in earth tones
- **Avoid:** neon, hard geometry
- **Build with:** SVG + GSAP

---

# Cartoon & comic

## 1930s Cartoon
- **Aliases:** rubber hose, vintage cartoon, old cartoon
- **Source:** skaleout
- **Lemo-Opuscar:** `rubber-hose`
- **Palette:** B&W/sepia: #F2EAD3, #1A1A1A, greys; or early two-strip colour (#D96C4E, #6FA3A8)
- **Shape & line:** rubber-hose limbs, pie-cut eyes, white gloves, bouncy round bodies, thick even ink line
- **Texture:** film grain, dust, scratches, gate weave, vignette
- **Lighting:** flat
- **Type:** vintage title card serif in an ornate frame
- **Motion:** everything bounces to the beat (even buildings), squash & stretch, cycles on twos, iris-out ending
- **Signature:** whole world dancing in rhythm + iris out
- **Avoid:** using real copyrighted characters; modern smooth tweening
- **Build with:** SVG/canvas with frame-stepped animation; film filter pass

## Noir Comic
- **Aliases:** film noir comic, hard-boiled comic
- **Source:** skaleout
- **Lemo-Opuscar:** `comic-history`, `halftone-dossier` (close)
- **Palette:** black #0B0B0B, white #F2F2F2, one accent red #B3121B or yellow #E8C547
- **Shape & line:** heavy spot blacks, venetian-blind shadows, rain streaks, angular panels
- **Texture:** ink spatter, halftone in greys
- **Lighting:** hard single light, deep shadows, rim light
- **Type:** caption boxes in typewriter/handletter caps
- **Motion:** panel-to-panel cuts, slow push-ins, rain loops, cigarette smoke
- **Signature:** blind-slat shadow across a face + one red accent
- **Avoid:** colour fills beyond the accent
- **Build with:** canvas 2D/SVG; Three.js for lit scenes with toon outline

## Comic Art
- **Aliases:** comic book, superhero comic, manga panels
- **Source:** theaigeekk
- **Lemo-Opuscar:** `comic-history`, `manga-panels` (needs an image generator)
- **Palette:** CMYK-ish primaries + black ink; flats #E63946 #F1FAEE #457B9D #FFB703
- **Shape & line:** inked outlines with varying weight, speed lines, panels and gutters
- **Texture:** halftone dots, slight paper yellowing
- **Lighting:** cel-shaded with hard shadows
- **Type:** speech balloons, SFX lettering ("WHOOSH")
- **Motion:** camera moves panel to panel, elements break out of panel borders
- **Signature:** a figure breaking the panel border
- **Avoid:** soft gradients
- **Build with:** SVG/canvas; Three.js toon shader for 3D

## Flat Vector
- **Aliases:** flat 2D, vector art, flat illustration, corporate flat
- **Source:** sebintel, andremass.ai, theaigeekk
- **Lemo-Opuscar:** `flat-space-explainer` (close)
- **Palette:** 5–6 harmonious flats, e.g. #264653 #2A9D8F #E9C46A #F4A261 #E76F51 + off-white
- **Shape & line:** geometric simplified characters/objects, no outlines, rounded corners
- **Texture:** none or subtle grain
- **Lighting:** flat with one-tone shadow shapes
- **Type:** friendly rounded sans
- **Motion:** clean ease-out, pop-ins with slight overshoot, morphs between icons
- **Signature:** shape-morph transitions
- **Avoid:** realistic detail, more than 6 colours
- **Build with:** SVG + GSAP / HyperFrames / Remotion

---

# Tactile & toy

## Clay 3D
- **Aliases:** clay, claymation, plasticine
- **Source:** sebintel, andremass.ai
- **Lemo-Opuscar:** —
- **Palette:** saturated but soft: #F28482 #84A59D #F6BD60 #7FB7BE #F5CAC3
- **Shape & line:** chunky rounded forms, slightly lumpy, no perfect symmetry
- **Texture:** fingerprints, subtle bumps (noise displacement), matte subsurface
- **Lighting:** soft key + fill, warm/cool, soft contact shadows
- **Type:** puffy rounded 3D letters
- **Motion:** stop-motion stepping (12 fps) with slight "boil" (shape changes every frame)
- **Signature:** fingerprint texture + stepped motion
- **Avoid:** glossy plastic, perfect smooth 60 fps
- **Build with:** Three.js (noise displacement, MeshPhysical with sheen) — threejs-* skills

## Clay Diorama
- **Aliases:** miniature clay set, tabletop diorama
- **Source:** skaleout
- **Lemo-Opuscar:** `memphis-diorama`, `tilt-shift` (close)
- **Palette:** as Clay 3D, plus base board #8D6E63
- **Shape & line:** a small handmade set on a round/square base, props at toy scale
- **Texture:** clay, felt, wood base
- **Lighting:** studio softbox from above, shallow depth of field (tilt-shift blur)
- **Type:** small clay signs inside the scene
- **Motion:** slow orbit around the set, stop-motion characters
- **Signature:** whole world sits on a visible base with shallow DOF
- **Avoid:** infinite backgrounds
- **Build with:** Three.js + DOF post-processing

## Knitted Puppet
- **Aliases:** knitted, wool, yarn, felt puppet, amigurumi
- **Source:** skaleout
- **Lemo-Opuscar:** —
- **Palette:** wool tones: cream #EFE6DA, cranberry #B5323C, mustard #D9A03F, teal #2F7F86, heather grey #9A9A9A
- **Shape & line:** soft rounded forms, button eyes, stitched mouths, yarn hair
- **Texture:** knit stitch pattern (V-rows), fuzz/fibre halo, felt
- **Lighting:** soft warm practical light, cosy
- **Type:** embroidered or felt letters
- **Motion:** puppet-like: bobbing, floppy limbs, stepped stop-motion
- **Signature:** visible stitch texture + button eyes
- **Avoid:** shiny materials, hard edges
- **Build with:** Three.js with knit normal map + sheen + fuzz shell; or canvas with knit pattern fills

## Brick Toy
- **Aliases:** Lego style (never use the trademark or minifig likeness), building bricks
- **Source:** skaleout, theaigeekk
- **Lemo-Opuscar:** `brick-toy`
- **Palette:** toy primaries #D01012 #0055BF #F2CD37 #237841 #FFFFFF #05131D
- **Shape & line:** studded bricks, plates, blocky characters with generic (non-trademark) heads
- **Texture:** glossy ABS plastic, tiny scratches, studs
- **Lighting:** bright studio, crisp reflections, soft shadows
- **Type:** brick-built letters
- **Motion:** stop-motion stepping; bricks snap together; build-up assemblies
- **Signature:** objects assembling brick by brick
- **Avoid:** official logos/minifig designs
- **Build with:** Three.js instanced bricks

---

# Retro digital

## Pixel Art
- **Aliases:** pixel, 8-bit, 16-bit, pixel RPG
- **Source:** skaleout, sebintel, andremass.ai, theaigeekk
- **Lemo-Opuscar:** `pixel-rpg` (also `one-bit-dither`, `hd-2d`)
- **Palette:** a fixed limited palette (e.g. PICO-8 16 colours: #000000 #1D2B53 #7E2553 #008751 #AB5236 #5F574F #C2C3C7 #FFF1E8 #FF004D #FFA300 #FFEC27 #00E436 #29ADFF #83769C #FF77A8 #FFCCAA)
- **Shape & line:** low-res grid (e.g. 320×180 scaled ×6, nearest-neighbour), clean 1-px outlines, dithering
- **Texture:** dithering patterns only
- **Lighting:** palette-shifted shading, no smooth gradients
- **Type:** bitmap pixel fonts
- **Motion:** sprite frame cycles, integer-pixel movement, parallax layers, screen shake
- **Signature:** crisp nearest-neighbour upscale
- **Avoid:** anti-aliasing, sub-pixel motion, blur
- **Build with:** canvas 2D at low res with imageSmoothingEnabled=false

## PS2
- **Aliases:** PS2 style, early-2000s console 3D, low-res 3D
- **Source:** skaleout, theaigeekk
- **Lemo-Opuscar:** —
- **Palette:** slightly desaturated with fog colour #8FA3B0, dusky skies
- **Shape & line:** low-to-mid polygon models, blocky hands, simple faces
- **Texture:** low-res blurry textures (128–256 px), affine/bilinear smear, baked lighting
- **Lighting:** vertex lighting, heavy distance fog, bloom glare
- **Type:** chunky chrome or bevelled menu text
- **Motion:** stiff canned animation loops, slow orbit cameras
- **Signature:** distance fog + low-res textures + render at 640×480 upscaled with slight blur and interlace lines
- **Avoid:** PBR realism, modern ultra-sharp textures
- **Build with:** Three.js rendered to a 640×480 target, nearest/linear upscale, fog, low-poly assets

## CRT Vector
- **Aliases:** vector monitor, oscilloscope, ASCII CRT, retro terminal
- **Source:** skaleout
- **Lemo-Opuscar:** `ascii-crt`, `oscilloscope-math`
- **Palette:** black #000, phosphor green #33FF66 (or amber #FFB000, cyan #66FFFF)
- **Shape & line:** thin glowing wireframe lines, no fills
- **Texture:** scanlines, phosphor persistence trails, slight barrel distortion, flicker
- **Lighting:** lines emit light (bloom)
- **Type:** vector/stroke fonts or terminal mono
- **Motion:** wireframes rotate, lines draw with afterglow trails
- **Signature:** phosphor trail fading behind moving lines
- **Avoid:** fills, colourful palettes
- **Build with:** canvas 2D additive lines + persistence (draw with low-alpha clear); WebGL CRT shader

## Y2K Chrome
- **Aliases:** Y2K, chrome, liquid metal
- **Source:** sebintel, andremass.ai
- **Lemo-Opuscar:** —
- **Palette:** silver chrome, iridescent #B8F2FF/#E3C9FF/#FFD6F5, electric blue #2E5BFF, black
- **Shape & line:** blobby liquid shapes, chrome type, stars/sparkles, tribal swooshes, bubbles
- **Texture:** reflective chrome (environment map), holographic foil
- **Lighting:** studio environment reflections, specular glints
- **Type:** chrome-bevelled futuristic display
- **Motion:** spinning chrome logos, blobs morph, sparkle twinkles
- **Signature:** liquid chrome reflecting a gradient sky
- **Avoid:** matte flat look
- **Build with:** Three.js MeshPhysicalMaterial metalness=1 + env map; or CSS gradients for 2D

## Synthwave
- **Aliases:** outrun, retrowave
- **Source:** andremass.ai, matt_penny_applied_ai
- **Lemo-Opuscar:** `neon-tubes` (close)
- **Palette:** night #0B0221, magenta #FF2A6D, cyan #05D9E8, purple #7B2CBF, sun gradient #FFB000→#FF2A6D
- **Shape & line:** neon wireframe grid floor to a horizon, striped setting sun, palm silhouettes, mountains wireframe
- **Texture:** scanlines, grain, bloom
- **Lighting:** neon glow, rim light
- **Type:** chrome italic script/80s display
- **Motion:** endless forward grid scroll, sun pulses to beat
- **Signature:** striped sun over a scrolling grid
- **Avoid:** daylight, desaturated colours
- **Build with:** Three.js + bloom, or canvas 2D perspective grid

## Vaporwave
- **Aliases:** vapor, aesthetic
- **Source:** andremass.ai
- **Lemo-Opuscar:** —
- **Palette:** pastel pink #FF71CE, mint #01CDFE, lilac #B967FF, aqua #05FFA1, yellow #FFFB96
- **Shape & line:** Greek statues, Windows-95 windows, checkerboards, palm trees, dolphins, grids
- **Texture:** VHS noise, low-res JPEG, chromatic aberration
- **Lighting:** pastel gradient skies
- **Type:** full-width Japanese/Latin text (Ａｅｓｔｈｅｔｉｃ), Arial/MS fonts
- **Motion:** slow, dreamy, rotating statues, floating windows, slowed tempo
- **Signature:** marble bust + Windows-95 dialog on pastel gradient
- **Avoid:** fast energetic cuts
- **Build with:** HyperFrames/CSS; Three.js for rotating busts

## Glitch
- **Aliases:** datamosh, digital glitch, VHS glitch
- **Source:** andremass.ai
- **Lemo-Opuscar:** — (close: `scratch-film`)
- **Palette:** RGB split red #FF0040 / cyan #00FFF0 on black or the source footage
- **Shape & line:** sliced horizontal bands displaced, pixel sorting, block artifacts
- **Texture:** scanlines, noise, compression blocks
- **Lighting:** n/a
- **Type:** mono / pixel fonts that tear and jitter
- **Motion:** stuttering bursts (2–6 frames) on beats, then clean holds — glitch as punctuation, not constant
- **Signature:** RGB channel split + horizontal slice offset on the beat
- **Avoid:** constant glitch (unreadable), flashing that risks photosensitivity (keep under 3 flashes/sec)
- **Build with:** WebGL fragment shader or FFmpeg filters (rgbashift, noise)

## Retro
- **Aliases:** retro, vintage 70s/80s
- **Source:** sebintel
- **Lemo-Opuscar:** `midcentury-toon`, `silkscreen-poster` (close)
- **Palette:** 70s: #E07A1F #D9B44A #7A9E3E #8C4A2F #F2E3C6 (or 80s: see Synthwave)
- **Shape & line:** rounded stripes, sunbursts, rainbows, rounded rectangles
- **Texture:** print grain, faded edges
- **Lighting:** flat or warm
- **Type:** bubbly 70s display (Cooper-like), rounded
- **Motion:** groovy wave motion, stripes sweep, gentle bounce
- **Signature:** 3–4 parallel rounded stripes swooping across
- **Avoid:** mixing decades unintentionally
- **Build with:** SVG + GSAP

---

# Modern UI & light

## Glassmorphism
- **Aliases:** glass, frosted glass, liquid glass
- **Source:** sebintel, andremass.ai
- **Lemo-Opuscar:** `glass-product` (close)
- **Palette:** colourful blurred blobs behind (#7F5AF0, #2CB67D, #FF8906, #E53170) + white glass rgba(255,255,255,0.12)
- **Shape & line:** rounded translucent cards, 1 px light border, layered depth
- **Texture:** backdrop blur 20–40 px, subtle noise on glass
- **Lighting:** soft top-left highlight on card edges
- **Type:** clean sans (Inter/SF-like), white
- **Motion:** cards float/parallax over moving blobs, smooth spring easing
- **Signature:** content readable on frosted glass over vivid blurred colour
- **Avoid:** low contrast text (check readability), too many stacked glass layers
- **Build with:** HTML/CSS backdrop-filter + GSAP (HyperFrames)

## Futuristic
- **Aliases:** sci-fi UI, HUD, hologram
- **Source:** sebintel
- **Lemo-Opuscar:** `hologram-hud`, `scifi-toon`
- **Palette:** deep navy #050B1A, cyan #00E5FF, white, warning orange #FF7A00
- **Shape & line:** thin lines, brackets, rings, data readouts, chamfered corners
- **Texture:** scanlines, faint grid
- **Lighting:** emissive UI, bloom
- **Type:** wide techno sans / mono
- **Motion:** UI elements boot up (line → box → fill), rings rotate, numbers tick
- **Signature:** HUD reticle locking onto a subject
- **Avoid:** clutter without hierarchy
- **Build with:** SVG + GSAP, or Three.js for holograms

## Cyberpunk
- **Aliases:** neon noir city
- **Source:** sebintel
- **Lemo-Opuscar:** `neon-tubes` (close)
- **Palette:** night #0D0221, neon pink #FF0080, cyan #00F0FF, acid yellow #F9F002, wet asphalt reflections
- **Shape & line:** dense city, signs, cables, rain
- **Texture:** rain streaks, wet reflections, grime
- **Lighting:** neon signs as key lights, volumetric haze, rim light
- **Type:** neon signage, katakana/Latin mix, glitchy mono
- **Motion:** slow dolly through rain, signs flicker
- **Signature:** neon reflected in puddles + volumetric haze
- **Avoid:** daylight; flat lighting
- **Build with:** Three.js (threejs-precipitation-surfaces, threejs-bloom, volumetric) 

## Aurora
- **Aliases:** aurora gradient, mesh gradient
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** deep #0A0F2C with flowing green #3DFFA2, teal #22D3EE, violet #A855F7, pink #F472B6
- **Shape & line:** soft flowing curtains/blobs, no hard edges
- **Texture:** fine grain to avoid banding
- **Lighting:** the gradient is the light
- **Type:** clean light sans
- **Motion:** slow flowing noise-driven curtains, colour drift
- **Signature:** slowly undulating light curtains
- **Avoid:** banding (add grain), fast motion
- **Build with:** WebGL shader (noise) or threejs-procedural-vfx aurora

## Particles
- **Aliases:** particle, particle logo, dust, stardust
- **Source:** andremass.ai (also milestone-reveal skill)
- **Lemo-Opuscar:** `firefly-pointillism`, `flow-field` (close)
- **Palette:** black #000 with white/gold #F5D78E points, or brand colour
- **Shape & line:** thousands of points forming and dissolving shapes/text/logos
- **Texture:** soft glow per particle
- **Lighting:** additive glow, depth of field on far particles
- **Type:** text assembled from particles
- **Motion:** drift → attract into a shape → hold → disperse; curl-noise flow
- **Signature:** a logo or number condensing out of drifting dust
- **Avoid:** too few particles (looks cheap); jitter on hold
- **Build with:** Three.js Points / GPU particles, or canvas 2D

## Surreal
- **Aliases:** surrealism, dreamlike
- **Source:** sebintel
- **Lemo-Opuscar:** —
- **Palette:** dreamy desert/sky: #F2C6A0 #8EC5FC #E0C3FC #2B2D42
- **Shape & line:** impossible objects (melting, floating, oversized), long shadows, endless planes
- **Texture:** smooth painterly or clean 3D
- **Lighting:** low sun, long shadows, soft sky
- **Type:** minimal, small
- **Motion:** slow, physics-defying (things float up, doors open onto sky)
- **Signature:** an ordinary object at impossible scale on an empty plane
- **Avoid:** chaos without a single idea
- **Build with:** Three.js scenes

---

# 3D & explainer

## Isometric
- **Aliases:** iso, isometric explainer, isometric infographic
- **Source:** andremass.ai, matt_penny_applied_ai
- **Lemo-Opuscar:** `iso-infographic`, `isometric-picture-book`
- **Palette:** soft pastel set #A8DADC #F1FAEE #E63946 #457B9D #1D3557 with consistent 3-tone shading per surface
- **Shape & line:** 30° isometric projection, blocks, tiles, little buildings/devices
- **Texture:** none or light grain
- **Lighting:** fixed light: top face lightest, left mid, right darkest
- **Type:** clean sans labels with leader lines
- **Motion:** blocks rise from the ground, data flows along pipes, camera stays isometric (pan only)
- **Signature:** a mini world on a tile that builds itself
- **Avoid:** perspective distortion, inconsistent face shading
- **Build with:** Three.js OrthographicCamera or SVG iso; explainer-video-skills `isometric-animation`

## Low Poly
- **Aliases:** low-poly, faceted
- **Source:** andremass.ai, techstackbro
- **Lemo-Opuscar:** `lowpoly-island`
- **Palette:** dusk #2B1E4A sky with warm #FF9A3C rim; or bright #8BC34A #4FC3F7 #FFB74D
- **Shape & line:** flat-shaded triangles, visible facets
- **Texture:** none (flatShading)
- **Lighting:** hemisphere fill (sky colour above, ground colour below) + warm key + strong rim; sharp shadows (shadow map 4096)
- **Type:** chunky 3D or clean sans
- **Motion:** timed shot list (camera from position a→b per shot), gentle character idle
- **Signature:** faceted shading + warm rim light at dusk
- **Avoid:** smooth normals, high-poly models
- **Build with:** Three.js flatShading (threejs-lighting, threejs-camera-direction)

## CGI Motion
- **Aliases:** CGI, 3D product motion, premium 3D
- **Source:** theaigeekk
- **Lemo-Opuscar:** `glass-product`, `white-model` (close)
- **Palette:** studio greys #1A1A1A→#E5E5E5 with one material colour
- **Shape & line:** clean modelled objects, bevels catching light
- **Texture:** PBR materials (brushed metal, glass, plastic)
- **Lighting:** 3-point studio, HDRI reflections, soft shadows, bloom on highlights
- **Type:** minimal sans
- **Motion:** smooth hero orbits, exploded views, objects assemble with spring physics
- **Signature:** slow hero orbit with light sweeping across bevels
- **Avoid:** flat lighting, unrealistic jitter
- **Build with:** Three.js PBR + post-processing (threejs-* skills), title-sequence-3d

## 3D Explainer
- **Aliases:** 3D explainer, cutaway, teardown
- **Source:** matt_penny_applied_ai
- **Lemo-Opuscar:** `teardown`, `precise-mechanism`, `white-model`
- **Palette:** neutral #ECEFF1 world with colour-coded parts (#FF6B35 #4ECDC4 #FFE66D)
- **Shape & line:** clean models, labels with leader lines, cutaway sections
- **Texture:** clean matte
- **Lighting:** soft studio, ambient occlusion
- **Type:** labels, step numbers
- **Motion:** parts explode apart, highlight one part at a time, camera moves to each step
- **Signature:** exploded view with labels
- **Avoid:** cluttered labels, moving camera while reading
- **Build with:** Three.js + label overlay (HTML)

## 3D Data Chart
- **Aliases:** 3D chart, data physical
- **Source:** matt_penny_applied_ai
- **Lemo-Opuscar:** `data-physical`, `dataviz`
- **Palette:** dark #0E1117 or light #F7F7F5 + categorical (#4E79A7 #F28E2B #E15759 #76B7B2 #59A14F)
- **Shape & line:** extruded bars, columns, 3D pie/area surfaces, grid floor
- **Texture:** satin materials
- **Lighting:** soft key + AO, subtle reflections
- **Type:** clean numeric labels that count up
- **Motion:** bars grow from zero with stagger, camera orbits to reveal comparison, numbers count up
- **Signature:** bars rising as the camera swings around
- **Avoid:** distorting values with perspective — values must stay exact (see animated-chart)
- **Build with:** Three.js; dataviz skill for palette

## 3D Medical Explainer
- **Aliases:** "ZackD Films style" (describe, don't name), medical CGI, body-process explainer
- **Source:** theaigeekk
- **Lemo-Opuscar:** `microscope` (close)
- **Palette:** fleshy pinks #E8A0A0, organ reds #B23A48, bone #EDE3CF, fluids #F2D16B, x-ray blue #7FB3D5
- **Shape & line:** semi-realistic anatomy, cutaway body, cross-sections
- **Texture:** wet subsurface skin, translucent tissue
- **Lighting:** soft clinical light, rim on organs
- **Type:** none or small labels
- **Motion:** camera dives inside the body, process plays in close-up (e.g. food moving), slow and satisfying
- **Signature:** cutaway into the body revealing a process
- **Avoid:** gore, medical misinformation; check facts
- **Build with:** Three.js with SSS-like materials

## Glowing Atom
- **Aliases:** scientific glow, atom, physics glow
- **Source:** matt_penny_applied_ai
- **Lemo-Opuscar:** — (close: `oscilloscope-math`)
- **Palette:** black #02030A, electric blue #3FA9FF, white-hot core #FFFFFF, violet #8A5CFF
- **Shape & line:** nucleus sphere, orbital ellipses, electron trails
- **Texture:** bloom, trails
- **Lighting:** emissive, additive
- **Type:** thin sans labels
- **Motion:** electrons orbit with motion trails, slow camera tilt
- **Signature:** glowing core with trailing orbits
- **Avoid:** cluttered labels
- **Build with:** Three.js + bloom, or canvas additive

## Karnataka Heritage (Chittara × Mysore)
> **Needs a native Karnataka reviewer before publishing** (motif accuracy, cultural respect, Kannada usage).
- **Aliases:** chittara, karnataka folk, mysore painting, gruhapravesha, south indian folk art, red earth & rice paste
- **Source:** new recipe (BNB style sample 09); inspired by Chittara wall art of the Malnad region (Deevaru community tradition) and the palette of Mysore painting
- **Lemo-Opuscar:** — (none; closest grammar: `papercut-red` for ground-and-line economy, `marker-paper` for draw-on strokes)
- **Palette:** red-earth ground #A2472B (darker #7E3220), rice-paste white #F5EDDD, ochre #D9A441, near-black outline #2A1A14; Mysore accents: deep red #7E1C18, leaf green #2E5A36 / #4E7D45, gold leaf #C9A240 (light #F1D98A, dark #8F6A1E)
- **Shape & line:** flat folk geometry; white lines 2.5–4.5 px, near-constant, slightly irregular; multi-band borders (double rules, sawtooth triangles, dot rows, corner rosettes); dense fills of dots, small diamonds, scallop tiles, lattice (jali); figures with hourglass (two-triangle) torsos, single-line limbs, plain disc heads, faceless
- **Texture:** hand-plastered earth wall (mottling, broad trowel sweeps, fine grain), paste lines with a soft soaked edge; gold areas as flat gradient "leaf" with fine dark outline
- **Lighting:** none in the picture (flat); a gentle edge darkening of the wall; light lives only in sparing gold-leaf glints
- **Type:** classical serif with Indic warmth (e.g. Marcellus) for captions on a deep-green cartouche with gold double rule; small tracked sans for labels; Kannada only with native review
- **Motion:** draw-on like paste being laid: border first (rules, then sawtooth, then dots), then outlines, then pattern infill rising; drawings change on twos (12–15 fps) with a ≤1 px boil; motifs (leaves, kalasha) pop with a small back-ease; a slow 3 % push over the whole film
- **Signature:** a white Chittara border frame drawing on around a flat folk-art house on red earth, with mango-leaf toran, brass kalasha and a rangoli (kolam dot-grid) growing at the threshold; gold glints used sparingly
- **Avoid:** deities, religious figures or temple/community symbols beyond toran/kalasha/rangoli; caricature or faces; neon or glossy 3D; overusing gold; mixing in North-Indian or generic "ethnic" clip-art; sacred motifs as decoration without review
- **Build with:** canvas 2D draw-on strokes (seeded wobble, reveal by length) + Playwright frame capture; audio: tanpura-style drone + veena-like plucks with slides, soft hand-drum, synthesized (reference build: bnb-videos/style-samples/09-karnataka-heritage)
