// node render.mjs [--stills 1,5,9] [--from 0 --to 45.5]
import { createRequire } from 'module'; const { chromium } = createRequire(process.execPath)('playwright');
import fs from 'fs'; import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const T = JSON.parse(fs.readFileSync(path.join(dir,'timing.json'),'utf8'));
const html = fs.readFileSync(path.join(dir,'index.html'),'utf8').replace('__TIMING__', JSON.stringify(T));
fs.writeFileSync(path.join(dir,'_built_'+process.pid+'.html'), html);
const args = process.argv.slice(2); const get = k => { const i=args.indexOf(k); return i>=0?args[i+1]:null; };
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1080,height:1920} });
const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('file://'+path.join(dir,'_built_'+process.pid+'.html')); await p.evaluate(()=>document.fonts.ready);
const shot = async (t, file) => { const d = await p.evaluate(t=>{ renderAt(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  fs.writeFileSync(file, Buffer.from(d.split(',')[1],'base64')); };
if (get('--stills')) { const sd=get('--out')||path.join(dir,'stills'); fs.mkdirSync(sd,{recursive:true});
  for (const s of get('--stills').split(',')) await shot(+s, path.join(sd,`t${String(s).padStart(5,'0')}.png`)); }
else { const fps=T.fps, from=+(get('--from')??0), to=+(get('--to')??T.total); fs.mkdirSync(path.join(dir,'frames'),{recursive:true});
  for (let f=Math.round(from*fps); f<Math.round(to*fps); f++) await shot(f/fps, path.join(dir,'frames',`f${String(f).padStart(5,'0')}.png`)); }
if (errs.length) console.error('PAGE ERRORS:\n'+errs.join('\n'));
await b.close(); fs.unlinkSync(path.join(dir,'_built_'+process.pid+'.html'));
