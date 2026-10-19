// Check that revisiting a timestamp after arbitrary seeks produces identical pixels.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const caseName=process.argv[2]||'01-flat-vector';
if(!['01-flat-vector','02-isometric','02-isometric-chip','03-line-art','04-3d-render','05-shape-morph'].includes(caseName))throw new Error('Unknown case');
const req=createRequire(path.join(root,'source/package.json'));
const {default:puppeteer}=await import(pathToFileURL(req.resolve('puppeteer-core')).href);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.ttf':'font/ttf'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){
    response.writeHead(404);response.end();return;
  }
  response.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');
  fs.createReadStream(target).pipe(response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await puppeteer.launch({executablePath:process.env.MG_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--use-angle=d3d11']});
  const page=await browser.newPage();
  await page.setViewport({width:1920,height:1080});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/demos/${caseName}/extension/${caseName==='04-3d-render'?'motion-preview':'src'}/index.html`);
  await page.waitForFunction('window.__ready === true',{timeout:30000});
  if(caseName==='04-3d-render'){
    const ref=JSON.parse(fs.readFileSync(path.join(root,'demos/04-3d-render/extension/checks/wave-reference.json')));
    const actual=await page.evaluate(ref=>({count:window.waveCellCount,heights:ref.samples.map(s=>window.waveHeight(s.r,s.t))}),ref);
    if(actual.count!==ref.count || actual.heights.some((h,i)=>Math.abs(h-ref.samples[i].height)>1e-10))throw new Error('Browser/Blender wave model mismatch');
    console.log('Browser/Python radial model parity verified at 35 samples.');
  }
  if(caseName==='05-shape-morph'){
    const geometry=await page.evaluate(()=>{
      const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let intersections=0,minArea=Infinity;
      for(const start of [1.8,4,6.2])for(let k=0;k<=20;k++){
        const p=window.morphPolygon(start+1.1*k/20),n=p.length;
        minArea=Math.min(minArea,Math.abs(p.reduce((a,v,i)=>a+v[0]*p[(i+1)%n][1]-v[1]*p[(i+1)%n][0],0))/2);
        for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){
          if(i===0&&j===n-1)continue;
          const a=p[i],b=p[(i+1)%n],c=p[j],d=p[(j+1)%n];
          if(cross(a,b,c)*cross(a,b,d)<-1e-7&&cross(c,d,a)*cross(c,d,b)<-1e-7)intersections++;
        }
      }return{intersections,minArea};
    });
    if(geometry.intersections||geometry.minArea<5000)throw new Error(JSON.stringify(geometry));
    fs.writeFileSync(path.join(root,'demos/05-shape-morph/extension/checks/morph-geometry.json'),JSON.stringify(geometry,null,2));
    console.log('Morph contours checked: no sampled self-intersections or area collapse.');
  }
  const frames={};
  const revisit=caseName==='02-isometric-chip'?[8.5,15.5]:caseName==='04-3d-render'?[2.6,4.2]:[3.5,8.5];
  for(const t of [...revisit,.5,9.5,...revisit]){
    await page.evaluate(t=>window.renderAt(t),t);
    const hash=createHash('sha256').update(await page.screenshot()).digest('hex');
    if(frames[t]&&frames[t]!==hash)throw new Error(`Non-deterministic frame at ${t}`);
    frames[t]=hash;
  }
  if(errors.length)throw new Error(errors.join('\n'));
  const report={passed:true,revisitedTimes:revisit,frameHashes:frames,pageErrors:errors};
  fs.writeFileSync(path.join(root,`demos/${caseName}/extension/checks/seeking.json`),JSON.stringify(report,null,2));
  console.log(`Random-access rendering verified at ${revisit.join('s and ')}s; no page errors.`);
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
