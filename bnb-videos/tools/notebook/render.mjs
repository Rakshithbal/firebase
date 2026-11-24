// node tools/notebook/render.mjs <reel_dir> [--stills 1,5,9 --out dir] [--from 0 --to 10 --frames dir] [--ev ev.json]
// Builds <reel_dir>/index.html with timing.json + brand images inlined (data URLs: canvas never tainted), calls renderAt(t), saves JPG q.92.
import { createRequire } from 'module'; const { chromium } = createRequire(process.execPath)('playwright');
import fs from 'fs'; import path from 'path';
const dir = path.resolve(process.argv[2]); const args = process.argv.slice(3);
const get = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const T = JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8'));
const brand = f => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, '..', 'brand', f)).toString('base64');
const built = path.join(dir, `_built_${process.pid}.html`);
fs.writeFileSync(built, fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('__TIMING__', JSON.stringify(T))
  .replace('__MARK__', brand('bnb_mark_orange.png')).replace('__LOGO__', brand('bnb_logo_orange.png')));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
try {
  await p.goto('file://' + built); await p.evaluate(async () => { await document.fonts.ready; await window.ready; });
  const shot = async (t, file) => { const d = await p.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .92); }, t);
    fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64')); };
  if (get('--ev')) fs.writeFileSync(get('--ev'), JSON.stringify(await p.evaluate(() => window.EV || [])));
  else if (get('--stills')) { const sd = get('--out') || path.join(dir, 'stills'); fs.mkdirSync(sd, { recursive: true });
    for (const s of get('--stills').split(',')) await shot(+s, path.join(sd, `t${(+s).toFixed(2).padStart(5, '0')}.jpg`)); }
  else { const fps = T.fps || 30, from = +(get('--from') ?? 0), to = +(get('--to') ?? T.total), fd = path.join(dir, get('--frames') || 'frames'); fs.mkdirSync(fd, { recursive: true });
    for (let f = Math.round(from * fps); f < Math.round(to * fps); f++) await shot(f / fps, path.join(fd, `f${String(f).padStart(5, '0')}.jpg`)); }
} finally { if (errs.length) console.error('PAGE ERRORS:\n' + errs.join('\n')); await b.close(); fs.unlinkSync(built); }
