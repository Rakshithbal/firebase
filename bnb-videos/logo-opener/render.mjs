// node render.mjs <w> <h> <outdir> [--stills 0.3,0.7,1.0,1.4,1.9]
import { createRequire } from 'module'; const { chromium } = createRequire(process.execPath)('playwright');
import fs from 'fs'; import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const [w, h, out] = process.argv.slice(2); const si = process.argv.indexOf('--stills');
const FPS = +(process.env.FPS||30), DUR = 2.0;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(`file://${dir}/${process.env.PAGE||'index.html'}?w=${w}&h=${h}`); await p.evaluate(() => window.ready);
fs.mkdirSync(out, { recursive: true });
const shot = async (t, f) => { await p.evaluate(t => renderAt(t), t); await p.screenshot({ path: f, clip: { x: 0, y: 0, width: +w, height: +h } }); };
if (si > 0) { for (const s of process.argv[si + 1].split(',')) await shot(+s, `${out}/t${s}.png`); }
else for (let f = 0; f < FPS * DUR; f++) await shot(f / FPS, `${out}/f${String(f).padStart(4, '0')}.png`);
await b.close();
