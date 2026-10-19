const C=await(await fetch('./cues.json')).json();await Promise.all([document.fonts.load('500 30px Harmony'),document.fonts.load('600 100px DM')]);
const ctx=document.querySelector('canvas').getContext('2d'),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},mix=(a,b,u)=>a+(b-a)*u;
const DROP=[[-110,0],[-110,-85,-25,-110,45,-70],[82,-48,120,-15,145,-5],[148,-3,150,-1,152,0],[148,2,135,9,123,18],[35,90,-110,115,-110,0]];
const FISH=[[-90,0],[-45,-57,10,-79,80,-58],[110,-50,125,-28,140,-12],[145,-8,148,-3,150,0],[145,8,137,17,130,24],[85,86,-36,73,-90,0]];
const BIRD=[[-90,12],[-40,-3,24,-16,62,-42],[87,-72,118,-69,132,-45],[145,-39,159,-36,171,-30],[151,-26,144,-24,131,-23],[115,21,31,55,-90,12]];
const LEAF=[[-130,15],[-75,-57,15,-85,83,-54],[117,-42,142,-27,158,-19],[163,-17,168,-16,173,-15],[166,-10,151,0,130,15],[45,88,-67,102,-130,15]];
const tailA=[[-78,-12],[-105,-28,-135,-72,-175,-78],[-169,-43,-150,-15,-138,0],[-150,15,-169,43,-175,78],[-135,72,-105,28,-78,12],[-85,5,-85,-5,-78,-12]];
const tailB=[[-76,7],[-105,-1,-148,-12,-182,-23],[-165,-5,-152,5,-140,10],[-154,13,-173,18,-185,25],[-143,32,-106,30,-76,22],[-80,17,-80,12,-76,7]];
const finA=[[-43,-38],[-45,-58,-32,-92,-5,-110],[8,-97,27,-67,40,-42],[18,-43,-10,-42,-43,-38]];
const finB=[[-43,-12],[-75,-48,-103,-108,-111,-145],[-48,-140,4,-67,40,0],[14,17,-13,12,-43,-12]];
const farWing=[[8,-18],[30,-79,-10,-147,-48,-175],[-60,-105,-30,-51,-16,-4],[-3,2,4,-7,8,-18]];
function path(a,b,u){ctx.beginPath();ctx.moveTo(mix(a[0][0],b[0][0],u),mix(a[0][1],b[0][1],u));for(let k=1;k<a.length;k++){const v=a[k].map((n,i)=>mix(n,b[k][i],u));ctx.bezierCurveTo(...v);}ctx.closePath();ctx.fill();}
const morph=(i,t)=>ease((t-C.morphs[i].start)/(C.morphs[i].end-C.morphs[i].start));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),color=(a,b,u)=>{a=rgb(a);b=rgb(b);return `rgb(${a.map((n,i)=>mix(n,b[i],u))})`;};
const keys=[[0,550,350],[1.2,650,500],[2.8,850,590],[4.4,1110,520],[5.9,1270,390],[7.4,1330,410],[8.8,1160,520],[10.4,910,585],[11.5,875,490],[12.7,960,340],[14,960,340]];
function travel(t){let k=0;while(k<keys.length-2&&t>keys[k+1][0])k++;const a=keys[k],b=keys[k+1],u=clamp((t-a[0])/(b[0]-a[0])),dt=b[0]-a[0];return [1,2].map(j=>{const prev=keys[Math.max(0,k-1)],next=keys[Math.min(keys.length-1,k+2)];const ma=(k===0||k>=keys.length-2)?0:(b[j]-prev[j])/(b[0]-prev[0]),mb=k+1>=keys.length-2?0:(next[j]-a[j])/(next[0]-a[0]);return(2*u**3-3*u*u+1)*a[j]+(u**3-2*u*u+u)*dt*ma+(-2*u**3+3*u*u)*b[j]+(u**3-u*u)*dt*mb;});}
function pose(t){const a=morph(0,t),b=morph(1,t),c=morph(2,t),d=morph(3,t);const [x,y]=travel(t);let angle=mix(-Math.PI/2,-.04,a);angle=mix(angle,-.25,b);angle=mix(angle,.5,c);angle=mix(angle,-Math.PI/2,d);angle+=.08*Math.sin((t-7.4)*3)*c*(1-d);return{x,y,angle,a,b,c,d};}
function anchored(scale,x,y,rotation,fn){if(scale<.0001)return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);ctx.translate(-x,-y);fn();ctx.restore();}
function draw(t){const p=pose(t),{a,b,c,d}=p;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;const gradient=ctx.createLinearGradient(0,1080,1920,0);gradient.addColorStop(0,'#15384e');gradient.addColorStop(1,'#386d76');ctx.fillStyle=gradient;ctx.fillRect(0,0,1920,1080);
// Quiet atmosphere; main motion and morphology carry the story.
ctx.strokeStyle='#d2ded0';ctx.lineWidth=1.5;ctx.globalAlpha=.08;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(180,760+i*40);ctx.bezierCurveTo(650,800+i*10,1120,340+i*50,1730,440+i*70);ctx.stroke();}ctx.globalAlpha=1;
ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(1.25,1.25);
const unfold=ease((t-3.7)/2),growth=ease((t-4.05)/1.55),fold=1-ease((t-6.85)/1.4),flapGate=ease((t-5.1)/.6)*(1-ease((t-6.7)/.7)),phase=(t-5)*5;
ctx.fillStyle='#c58c50';anchored(growth*fold,-8,-18,.08*Math.sin(phase+.18)*flapGate,()=>path(farWing,farWing,0));
let bodyColor=color('#8dd5dc','#fff0d3',a);if(c>0)bodyColor=color('#fff0d3','#e8b76b',c);if(d>0)bodyColor=color('#e8b76b','#8dd5dc',d);ctx.fillStyle=bodyColor;
anchored(ease((t-1.55)/1)*(1-ease((t-6.95)/1.25)),-78,10,.08*Math.sin(t*7)*(1-b),()=>path(tailA,tailB,b));
if(t<C.morphs[0].end)path(DROP,FISH,a);else if(t<C.morphs[1].end)path(FISH,BIRD,b);else if(t<C.morphs[2].end)path(BIRD,LEAF,c);else path(LEAF,DROP,d);
const eye=ease((t-1.75)/.8)*(1-ease((t-6.8)/1));ctx.fillStyle='#15384e';ctx.globalAlpha=eye;ctx.beginPath();ctx.arc(mix(104,111,b),mix(-13,-45,b),6.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
ctx.fillStyle=color('#f0bb78','#e8b76b',c);anchored(ease((t-1.5)/1)*fold,-12,-18,.09*Math.sin(phase)*flapGate,()=>path(finA,finB,unfold));
const leafDetail=ease((t-7.6)/1)*(1-ease((t-9.5)/1));ctx.strokeStyle='#8e663b';ctx.lineWidth=3;ctx.globalAlpha=leafDetail;
ctx.beginPath();ctx.moveTo(-176,35);ctx.quadraticCurveTo(-15,-9,155,-15);ctx.stroke();for(let i=0;i<4;i++){const x=-70+i*45;ctx.beginPath();ctx.moveTo(x,8-i*4);ctx.quadraticCurveTo(x+15,-20,x+10,-42-i*2);ctx.moveTo(x,8-i*4);ctx.quadraticCurveTo(x+23,32,x+12,45-i*3);ctx.stroke();}ctx.globalAlpha=1;
ctx.restore();
const title=ease((t-C.title)/.8);ctx.globalAlpha=title;ctx.fillStyle='#fff0d3';ctx.textAlign='center';ctx.font='600 96px DM';ctx.fillText('WANDER',960,680+15*(1-title));ctx.font='500 35px Harmony';ctx.fillText('一滴，游过万象。',960,759);ctx.font='500 22px Harmony';ctx.globalAlpha=title*.65;ctx.fillText('生长、飞翔、飘落，再次出发。',960,815);ctx.textAlign='left';ctx.globalAlpha=1;
}
window.DEMO={width:1920,height:1080,fps:30,duration:C.duration,motionBlur:{samples:4,shutter:.5}};window.renderAt=draw;window.sequencePose=pose;draw(0);window.__ready=true;
