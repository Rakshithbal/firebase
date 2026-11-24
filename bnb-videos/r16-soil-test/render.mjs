// node render.mjs [--stills 1,5,9 --out dir] [--from 0 --to 45.5]   (NODE_PATH=$(npm root -g))
// Pure renderAt(t) in index.html; frames saved as JPG (q92) into $FRAMES (default frames_michael).
import { createRequire } from 'module'; const { chromium } = createRequire(process.execPath)('playwright');
import fs from 'fs'; import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const T = JSON.parse(fs.readFileSync(path.join(dir, process.env.TIMING || 'timing_michael.json'), 'utf8'));
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, '..', 'brand', f)).toString('base64');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('__TIMING__', JSON.stringify(T))
  .replace('__MARK__', b64('bnb_mark_white.png')).replace('__LOGO__', b64('bnb_logo_white.png'));
const FR = process.env.FRAMES || 'frames_michael';
const built = path.join(dir, '_built_' + process.pid + '.html'); fs.writeFileSync(built, html);
const args = process.argv.slice(2); const get = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + built); await p.evaluate(() => window.READY);
const shot = async (t, file) => { const d = await p.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, t);
  fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64')); };
try {
  if (get('--stills')) { const sd = get('--out') || path.join(dir, 'stills'); fs.mkdirSync(sd, { recursive: true });
    for (const s of get('--stills').split(',')) await shot(+s, path.join(sd, `t${(+s).toFixed(2).padStart(5, '0')}.jpg`)); }
  else { const fps = T.fps, from = +(get('--from') ?? 0), to = +(get('--to') ?? T.total); fs.mkdirSync(path.join(dir, FR), { recursive: true });
    for (let f = Math.round(from * fps); f < Math.round(to * fps); f++) await shot(f / fps, path.join(dir, FR, `f${String(f).padStart(5, '0')}.jpg`)); }
} finally {
  if (errs.length) console.error('PAGE ERRORS:\n' + errs.join('\n'));
  await b.close(); fs.unlinkSync(built);
}
