const C = await (await fetch('./cues.json')).json();
await Promise.all([document.fonts.load('500 24px Harmony'), document.fonts.load('600 96px DM')]);
const paper = new Image(); paper.src = '/source/assets/textures/paper/Paper001_4K_color.jpg'; await paper.decode();
const ctx = document.querySelector('canvas').getContext('2d'), N = 256;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
const lerp = (a,b,u) => a+(b-a)*u;

const formPaths = [
  'M0 -205 C-30 -145 -143 -40 -143 55 C-143 230 143 230 143 55 C143 -40 30 -145 0 -205 Z',
  'M185 0 C100 -115 -35 -100 -83 -36 L-195 -100 L-163 0 L-195 100 L-83 36 C-35 100 100 115 185 0 Z',
  'M0 45 C-65 -8 -150 -100 -235 -70 C-177 -164 -70 -166 0 -40 C70 -166 177 -164 235 -70 C150 -100 65 -8 0 45 Z',
  'M-205 -5 L-30 -48 L10 -170 L60 -180 L48 -51 L190 0 L48 51 L60 180 L10 170 L-30 48 Z',
  'M-130 15 C-75 -57 15 -85 83 -54 C117 -42 142 -27 158 -19 C163 -17 168 -16 173 -15 C166 -10 151 0 130 15 C45 88 -67 102 -130 15 Z',
  Array.from({length:32},(_,i)=>{const a=-Math.PI/2+i*Math.PI/16,r=i%4<2?184:126;return`${i?'L':'M'}${r*Math.cos(a)} ${r*Math.sin(a)}`}).join(' ')+' Z',
  Array.from({length:48},(_,i)=>{const a=-Math.PI/2+i*Math.PI/24,r=i%2?151:184;return`${i?'L':'M'}${r*Math.cos(a)} ${r*Math.sin(a)}`}).join(' ')+' Z',
  'M0 -190 C25 -155 55 -110 94 -86 C140 -60 174 -18 150 28 C130 70 62 105 0 165 C-62 105 -130 70 -150 28 C-174 -18 -140 -60 -94 -86 C-55 -110 -25 -155 0 -190 Z',
  'M0 -205 C-30 -145 -143 -40 -143 55 C-143 230 143 230 143 55 C143 -40 30 -145 0 -205 Z'
];
function samplePath(d){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);document.querySelector('svg').append(p);const len=p.getTotalLength();let q=Array.from({length:N},(_,i)=>{const v=p.getPointAtLength(i*len/N);return[v.x,v.y]});const area=q.reduce((s,v,i)=>s+v[0]*q[(i+1)%N][1]-v[1]*q[(i+1)%N][0],0);if(area<0)q.reverse();return q;}
function alignStart(a,b){let best=Infinity,shift=0;for(let k=0;k<N;k++){let score=0;for(let i=0;i<N;i++){const v=b[(i+k)%N];score+=(a[i][0]-v[0])**2+(a[i][1]-v[1])**2;}if(score<best){best=score;shift=k;}}return b.map((_,i)=>b[(i+shift)%N]);}
const shapes=formPaths.map(samplePath);for(let i=1;i<shapes.length;i++)shapes[i]=alignStart(shapes[i-1],shapes[i]);
const low=['#F3EBDD','#2D4DE0','#EF644A','#173FCE','#9ABD77','#7651D5','#192842','#DF4C50','#DBEEE5'];
const high=['#E7DBC5','#506BE6','#F79467','#5C7CED','#C2D89D','#A27CE7','#364862','#F47D75','#EEF5E9'];
const fg=['#3656D7','#FFF1D4','#FFF0D3','#FFF1D4','#365C45','#FFF0D6','#F3BE59','#FFF0D6','#3158D6'];
const labels=['一滴 / DROP','游动 / FISH','飞翔 / BIRD','远行 / PLANE','生长 / LEAF','绽放 / FLOWER','闪耀 / SUN','心动 / HEART','再出发 / DROP'];
// Small stage-to-stage framing nudges: some forms hold their place, others drift a little.
const poses=[[0,0],[14,0],[14,-14],[14,-14],[-10,-14],[-10,0],[-10,0],[8,10],[0,0]];
const accent=['#ACD9D9','#A8E1DF','#FFD786','#F1CC82','#78965A','#FFD37B','#EBBE65','#FFA497','#A8D8D2'];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const color=(a,b,u)=>`rgb(${rgb(a).map((v,i)=>lerp(v,rgb(b)[i],u)).join(',')})`;
const smoothSin=(t,p=1)=>.5+.5*Math.sin(t*2*Math.PI/p);
function pose(t){let stage=0;for(let i=0;i<C.morphs.length;i++){const m=C.morphs[i];if(t<m.start)return{a:stage,b:stage,u:0,q:0,index:stage};if(t<m.end){const q=clamp((t-m.start)/(m.end-m.start));return{a:i,b:i+1,u:ease(q),q,index:i};}stage=i+1;}return{a:stage,b:stage,u:0,q:0,index:stage};}
function drawDecoration(i,w,t,x,y){if(w<=.01)return;ctx.save();ctx.globalAlpha=w;
 if(i===0||i===8){ctx.strokeStyle=fg[i];ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(x,y+112,125+k*34+12*Math.sin(t*4+k),8+k*2,0,0,2*Math.PI);ctx.stroke();}}
 if(i===1){ctx.strokeStyle=accent[i];for(let k=0;k<3;k++){const xx=((250+k*480+t*120)%1750)+80;ctx.beginPath();ctx.arc(xx,340+k%2*110,9+k*3,0,2*Math.PI);ctx.stroke();}}
 if(i===2||i===3){ctx.fillStyle=accent[i];ctx.beginPath();ctx.arc(960,210,49+5*Math.sin(t*6),0,2*Math.PI);ctx.fill();ctx.strokeStyle=accent[i];ctx.lineWidth=3;for(let k=0;k<9;k++){const a=k*2*Math.PI/9;ctx.beginPath();ctx.moveTo(960+Math.cos(a)*67,210+Math.sin(a)*67);ctx.lineTo(960+Math.cos(a)*80,210+Math.sin(a)*80);ctx.stroke();}}
 if(i===4){ctx.strokeStyle=accent[i];ctx.lineWidth=2;for(let k=0;k<5;k++){const xx=760+k*100;ctx.beginPath();ctx.moveTo(xx,260);ctx.quadraticCurveTo(xx-70,465,xx+15,670);ctx.stroke();}}
 if(i===5){ctx.fillStyle=accent[i];for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.arc(x+120*Math.cos(a),y+120*Math.sin(a),7,0,2*Math.PI);ctx.fill();}}
 if(i===6||i===7){ctx.strokeStyle=accent[i];ctx.lineWidth=2;for(let k=0;k<(i===6?2:3);k++){ctx.beginPath();ctx.arc(x,y,220+k*55+12*Math.sin(t*4+k),0,2*Math.PI);ctx.stroke();}}
 ctx.restore();}
function drawPath(a,b,u){ctx.beginPath();for(let i=0;i<N;i++){const x=lerp(a[i][0],b[i][0],u),y=lerp(a[i][1],b[i][1],u);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();}
const rearWing=new Path2D('M8 -18 C30 -79 -10 -147 -48 -175 C-60 -105 -30 -51 -16 -4 C-3 2 4 -7 8 -18 Z');
function draw(t){const s=pose(t),{a,b,u,q}=s,title=ease((t-C.title)/.55);
 ctx.setTransform(1,0,0,1,0,0);
 // Both ends of the canvas shift hue on each beat.
 const bg=ctx.createLinearGradient(0,1080,1920,0);bg.addColorStop(0,color(low[a],low[b],u));bg.addColorStop(1,color(high[a],high[b],u));ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080);
 if(t<1.45){ctx.save();ctx.globalAlpha=.065*(1-ease((t-.68)/.77));ctx.globalCompositeOperation='multiply';ctx.drawImage(paper,0,0,1920,1080);ctx.restore();}
 const px=lerp(poses[a][0],poses[b][0],u),py=lerp(poses[a][1],poses[b][1],u);
 const x=960+px+3*Math.sin(t*1.4),y=450+py+2*Math.sin(t*1.8),scale=1.02*(1-.08*Math.sin(Math.PI*q));
 drawDecoration(a,a===b?1:1-u,t,x,y);if(b!==a)drawDecoration(b,u,t,x,y);
 ctx.save();ctx.translate(x,y);ctx.rotate(lerp([-.1,0,-.08,-.03,.1,0,-.08,0,-.1][a],[-.1,0,-.08,-.03,.1,0,-.08,0,-.1][b],u));ctx.scale(scale,scale);
 const birdWeight=(a===2?1-u:0)+(b===2?u:0),farWing=ease((t-1.62)/.24)*(1-ease((t-2.62)/.2))*birdWeight;
 if(farWing>.002){ctx.save();ctx.translate(-8,-18);ctx.rotate(.05*Math.sin(t*8));ctx.scale(farWing,farWing);ctx.translate(8,18);ctx.fillStyle='#C58C50';ctx.fill(rearWing);ctx.restore();}
 ctx.fillStyle=color(fg[a],fg[b],u);drawPath(shapes[a],shapes[b],u);
 const eye=(a===1?1-u:0)+(b===1?u:0)+(a===2?1-u:0)+(b===2?u:0);if(eye>.01){ctx.globalAlpha=eye;ctx.fillStyle=color(low[a],low[b],u);ctx.beginPath();ctx.arc(lerp(104,111,u),lerp(-13,-45,u),7,0,2*Math.PI);ctx.fill();ctx.globalAlpha=1;}
 if(a===4||b===4){const leafWeight=(a===4?1-u:0)+(b===4?u:0);ctx.globalAlpha=leafWeight;ctx.strokeStyle='#65814D';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-132,17);ctx.quadraticCurveTo(0,-11,171,-16);ctx.stroke();for(let k=0;k<4;k++){const xx=-70+k*50;ctx.beginPath();ctx.moveTo(xx,4-k*4);ctx.quadraticCurveTo(xx+15,-19,xx+10,-40);ctx.moveTo(xx,4-k*4);ctx.quadraticCurveTo(xx+22,27,xx+12,43);ctx.stroke();}ctx.globalAlpha=1;}
 ctx.restore();
 const stage=u<.5?a:b;ctx.globalAlpha=.76*(1-title);ctx.fillStyle=fg[stage];ctx.font='500 24px Harmony';ctx.fillText(labels[stage],98,970);ctx.textAlign='right';ctx.font='500 18px DM';ctx.fillText('WANDER · FORM IN MOTION',1822,970);ctx.textAlign='left';ctx.globalAlpha=1;
 const progress=clamp((t-.45)/6.45)*8;for(let k=0;k<8;k++){const f=clamp(progress-k),w=27+14*ease(f);ctx.globalAlpha=.24+.76*f;ctx.fillStyle=fg[k+1];ctx.beginPath();ctx.roundRect(1570+k*30,95,w,5,3);ctx.fill();}ctx.globalAlpha=1;
 ctx.globalAlpha=title;ctx.fillStyle='#25384A';ctx.textAlign='center';ctx.font='600 96px DM';ctx.fillText('WANDER',960,786+12*(1-title));ctx.font='500 35px Harmony';ctx.fillText('一滴，万象。',960,858);ctx.font='500 21px Harmony';ctx.globalAlpha=.78*title;ctx.fillText('生长、飞翔、飘落，再次出发。',960,905);ctx.textAlign='left';ctx.globalAlpha=1;
}
window.DEMO={width:1920,height:1080,fps:30,duration:C.duration,motionBlur:{samples:4,shutter:.5}};window.renderAt=draw;draw(0);window.__ready=true;
