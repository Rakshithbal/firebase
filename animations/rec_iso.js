const {chromium}=require('playwright');const fs=require('fs');
const out=process.argv[2]||__dirname+'/f_iso',dur=+(process.argv[3]||13),fps=30,only=process.argv[4];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/isometric.html');fs.mkdirSync(out,{recursive:true});
const ts=only?only.split(',').map(Number):Array.from({length:dur*fps},(_,i)=>i/fps);
let n=0;for(const t of ts){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${out}/${String(n++).padStart(5,'0')}.png`});}
await b.close();console.log('frames',n,errs)})();
