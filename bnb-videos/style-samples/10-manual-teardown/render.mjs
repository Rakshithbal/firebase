// node render.mjs <url> <outdir> [--stills 0.3,1.0,...]  |  frames 0..5 s at 30 fps as JPG
import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
import fs from 'fs';
const [url, out] = process.argv.slice(2); const si = process.argv.indexOf('--stills');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url); await p.waitForFunction(() => window.ready, null, { timeout: 60000 });
fs.mkdirSync(out, { recursive: true });
const shot = async (t, f) => { await p.evaluate(t => renderAt(t), t); await p.locator('#c').screenshot({ path: f, type: 'jpeg', quality: 93 }); };
if (si > 0) for (const s of process.argv[si + 1].split(',')) await shot(+s, `${out}/t${s}.jpg`);
else for (let f = 0; f < 150; f++) await shot(f / 30, `${out}/f${String(f).padStart(4, '0')}.jpg`);
if (errs.length) console.error(errs.join('\n')); await b.close();
