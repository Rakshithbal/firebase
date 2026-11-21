> **BNB editorial project (skill: bnb-editorial-video).** Read `DESIGN.md` before touching any composition.
> Config lives in `project.json` + `lines.json` + `timing.json`; after changing any of them run `python3 tools/gen.py`.
> Generated (never hand-edit): `index.html`, `assets/project.js`, `assets/timing.js`, `assets/theme.css`, `compositions/captions.html`.
> Shared (art director only): `assets/bnb.css`, `assets/bnb.js`, `compositions/bg.html`, `compositions/chrome.html`, `DESIGN.md`.
> A scene agent edits only its own `compositions/sN.html`. Reference scenes from R05 are in `examples/` (not wired in).
> Every shell: `export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 PATH=/root/.local/bin:$PATH`.
> Done = `npm run check` 0 errors + snapshots you have looked at. Build with `bash build.sh` (copied from the skill's scripts/).
