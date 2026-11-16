const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/scene.html');fs.mkdirSync(__dirname+'/f',{recursive:true});
const styles=['madhubani','ink','blueprint'],dur=5,fps=30;let n=0;
for(const s of styles)for(let i=0;i<dur*fps;i++){const local=i/fps;const t=n/fps;
 await p.evaluate(([t,s,l,d])=>render(t,s,l,d),[t,s,local,dur]);
 await p.screenshot({path:`${__dirname}/f/${String(n++).padStart(5,'0')}.png`});}
await b.close();console.log('frames',n)})();
