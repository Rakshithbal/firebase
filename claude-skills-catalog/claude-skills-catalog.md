# Claude Skills & Repos Catalog

Everything collected from the Instagram screenshots analysed in this chat (6 batches). Star counts are as shown in screenshots; repos were **not** verified. `repo ?` = name not visible.

**Install methods:** `npx skills add owner/repo` · `/plugin marketplace add owner/repo` then `/plugin install name@repo` · copy folder to `~/.claude/skills/<name>/` · or tell Claude `install this skill: <GitHub URL>`.

## Contents
1. Skills & repos  2. Styles & vocabulary  3. Prompts  4. Agency workflows  5. Pipelines & setup  6. Pro tips  7. Cautions

## 1. Skills & repos


### A. Video – core frameworks

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 1 | `remotion-dev/skills` | 6.8k | `npx skills add remotion-dev/skills` | Video as React components → MP4. Sub-skills: remotion-best-practices, remotion-studio + render, remotion-captions, watch-video (optional) | editwithmukesh, papaocus, editbynilesh |
| 2 | `greensock/gsap-skills` | 16–18k | `npx skills add greensock/gsap-skills` | Official GSAP: timelines, tweens, ScrollTrigger, easing, text animation; React/Vue/Svelte | editwithmukesh, papaocus |
| 3 | `heygen-com/hyperframes` | 82k | `claude plugin marketplace add heygen-com/hyperframes → claude plugin install hyperframes@hyperframes` | Write HTML, render video. Built for agents. Includes hyperframes-cli | papaocus, samdespomarketing, aiwith.om |
| 4 | `CloudAI-X/threejs-skills` | 4.1k | `npx skills add CloudAI-X/threejs-skills` | Three.js 3D scenes, materials, lighting, animation | papaocus, techstackbro |
| 5 | `scottstts/Threejs-Awesome-Graphics-Agent-Skills` | 984 |  | Polished Three.js graphics | papaocus |
| 6 | `adithya-s-k/manim_skill` |  |  | Manim (3Blue1Brown-style) math/explainer animation | okaashish |
| 7 | `anthropics/skills` | 192k | `/plugin marketplace add anthropics/skills` | Official: algorithmic-art (p5.js), canvas-design, frontend-design | papaocus |
| 8 | `NousResearch/hermes-agent (skills/creative/p5js)` | 262k |  | Generative / interactive p5.js pipeline | papaocus |
| 9 | `Diffusion Studio` |  |  | Browser-based video editing/compositing engine (TypeScript) | editwithmukesh |

### B. Motion graphics packs

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 10 | `whaleyxbt/claude-motion` | 927 |  | Motion direction, frame review, code-generated sound (toolkit) | papaocus, rananjay.ai |
| 11 | `howseen-ai/claude-motion-design` |  |  | HTML video workflow using Playwright + FFmpeg (likely 'HowSeen Motion') | rananjay.ai |
| 12 | `charlie947/motion-graphics-skills` |  |  | 13 skills: launch videos, charts, motion graphics | rananjay.ai |
| 13 | `Barty-Bart/motion-graphics` | 1.2k |  | Motion-graphics skills for Claude Code + Codex | papaocus |
| 14 | `JakeB-5/motion-graphic-skill` |  |  | Brief + references → beat-synced canvas motion graphics with sound | papaocus |
| 15 | `haidrrrry/claude-remotion-skill` |  |  | Remotion workflow for captions, B-roll and sound | rananjay.ai |
| 16 | `t3knobox/klik-anim-skill-creation` |  |  | Animation, camera & production guidance for Remotion | rananjay.ai |
| 17 | `Sunwood-ai-labs/hyperframes-motion-reel-skill` |  |  | Beat-synced HyperFrames showreels with coded sound | rananjay.ai |
| 18 | `ultra.skills '30 Claude Animations' (repo ?)` |  | `/animate --all` | Map Route, Headline, Teardown, Split Flap, Git City, Stat Chart, Globe Arcs, Agent Swarm, Before/After… | ultra.skills |
| 19 | `'15 motion design styles' (repo ?)` |  |  | 15 finished 10s films with exact prompt + code; swap words → brand intro | sebastianhardy_ |

### C. Film styles, cartoons & stories

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 20 | `lemomo-ai/lemo-opuscar` | 5.9k |  | 66 film styles (59 earlier); each = style prompt + demo film; renders via WebGL + video.mjs | agi_point, aaqib_ai, devzonex, george.automates |
| 21 | `JohnHeibel/ClaudeAnimationBase` | 1.6k |  | Base animation kit; orange box character (likely the 31-emotion cartoon starter kit, MIT) | okaashish, george.automates |
| 22 | `deenukhan/story-animator` |  | `install this skill: https://github.com/deenukhan/story-animator` | Writes story, voiceover, animates every frame (clay/paper look) | neuraltech.ai |
| 23 | `alexgreensh/anidoodle` |  |  | Doodle-style animation | okaashish |
| 24 | `alchaincyf/huashu-art-motion` |  |  | Art + motion styles | okaashish |
| 25 | `pyang5166/gbro-collage-broll` | 1.5k |  | Paper-collage B-roll | george.automates |
| 26 | `iart-ai/explainer-video-skills` |  | `npx skills add iart-ai/explainer-video-skills` | Explainer videos (MIT, free) | clawed_irl |
| 27 | `Paint MV skills (repo ?)` |  |  | Hand-painted watercolour music videos | okaashish |
| 28 | `Hand-Drawn Explainer (repo ?)` |  |  | Illustrations appear stroke by stroke | okaashish |
| 29 | `Whiteboard Video (repo ?)` |  |  | Whiteboard-explainer style | editwithmukesh |
| 30 | `3D animator skill (repo ?)` |  |  | 'No Blender. Just Claude.' 3D scenes | holcdenis |
| 31 | `Cube Motion / Oil Motion / ShaderCN / Hairline / Evil Buttons / Motion B-Roll / OpenMontage / Video Shotcraft` |  |  | From the '15 skills for motion designers' list — not verified | editwithmukesh |

### D. Editing your own footage

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 32 | `browser-use/video-use` |  | `Read install.md; wire FFmpeg; register skill` | AI talking-head editing; uses FFmpeg + ElevenLabs | samdespomarketing |
| 33 | `AgriciDaniel/claude-shorts` | 257 |  | Long-form → vertical shorts; AI segment scoring, Remotion captions, cursor tracking | theromanknox |
| 34 | `kurbaitaev/ghost-editor` | 195 |  | Raw talking head → finished reel (takes, captions, motion graphics) | aibyvj |
| 35 | `kajisho5/ffmpeg-skill` | ~4k |  | Local editor: 42 FFmpeg tools + MCP server | aibyvj |
| 36 | `Reel effects (repo ?)` |  | `/teleport /text-behind /reel-wall /reel-orbit /logo-rain /film-grade /clone-me` | Talking-head reel effects | samfromopdigital |
| 37 | `20 video effects (repo ?)` |  |  | Orbit, Chat Takeover, Frame Escape, Snap Zoom, Checklist Pop, Headline Stack, Zoom Portal, Growth Curve, Studio Reveal, B-roll Overlay, Paper Cutout, Dolly Zoom, Magazine Cover, Liquid Glass, Zoom Through Cut, Green Screen, Frame Break, Digital Zoom, Phone Mockup, Checklist | taki.gpt |
| 38 | `my-editing-style (YOU build it)` |  | `.claude/skills/my-editing-style/SKILL.md` | Claude studies reels you like and saves the style as a reusable skill | samdespomarketing |

### E. Engineering & general

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 39 | `vercel-labs/skills → find-skills` | #1 | `npx skills add vercel-labs/skills` | Finds other skills for you; #1 on the skills leaderboard | nicksadler.io |
| 40 | `mattpocock/skills` | 1.4M installs | `npx skills add mattpocock/skills` | grill-me, grill-with-docs, tdd, code-review, diagnosing-bugs | FIVE post, nicksadler.io |
| 41 | `vercel-labs/agent-browser` | 1.2M installs |  | Browser automation for agents | nicksadler.io |
| 42 | `Apple design (repo ?)` |  |  | Apple Human Interface design principles | FIVE post |
| 43 | `Humanizer (repo ?)` |  |  | Removes AI-writing tells (based on Wikipedia 'Signs of AI writing') | FIVE post |
| 44 | `cathrynlavery/diagram-design` | 64.4k |  | Diagram design | albert.olgaard |
| 45 | `Donchitos/Claude-Code-Game-Studios` | 36k |  | One session → full game studio of agents (Godot/Unity/Unreal) | repo trending post |
| 46 | `msitarzewski/agency-agents` | 163k |  | Whole 'agency' of specialised agents with personalities & deliverables | nick_saraev |
| 47 | `latent-spaces/brag` |  |  | Claude plugin (skills/brag); purpose unclear | itstundeanthony |
| 48 | `homeassistant-ai/ha-mcp` | 6.5k |  | MCP server to control Home Assistant smart home | home post |
| 49 | `sofianedevs list` |  |  | AutoClip MVP, OpenHands, Persona Live, Red Ink, MooMoo AI Novel | sofianedevs |

### F. Content, marketing, SEO, brand

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 50 | `Ootto-AI/claude-content-skills` |  |  | 52 skills (MIT): reel-scripter, carousel-builder, comment-responder, viral-hook-writer, caption-and-hashtags, bio-profile-optimizer, content-calendar, reel-analyzer… | jayantcreates.ai |
| 51 | `sergebulaev/linkedin-skills` |  |  | 12 skills (MIT): Interview, Plan, Write, Humanize, Reuse, Extract, Comment, Reply, Optimize, Advocate, Analyze, Monitor | nick_saraev |
| 52 | `SEO skills (claude-seo, geo-seo-claude, schema, programmatic-seo, claude-blog)` |  |  | SEO, GEO (AI-search optimisation), schema markup, programmatic pages, blogging | fullbytedeveloper |
| 53 | `Corey Haines marketing skills` |  |  | 53 skills: SEO, copywriting, ads, email | FIVE post |
| 54 | `arnabbagxd/brand-build… (name cut off)` |  | `npx skills add arnabbagxd/brand-build…` | brand-context, target-audience, competitor-branding, brand-positioning, brand-strategy, brand-naming, brand-identity, brand-voice, brand-messaging, brand-guidelines, brand-launch, brand-audit, rebranding, personal-brand, brand-manifesto, brand-architecture, brand-measurement, d2c-marketing, meta-ads, google-ads, email-marketing, ugc-strategy, influencer-marketing, whatsapp-marketing, brand-partnerships, b2b-brand-marketing, aso | justyn.ai |
| 55 | `Carousel studio (repo ?)` |  |  | Animated carousels made with Claude Code | ibraviz.ai |

### G. Lead gen & business repos

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 56 | `gosom/google-maps-scraper` | 6.6k |  | 'cafés in Bangalore' → name, phone, website, rating → Excel | meghanify |
| 57 | `huginn/huginn` | 50.1k |  | Self-hosted agents that watch Reddit/X/web for buying signals | meghanify |
| 58 | `firecrawl/firecrawl` | 193k |  | Reads a whole company website (AGPL-3.0) | meghanify |
| 59 | `reacherhq/check-if-email-exists` | 10.2k |  | Verifies an inbox exists without sending | meghanify |
| 60 | `remoteintech/remote-jobs` | 40.9k |  | Directory of remote-friendly companies to pitch | meghanify |

### H. Underlying tools (not skills)

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 61 | `FFmpeg/FFmpeg` |  |  | Every cut, crop, mix, mute, render; silencedetect finds dead air | many |
| 62 | `openai/whisper` |  |  | Speech → text with word timestamps | aiwith.om, paytkaleiwahea |
| 63 | `SYSTRAN/faster-whisper` |  |  | Fast word-level transcription | paytkaleiwahea |
| 64 | `yt-dlp/yt-dlp` |  |  | Download reference videos (study only) | many |
| 65 | `opencv/opencv + opencv_contrib` |  |  | Active-speaker tracking for 9:16 crop | paytkaleiwahea |
| 66 | `puppeteer/puppeteer` |  |  | Headless Chrome renders captions/titles | paytkaleiwahea |
| 67 | `PixiJS / GL Transitions / p5.js` |  |  | 2D WebGL, shader transitions, generative art | decode.dani |
| 68 | `ElevenLabs` |  |  | AI voice (paid API) | samdespomarketing |
| 69 | `Google Flow` |  |  | Google's AI video tool (hybrid with Claude) | thatsalariedwoman.ai |
| 70 | `MotionClone` |  |  | Rebuild motion videos as editable projects (runs on Codex) | theromanknox |
| 71 | `Codescan (getlayers.ai/layer/codescan)` |  |  | 5,000+ line prompt to recreate a design as index.html | theromanknox |
| 72 | `BlueDot, Apify, Notion, Gamma, WhatsApp, Gmail` |  |  | Agency stack: call recording, scraping, notes, decks, onboarding | ashmit.shahi |

### I. Already in this Claude session

| # | Skill / repo | ★ | Install | What it does | Seen via |
|---|---|---|---|---|---|
| 73 | `cinematic-film` |  | `built-in` | Narrated cinematic films from code (maps, documents, timed captions) | this session |
| 74 | `stop-slop` |  | `built-in` | Removes AI writing patterns | this session |
| 75 | `canvas-design, docx, pptx, xlsx, pdf, Figma/Wix/WordPress skills` |  | `built-in` | Design, documents, site management | this session |

## 2. Styles & vocabulary

| Source | Styles |
|---|---|
| skaleout (10) | Woodblock Print, Pixel Art, Noir Comic, 1930s Cartoon, Brick Toy, Clay Diorama, CRT Vector, Knitted Puppet, PS2 Style, Sumi Ink |
| sebintel (20) | Minimalism, Maximalism, Futuristic, Vector Art, Collage Art, Retro, Cyberpunk, Pop Art, Glassmorphism, Clay Style, Pixel Art, Editorial, Y2K, Swiss Design, Surreal, Bohemian, Victorian, Graffiti, Aurora, Handwritten |
| andremass.ai (20) | Swiss style, Kinetic type, Pop art, Flat 2D, Clay 3D, Glassmorphism, Y2K chrome, Synthwave, Risograph, Paper collage, Glitch, Particles, Neobrutalism, Bauhaus, Memphis, Vaporwave, Pixel art, Isometric, Low poly, Line art |
| theaigeekk (10) | Pixel Art, ChalkBoard, Glow Sketch, PS2 Style, Comic Art, Flat Vector, Dan Koe Style*, CGI Motion, Lego Style*, ZackD Films*  (*describe the look instead of naming creators/trademarks) |
| matt_penny_applied_ai (9) | Isometric, Paper-Cut, 3D Data Chart, Synthwave, 3D Explainer, +4 hidden (physics, glowing atom) |
| Others | Ransom Note typography, Madhubani, Rajasthani miniature, Watercolour paper stickers, Ink-wash, Blueprint, Vintage natural-history plate |
| Lighting vocabulary | Key light + direction, Rim light, Warm key / cool fill, Volumetric light, Falloff, Bloom/halation, Occlusion, Exposure/value range |
| Physics vocabulary | Forward scattering, Weight & inertia, Gusts not waves, Depth-scaled particles, Light affects the world |

## 3. Prompts

### Bairan lyric video (thatsalariedwoman.ai)

```
Turn song.mp3 and lyrics.txt into a 30-second 16:9 video of the hook. Paint a boy and a girl as watercolour paper stickers acting out each line on soft painted walls, all in code. Align the lyrics to the vocals. Show me 3 stills first, then render.
```

### Flying whale – one prompt, any style (skaleout)

```
Create one self-contained HTML file that plays a 6 second looping animation in a 9:16 frame (a 1080x1920 canvas scaled to fit the window, black outside it). Draw everything in code: no images, no external files. For a 3D style you may load three.js from cdnjs.cloudflare.com; nothing else external.
Scene: what if whales could fly? One whale swims through the sky above a city. Make the whale cute: round body, big friendly eyes, small smile, little fins, a happy tail flick. Make it cool: confident glide, cloud spray trailing off its tail, the city below with tiny people and birds looking up.
Style: [YOUR STYLE]. Commit to this style completely: palette, shapes, line, texture, lighting and the way things move.
Motion: smooth, requestAnimationFrame, gentle camera drift, at least three layers of parallax…
```

### story-animator (neuraltech.ai)

```
Use story-animator to make a 60-second kids' story about a tiny cleaning robot who finds the last flower in a grey city.
```

### 3D scene (techstackbro)

```
a low-poly cartoon character scrolling a phone at a desk at dusk   → define WHO / WHERE / WHAT; then key + rim + hemisphere fill lights; then a timed SHOTS list
```

### Editor setup (samdespomarketing) – Prompt 1

```
You are my expert short-form video editor. Your job is to edit my raw talking-head footage into scroll-stopping vertical videos (9:16, 1080x1920) for TikTok, Instagram Reels and YouTube Shorts.
[Keep API keys in a .env file — do NOT paste them in the prompt]
Install and set up each tool for me:
1. https://github.com/browser-use/video-use — read install.md first, wire up FFmpeg, register the skill with Claude Code, then read SKILL.md and helpers/.
2. https://github.com/heygen-com/hyperframes — claude plugin marketplace add heygen-com/hyperframes, then claude plugin install hyperframes@hyperframes
3. Optional: ask me if I want Remotion installed (company licence).
4. yt-dlp for reference videos.
5. FFmpeg if not installed.
If anything is missing (Python, Node.js, Git), install it and tell me if I need to restart Claude Code. Give me a checklist of what's installed. Don't edit or transcribe anything yet.
```

### Learn my style (samdespomarketing) – Prompt 2

```
I want you to learn the editing style from these videos: [LINK 1] [LINK 2] [LINK 3]
1. Download each one into the references/ folder using yt-dlp.
2. Break down the editing style they share: pacing (avg shot length, cut frequency); jump cuts; zooms and punch-ins; captions (font, size, colour, position, words per line, animation, highlighted words); motion graphics/emojis/pop-ups/B-roll; colour grade; SFX, music, levels; hook (first 3 seconds).
3. Show me your breakdown and ask me anything you're unsure about.
Once I approve it, turn it into a reusable skill saved at .claude/skills/my-editing-style/SKILL.md.
```

### Edit (samdespomarketing) – Prompt 3

```
Edit the raw footage in the raw/ folder. Use my "My Editing Style" skill for every creative decision, and use video-use to do the edit.
- Format: vertical 9:16, 1080x1920
- Cut every filler word (um, uh, like), false start, repeated take and dead pause. Keep the best take of each line.
- Make the first 3 seconds the strongest hook.
- Add captions, zooms, graphics and SFX exactly how the skill says.
- Target length: [45–60 seconds]
Before cutting, show me your plan (takes kept, hook, graphics). Wait for my OK. When you render, check every cut for jumps, audio pops or captions covering my face. Save to exports/ and tell me the file name.
```

### Revision prompts

```
• The first 2 seconds are slow. Cut straight to the line where I say "[LINE]".
• Captions are too big and covering my face. Make them 20% smaller and move them lower.
• Add a punch-in zoom every time I say a number or a key point.
• At [TIMESTAMP], add a pop-up graphic that says "[TEXT]".
• The pacing feels rushed around [TIMESTAMP]. Leave a little more breathing room.
```

### One-prompt editor (paytkaleiwahea)

```
You are my short form editor. Here are all the GitHub links to help you do your job: [FFmpeg, faster-whisper, whisper, yt-dlp, opencv, opencv_contrib, puppeteer, hyperframes]
Then: "I like the style of this reel. Can we duplicate this style and use it for a video of mine?"
```

### Codescan opener (theromanknox)

```
You are an expert creative front-end developer. Produce a single self-contained index.html file that recreates the project below with exceptional precision…
```

### Pause/um detection commands (aiwithanushka)

```
whisper raw_take.mp4 --word_timestamps True
ffmpeg -i raw_take.mp4 -af silencedetect=n=-35dB:d=0.4 -f null -
```

## 4. Agency workflows (ashmit.shahi, Easeus Media)

| Use case | How | Result claimed |
|---|---|---|
| 1 Sales call feedback | BlueDot records → Claude Project trained on sales frameworks → what I missed / did well / say next time | Better closer in 3 months |
| 2 Sales pitch prep | Drop prospect links → Claude + Apify scrape business, content, gaps → match to offer & service manual → meeting plan, questions, objections → monetisation funnel | No winging discovery calls |
| 3 Offer building | Project loaded with Alex Hormozi books → core offer, ICP, guarantee, pricing, deliverables, bonuses, build checklist, master prompts | Pressure-tested Grand Slam Offer |
| 4 Content scripting | Ideas in Notion → Claude pulls via connector → script from brand manual (4 pillars, 13 beliefs, 8 hook types, 6 structures) → Hook/Body/CTA | No blank page |
| 5 Landing page | Copy (headline, value stack, proof, offer+guarantee, CTA) → Claude builds HTML in brand colours/fonts → refine → dev publishes | 15–20 days → 2 days |
| 6 Onboarding SOP | Notion intake form → invoice + contract → WhatsApp welcome group → welcome email → kickoff call → bonus delivery | 13-month client retention |
| 7 Email sequences | Prospect + tone → first email, follow-ups, replies, situational copy, pushback | Weeks → one sitting |
| 8 Lead scraping → ICP score | Scraped links → Claude weighs doing vs not doing against offer → ICP score (e.g. clinic 82/100: no YouTube = core gap, first-mover) | Every lead scored before outreach |
| 9 Internal meetings | Goal + context → agenda, per-person talking points, action items | Team walks in aligned |
| 10 Presentations | Links + offer → Claude builds narrative → Gamma designs (connector) | Client deck in 5 minutes |

## 5. Pipelines & setup

**Code-generated video**

```
Idea/song/script → Claude writes HTML/CSS/JS, WebGL/Three.js, Remotion (React) or Manim → headless browser renders frames → (Python lyric/voice alignment) → FFmpeg stitches MP4
```

**Talking-head editing**

```
yt-dlp references → my-editing-style SKILL.md → raw video → faster-whisper word timestamps + ffmpeg silencedetect → plan & approve → OpenCV speaker crop 9:16 → captions/graphics (HyperFrames/Remotion/Puppeteer) → SFX/music/ElevenLabs → ffmpeg render → exports/
```

**Hybrid AI video**

```
Claude writes script/prompts/assembly; AI video model (Google Flow) generates painted clips
```

**Local client agency**

```
google-maps-scraper → Firecrawl research → ICP score → check-if-email-exists → personalised outreach → brand/SEO/reels delivery
```

**Bairan setup (Windows)**

```
irm https://claude.ai/install.ps1 | iex ; winget install OpenJS.NodeJS ; winget install Python.Python.3.12 ; winget install Gyan.FFmpeg
```

**Bairan setup (Mac)**

```
curl -fsSL https://claude.ai/install.sh | bash ; brew install node python@3.12 ffmpeg
```

## 6. Pro tips

- Show me 3 stills / a contact sheet first, then render.
- Review stills, not playback: ask for a grid of 6–8 frames at key moments.
- Version scenes: back up the approved still as scene_v1.js.
- Seed all randomness (rain, grain) so renders are repeatable.
- Output: PNG frames → H.264 MP4 (CRF 15) + ProRes 422 HQ .mov, 25 fps (250 frames = 10 s).
- Use strongest model at high effort while finding the look.
- 'Commit to this style completely' — palette, shapes, line, texture, lighting, motion.
- Precise lighting/physics vocabulary beats a better model.
- Write your own SKILL.md from references you like; that's the real moat.
- Load a Claude Project with your own frameworks/offer/brand manual and run every task against it.

## 7. Cautions

- Comment-for-DM posts are engagement bait — every repo listed is public on GitHub.
- Read SKILL.md / scripts of unknown skills before installing; skills can run code.
- Never paste API keys into prompts; use a .env file or environment variable.
- Remotion requires a paid company licence above a small team size.
- Commercial songs in lyric videos can be muted/claimed/demonetised.
- Use yt-dlp / MotionClone to study, not to repost or clone others' work.
- Scraping Maps/Reddit/X can break platform ToS; cold outreach must respect India's DPDP Act 2023 (and GDPR/CAN-SPAM abroad).
- Avoid naming specific creators/trademarks (Dan Koe, ZackD, Lego) as styles for monetised work.
- Model/pricing claims in carousels (e.g. 'Fable 5', '$10/$50') are creators' claims — check Anthropic's official pages.
- Repo names and star counts are from screenshots and were not verified.
