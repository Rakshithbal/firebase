# "Not Another Party": techno promo reel (template)

A 33 s vertical (1080x1920) reel for Instagram Reels / TikTok / Shorts, drawn entirely in code. There is no real footage.

- **Voice:** ElevenLabs "Vihan A", three lines (`audio/vihan_vo.mp3`). It never says event-specific details, so you don't need to re-record it.
- **Music:** original techno synthesised in `music.py`, with no samples and nothing to license.
- **Visuals:** `render.py` (skia), following the script's timeline: hook → club → drop → close-ups → venue card → identity → title → CTA.

## Make it real
1. Edit `PLACEHOLDERS` at the top of `render.py` (event, date and city, sound system, venue, set length, price, deadline).
2. `python3 render.py --out out/not_another_party.mp4 --audio audio/mix.wav` (about 2 min on 4 cores).
3. Don't add crowd numbers or "sold out" claims unless they're true.

## Caption (fill in the brackets)
No commercial hits. No phones-up crowd. [X] hours of [DJ NAME] on [sound system] in [venue].
Early bird until [date] or the first [N] tickets, whichever comes first. Link in bio. 🖤
[Free water · Safe-space crew on site · 18+/21+ with ID]
