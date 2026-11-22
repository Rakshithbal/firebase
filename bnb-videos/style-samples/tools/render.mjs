// node render.mjs <sample_dir> [--stills 1,5,9 --out dir] [--from 0 --to 10]
// Loads <sample_dir>/index.html (with __TIMING__ replaced by timing.json) and calls window.renderAt(t) per frame.
import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
import fs from 'fs'; import path from 'path';
const dir = path.resolve(process.argv[2]); const args = process.argv.slice(3);
const get = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const T = fs.existsSync(path.join(dir, 'timing.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8')) : { total: 10, fps: 30, lines: [] };
const built = path.join(dir, `_built_${process.pid}.html`);
fs.writeFileSync(built, fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('__TIMING__', JSON.stringify(T)));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + built); await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
const shot = async (t, file) => { const d = await p.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64')); };
try {
  if (get('--ev')) fs.writeFileSync(get('--ev'), JSON.stringify(await p.evaluate(() => window.EV || []), null, 0));
  if (get('--ev')) {}
  else if (get('--stills')) { const sd = get('--out') || path.join(dir, 'stills'); fs.mkdirSync(sd, { recursive: true });
    for (const s of get('--stills').split(',')) await shot(+s, path.join(sd, `t${(+s).toFixed(2).padStart(5, '0')}.png`)); }
  else { const fps = T.fps || 30, from = +(get('--from') ?? 0), to = +(get('--to') ?? T.total); fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
    for (let f = Math.round(from * fps); f < Math.round(to * fps); f++) await shot(f / fps, path.join(dir, 'frames', `f${String(f).padStart(5, '0')}.png`)); }
} finally { if (errs.length) console.error('PAGE ERRORS:\n' + errs.join('\n')); await b.close(); fs.unlinkSync(built); }
