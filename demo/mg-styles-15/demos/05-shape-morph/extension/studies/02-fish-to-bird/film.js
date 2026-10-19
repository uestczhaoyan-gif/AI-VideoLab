await document.fonts.load('500 30px Harmony');
const ctx=document.querySelector('canvas').getContext('2d');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},lerp=(a,b,u)=>a+(b-a)*u;
// Each matching cubic has an explicit anatomical role. No perimeter-index search.
const bodyFish=[[-90,0],[-45,-57,10,-79,80,-58],[110,-50,136,-22,150,0],[135,25,112,48,80,58],[10,79,-45,57,-90,0]];
const bodyBird=[[-90,12],[-40,-3,24,-16,62,-42],[87,-72,118,-69,132,-45],[145,-39,159,-36,171,-30],[151,-26,144,-24,131,-23],[115,21,31,55,-90,12]];
// Body is parameterized with five corresponding sections, including a beak precursor.
const bodyA=[[-90,0],[-45,-57,10,-79,80,-58],[110,-50,125,-28,140,-12],[145,-8,148,-3,150,0],[145,8,137,17,130,24],[85,86,-36,73,-90,0]];
const bodyB=bodyBird;
const tailA=[[-78,-12],[-105,-28,-135,-72,-175,-78],[-169,-43,-150,-15,-138,0],[-150,15,-169,43,-175,78],[-135,72,-105,28,-78,12],[-85,5,-85,-5,-78,-12]];
const tailB=[[-76,7],[-105,-1,-148,-12,-182,-23],[-165,-5,-152,5,-140,10],[-154,13,-173,18,-185,25],[-143,32,-106,30,-76,22],[-80,17,-80,12,-76,7]];
const finA=[[-43,-38],[-45,-58,-32,-92,-5,-110],[8,-97,27,-67,40,-42],[18,-43,-10,-42,-43,-38]];
const finB=[[-43,-12],[-88,-69,-128,-151,-150,-209],[-61,-196,5,-107,48,1],[17,21,-11,16,-43,-12]];
function path(a,b,u,offsetY=0){ctx.beginPath();const start=a[0].map((v,i)=>lerp(v,b[0][i],u));ctx.moveTo(start[0],start[1]+offsetY);for(let k=1;k<a.length;k++){const v=a[k].map((n,i)=>lerp(n,b[k][i],u));ctx.bezierCurveTo(v[0],v[1]+offsetY,v[2],v[3]+offsetY,v[4],v[5]+offsetY);}ctx.closePath();ctx.fill();}
function pose(t){const u=smooth((t-1.25)/2.5),travel=smooth(t/6);return{u,x:lerp(470,1410,travel),y:610-220*smooth((t-.6)/4.8),angle:-.05-.22*smooth((t-1)/3)+.03*Math.sin(t*5)*(1-u)};}
function draw(t){const p=pose(t),u=p.u;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;const bg=ctx.createLinearGradient(0,1080,1920,0);bg.addColorStop(0,'#163a55');bg.addColorStop(1,'#356b82');ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080);
// A continuous travel path makes velocity readable, without cutting between icons.
ctx.strokeStyle='#c1d6cf';ctx.lineWidth=2;ctx.globalAlpha=.16;ctx.beginPath();ctx.moveTo(215,745);ctx.bezierCurveTo(610,745,1080,440,1640,425);ctx.stroke();ctx.globalAlpha=1;
ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(1.35,1.35);
ctx.fillStyle='#fff0d3';ctx.save();ctx.translate(-78,0);ctx.rotate(.1*Math.sin(t*8)*(1-u));ctx.translate(78,0);path(tailA,tailB,u);ctx.restore();path(bodyA,bodyB,u);
// Keep the identifying eye attached to the head throughout the transformation.
ctx.fillStyle='#163a55';ctx.beginPath();ctx.arc(lerp(104,111,u),lerp(-13,-45,u),6.5,0,Math.PI*2);ctx.fill();
// The same dorsal fin unfurls into a wing. Its base remains attached to the body.
ctx.fillStyle='#f0bb78';ctx.save();ctx.translate(-12,-18);const flap=.12*Math.sin((t-3.2)*5)*smooth((t-3.4)/.7);ctx.rotate(flap);ctx.translate(12,18);path(finA,finB,smooth((t-1.55)/2.45));ctx.restore();
// Gill retracts in place before the head's profile acquires a beak.
ctx.globalAlpha=1-smooth((t-1.4)/1.2);ctx.strokeStyle='#b99160';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(63,-27);ctx.quadraticCurveTo(78,0,63,27);ctx.stroke();ctx.restore();ctx.globalAlpha=1;
ctx.fillStyle='#e3e7d9';ctx.font='500 26px Harmony';ctx.fillText('WANDER / 关键转换研究 02',100,105);ctx.globalAlpha=.72;ctx.font='500 23px Harmony';ctx.fillText('同一个身体 · 鱼鳍展开为羽翼',100,974);ctx.textAlign='right';ctx.fillText('连续运动验证',1820,974);ctx.textAlign='left';ctx.globalAlpha=1;
}
window.DEMO={width:1920,height:1080,fps:30,duration:6,motionBlur:{samples:4,shutter:.5}};window.renderAt=draw;window.studyPose=pose;draw(0);window.__ready=true;
