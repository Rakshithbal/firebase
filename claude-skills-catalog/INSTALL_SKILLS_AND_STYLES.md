# Video Styles & Skills — Install Guide

Everything installed in the BUYNBUILD video setup (Nov 2026), with the GitHub repo, the exact install commands, what styles each one gives you, and what it needs. Use it to rebuild the same setup on any computer or cloud session.

> Repos are third-party. Each one was read before installing; read SKILL.md and any scripts again before installing somewhere new, because a skill can run code.

---

## 0. How to install a skill (any machine)

| Method | Command | When |
|---|---|---|
| **Claude Code plugin** (best when the repo has `.claude-plugin/marketplace.json`) | `claude plugin marketplace add OWNER/REPO` then `claude plugin install PLUGIN@MARKETPLACE` | Exact commands are in section 1 |
| **Skills CLI** (Claude Code, Codex, Cursor, Gemini CLI and others) | `npx skills add OWNER/REPO` | Most skill repos; run `npx skills --help` for global vs project install |
| **Manual copy** | `git clone https://github.com/OWNER/REPO` then copy each folder that contains a `SKILL.md` into `~/.claude/skills/<name>/` (project-only: `.claude/skills/<name>/`) | Works everywhere; use for repos without a marketplace |
| **Ask Claude** | `install this skill: https://github.com/OWNER/REPO` | Quickest in Claude Code |

After installing, start a new Claude Code session so the skills load.

---

## 1. Claude Code plugins (copy-paste block)

```bash
# Video core
claude plugin marketplace add heygen-com/hyperframes        && claude plugin install hyperframes@hyperframes
claude plugin marketplace add greensock/gsap-skills         && claude plugin install gsap-skills@gsap-skills
claude plugin marketplace add anthropics/skills             && claude plugin install example-skills@anthropic-agent-skills && claude plugin install document-skills@anthropic-agent-skills

# Film styles, cartoons, explainers
claude plugin marketplace add lemomo-ai/lemo-opuscar        && claude plugin install lemo-opuscar@lemolab
claude plugin marketplace add alexgreensh/anidoodle         && claude plugin install anidoodle@alexgreensh-anidoodle
claude plugin marketplace add iart-ai/explainer-video-skills && claude plugin install explainer-video-skills@explainer-video-skills
claude plugin marketplace add deenukhan/story-animator      && claude plugin install story-animator@story-animator
claude plugin marketplace add JakeB-5/motion-graphic-skill  && claude plugin install motion-graphic@motion-graphic-skill
claude plugin marketplace add Moh4696/cinematic-skill       && claude plugin install cinematic-skill@cinematic-skill

# Editing
claude plugin marketplace add kajisho5/ffmpeg-skill         && claude plugin install ffmpeg-skill@ffmpeg-skill

# Engineering / general
claude plugin marketplace add mattpocock/skills             && claude plugin install mattpocock-skills@mattpocock
claude plugin marketplace add vercel-labs/agent-browser     && claude plugin install agent-browser@agent-browser
claude plugin marketplace add cathrynlavery/diagram-design  && claude plugin install diagram-design@diagram-design

# Marketing, brand, SEO
claude plugin marketplace add coreyhaines31/marketingskills && claude plugin install marketing-skills@marketingskills
claude plugin marketplace add arnabbagxd/Brand-building-skills && claude plugin install brand-building-skills@brand-building-skills
claude plugin marketplace add sergebulaev/linkedin-skills   && claude plugin install linkedin-skills@linkedin-skills
claude plugin marketplace add AgriciDaniel/claude-seo       && claude plugin install claude-seo@agricidaniel-claude-seo
claude plugin marketplace add AgriciDaniel/claude-blog      && claude plugin install claude-blog@agricidaniel-blog
```

Inside Claude Code you can type the same as slash commands: `/plugin marketplace add OWNER/REPO`, `/plugin install PLUGIN@MARKETPLACE`.

---

## 2. Every source, with styles and notes

### A. Video engines

| Repo | Install | Skills you get | Styles / what it makes | Needs |
|---|---|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | plugin (section 1) | hyperframes, hyperframes-cli, hyperframes-registry, media-use, reverse-any-video, style-sampling, slideshow, figma, remotion-to-hyperframes | HTML→video engine; ~450 registry blocks (titles, kinetic type, transitions, charts, maps, captions); **5 style-sampling styles** (Collage Explainer, Finance Explainer, Animated Science, 3D Brand, 3D True Crime — marked Pro) | Node 22+, FFmpeg. Turn off usage data: `export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1`. Licence Apache-2.0 |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | `npx skills add remotion-dev/skills` | remotion-best-practices, -create, -render, -studio, -captions, -docs, -interactivity, -license, -maps, -markup, -multimedia, -saas, -upgrade (13) | Video as React components | Node. **Remotion needs a paid company licence above a small team** |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | plugin | gsap-core, -timeline, -scrolltrigger, -plugins, -utils, -react, -frameworks, -performance | Pro motion/timelines | `npm i gsap` per project |
| [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | `npx skills add CloudAI-X/threejs-skills` | 13 threejs-* (fundamentals, lighting, materials, animation, postprocessing, shaders…) | 3D in code | — |
| [scottstts/Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | manual copy (folders with SKILL.md) | 24 advanced threejs-* (volumetric clouds, spectral ocean, bloom, procedural planets/vegetation/architecture, water optics…) | Cinematic 3D | ~82 MB; MIT + GPL-3.0 |
| [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | manual copy | manim-composer, manimce-best-practices, manimgl-best-practices | 3Blue1Brown-style math explainers | `pip install manim` + LaTeX + Cairo/Pango |
| [anthropics/skills](https://github.com/anthropics/skills) | plugin | algorithmic-art, canvas-design, frontend-design, theme-factory, skill-creator… + docx/xlsx/pptx/pdf | Generative art, posters, themes | — |

### B. Film-style libraries (complete styles with prompts + demos)

| Repo | Install | Styles | Needs |
|---|---|---|---|
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | plugin; then first run downloads the library to `~/lemo-opuscar`. Add packages: `sh <plugin>/skills/lemo-opuscar/scripts/setup.sh deps voice music` | **99 film styles** (watercolor, ukiyoe, ink-wash, blueprint, risograph, pixel-rpg, rubber-hose, satellite-briefing, teardown, newsreel, transit-map, stained-glass, woodcut, brick-toy, comic-history, map-explainer…) + make-your-own styles in `~/lemo-my-styles/` | Node 20+, **FFmpeg 7+**, Python 3.11+ (or uv). Voice tier downloads Kokoro (~354 MB). Licence **MIT AND CC-BY-NC-4.0** — check before paid client work |
| [alexgreensh/anidoodle](https://github.com/alexgreensh/anidoodle) | plugin | **32 styles**: drawn stills, films, 3D motion graphics, explainers | per-project npm packages; optional sound pack (233–373 MB) |
| [alchaincyf/huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) | manual copy (repo root is the skill) | **36 built styles + 16 recipes + 9 explainer types** (docs in Chinese) | uv + Playwright Chromium; 74 MB |
| [Moh4696/cinematic-skill](https://github.com/Moh4696/cinematic-skill) | plugin or `npx skills add Moh4696/cinematic-skill` | cinematic-film: **documentary "evidence board"** (photos, documents, maps, stamps timed to narration) | `pip install skia-python numpy pillow scipy` + FFmpeg |
| [iart-ai/explainer-video-skills](https://github.com/iart-ai/explainer-video-skills) | plugin or `npx skills add iart-ai/explainer-video-skills` | **5**: explainer-video, whiteboard-animation, isometric-animation, diagram-animation, wrapped-video | FFmpeg, Playwright |
| [deenukhan/story-animator](https://github.com/deenukhan/story-animator) | plugin | **2D narrated story** films (Remotion) | **ElevenLabs key**, FFmpeg |
| [pyang5166/gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) | manual copy | **Halftone paper-collage B-roll** | Built for Codex image_gen; **Gemini key**, FFmpeg |

### C. Motion-graphics packs

| Repo | Install | Skills / styles | Needs |
|---|---|---|---|
| [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | manual copy | **15**: vox-explainer, apple-launch-film, title-sequence-3d, launch-video, milestone-reveal, animated-chart, loop-cover, motion-effects (16 effects), newsletter-promo, model-showdown, reel-export, reference-to-motion, brand-intake, motion-brief-writer, motion-prompt-writer | Some use HyperFrames |
| [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) | manual copy | **6**: explainer-default / -engaging / -high-energy, motion-broll, sound-effects, object-separation | FFmpeg, Playwright; object-separation needs torch + SAM 2 |
| [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | manual copy | motion-design, sound-design, review-loop, web-sims | Written for its Remotion template — clone the repo to use fully |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | manual copy | motion-design (installed here as **motion-design-howseen** to avoid a name clash) | Playwright, FFmpeg, numpy, Pillow |
| [JakeB-5/motion-graphic-skill](https://github.com/JakeB-5/motion-graphic-skill) | plugin | motion-graphic: beat-synced canvas motion graphics | puppeteer-core, Chromium, FFmpeg |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | manual copy | remotion-motion-graphics | Remotion |
| [t3knobox/klik-anim-skill-creation](https://github.com/t3knobox/klik-anim-skill-creation) | manual copy (source folders, not the zips) | klik-anim, klik-cam, klik-remotion-method | Remotion official skills |
| [Sunwood-ai-labs/hyperframes-motion-reel-skill](https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill) | manual copy (repo root is the skill) | hyperframes-motion-reel: beat-synced showreels (Japanese) | HyperFrames |

### D. Editing your own footage

| Repo | Install | Skills / styles | Needs |
|---|---|---|---|
| [kurbaitaev/ghost-editor](https://github.com/kurbaitaev/ghost-editor) | manual copy (whole repo) | ghost-editor: **19 named styles + 7 presets** (Clean OS, Caption News, Whiteboard, Kinetic doc, Swiss Grid, Data Story, Hologram HUD…) | Whisper, FFmpeg; Gemini/ElevenLabs optional; caption OCR check is macOS-only |
| [browser-use/video-use](https://github.com/browser-use/video-use) | manual copy (whole repo; read install.md) | video-use (edit by conversation) + manim-video | FFmpeg; **ElevenLabs key** for transcription |
| [AgriciDaniel/claude-shorts](https://github.com/AgriciDaniel/claude-shorts) | manual copy (SKILL.md, scripts, references, remotion) | shorts: long video → vertical shorts with animated captions | faster-whisper, Remotion (`npm ci` in its remotion/), mediapipe for face reframe |
| [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | plugin | ffmpeg-skill: 42 FFmpeg tools | FFmpeg 6.1+, Python 3.10+ |

### E. Engineering, content, marketing, SEO

| Repo | Install | What you get |
|---|---|---|
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | copy `find-skills` folder | find-skills (search the skills ecosystem) |
| [mattpocock/skills](https://github.com/mattpocock/skills) | plugin | 27: grill-me, grilling, tdd, code-review, diagnosing-bugs, research, prototype… |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | plugin + `npm i -g agent-browser` | Browser automation CLI |
| [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | plugin | Editorial diagrams (+ draw.io / Mermaid / Excalidraw / PlantUML import) |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | follow its install script (copies agent `.md` files to `~/.claude/agents/`) | 283 specialist agents |
| [Ootto-AI/claude-content-skills](https://github.com/Ootto-AI/claude-content-skills) | manual copy | 54 Instagram/content skills (reel-scripter, carousel-builder, viral-hook-writer, content-calendar…). **Skipped `agent-reach`** (takes over web search, asks for cookies) |
| [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | plugin | 12 LinkedIn skills |
| [arnabbagxd/Brand-building-skills](https://github.com/arnabbagxd/Brand-building-skills) | plugin | 29 brand skills (strategy → launch, whatsapp-marketing, meta-ads…) |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | plugin | 53 marketing skills (copywriting, CRO, schema, programmatic-seo…) |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | plugin (main plugin only) | 29 SEO skills + 20 agents. **Skipped `seo-cockpit`** (hooks on every prompt) |
| [AgriciDaniel/claude-blog](https://github.com/AgriciDaniel/claude-blog) | plugin (main plugin only) | 32 blog skills + 5 agents. **Skipped `blog-studio`** (hook on every tool call) |
| [zubair-trabzada/geo-seo-claude](https://github.com/zubair-trabzada/geo-seo-claude) | manual copy (follow install.sh layout) | 16 GEO skills + 5 agents; helper scripts need `pip install requests beautifulsoup4 playwright flask` |

### F. BUYNBUILD's own (in your repo)

Repo: [Rakshithbal/firebase](https://github.com/Rakshithbal/firebase), branch `ccr-9834b4be-twc5oq`.

| Path | What it is | Install |
|---|---|---|
| `claude-skills-catalog/style-presets/` | **style-presets** skill: **55 style recipes** (palette, line, texture, lighting, type, motion, renderer) mapped to Lemo-Opuscar | copy the folder to `~/.claude/skills/style-presets/` |
| `bnb-videos/r05-curing-v2/` | **BNB editorial template** (HyperFrames): `DESIGN.md`, `assets/bnb.js` + `bnb.css`, fonts, scene template, R05 v2 | copy the folder as a starting project; `npm install` |
| `bnb-videos/r05-curing/` | Hand-built blueprint pipeline (canvas + Playwright + FFmpeg) used for R05 v1, R10, R15, R20 | copy as a starting project |
| `bnb-videos/tools/make_vo.py` | Script → Kokoro voice → timing.json + narration.wav | needs Lemo-Opuscar voice tier |

---

## 3. Style count at a glance

| Source | Styles |
|---|---|
| BNB house styles (blueprint hand-built, HyperFrames, **editorial v2**) | 3 |
| Lemo-Opuscar | 99 |
| style-presets (ours) | 55 (≈30 overlap Lemo) |
| huashu-art-motion | 36 + 16 recipes + 9 explainer types |
| anidoodle | 32 |
| ghost-editor (footage) | 19 + 7 presets |
| charlie947 motion pack | 15 |
| Barty-Bart explainers | 3 energies (+ motion-broll) |
| explainer-video-skills | 5 |
| HyperFrames style-sampling | 5 (Pro) |
| cinematic-film | 1 (documentary board) |
| story-animator | 1 (2D story) |
| gbro-collage-broll | 1 (collage B-roll) |

---

## 4. System tools the skills need

| Tool | Version | Install |
|---|---|---|
| Node.js | 22+ (HyperFrames), 20+ (others) | nodejs.org / `winget install OpenJS.NodeJS` / `brew install node` |
| Python | 3.11–3.13 (Kokoro voice needs < 3.14) | python.org / `winget install Python.Python.3.12` / `brew install python@3.12` |
| uv (optional) | latest | `pip install uv` or astral.sh |
| **FFmpeg** | **7+** (Lemo-Opuscar); 6.1 works for the editing skills | Windows `winget install Gyan.FFmpeg` · Mac `brew install ffmpeg` · Linux static: [BtbN/FFmpeg-Builds releases](https://github.com/BtbN/FFmpeg-Builds/releases) (verify the checksum) |
| Playwright Chromium | matching Playwright | `npx playwright install chromium` (skip if your environment already has one) |
| Video tools venv | — | `uv venv ~/video-tools/.venv && uv pip install --python ~/video-tools/.venv faster-whisper openai-whisper yt-dlp opencv-contrib-python-headless` |
| Manim (optional) | — | `pip install manim` + LaTeX + Cairo/Pango |

## 5. Keys (add as environment variables or your agent's secret store — never paste into prompts)

| Key | Used by |
|---|---|
| `ELEVENLABS_API_KEY` | story-animator, video-use, ghost-editor, HyperFrames media-use (better voice) |
| `GEMINI_API_KEY` | gbro-collage-broll, ghost-editor B-roll checks |
| Apify / Publora / Pixfaro | linkedin-skills optional backends |

## 6. Licence & safety notes

- **Remotion**: paid licence for companies above a small team. HyperFrames (Apache-2.0) has no such limit — preferred for paid client work.
- **Lemo-Opuscar**: MIT AND CC-BY-NC-4.0 — confirm which parts are non-commercial before client use.
- **HyperFrames telemetry**: off with `HYPERFRAMES_NO_TELEMETRY=1` and `DO_NOT_TRACK=1`.
- Read every new skill's `SKILL.md` and scripts before installing; skip anything that adds hooks on every prompt/tool call, fetches and runs remote scripts, or asks for cookies.
