// Original VideoLab scene. Only the frame renderer, audio library and fonts are reused.
const cues = await (await fetch('./cues.json')).json();
await Promise.all([
  document.fonts.load('700 80px Rounded','微小的开始也会盛放一粒种子'),
  document.fonts.load('600 40px Fredoka','SMALL BEGINNINGS GROW')
]);
await document.fonts.ready;
const cv = document.querySelector('canvas');
const c = cv.getContext('2d');
const P = {paper:'#FFF3DE',ink:'#183E35',green:'#608D70',mint:'#B7CDB2',pink:'#EC786A',yellow:'#F2BE4D',soil:'#DFC5A3',blue:'#A7BFC4'};
const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease = v=>{v=clamp(v);return v*v*(3-2*v)};
const phase=(t,a,b)=>ease((t-a)/(b-a));
const back=v=>{v=clamp(v);return 1+2.6*(v-1)**3+1.6*(v-1)**2};
const mix=(a,b,p)=>a+(b-a)*p;
const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);c.fill()};
const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);c.fill()};
function text(s,x,y,size,color=P.ink,font='Rounded',align='left'){
  c.fillStyle=color;c.font=`${font==='Rounded'?700:500} ${size}px ${font}`;c.textAlign=align;c.fillText(s,x,y);
}
function leaf(x,y,size,side,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(side*size,size);
  c.fillStyle=P.green;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(65,-76,148,-47,175,-113);c.bezierCurveTo(166,8,75,62,0,0);c.fill();
  c.strokeStyle=P.ink;c.lineWidth=3;c.beginPath();c.moveTo(10,-1);c.quadraticCurveTo(73,-3,147,-76);c.stroke();c.restore();
}
function stem(x,base,height,p,t,width=13){
  const sway=Math.sin(t*1.8+x*.008)*10*p;
  c.strokeStyle=P.ink;c.lineWidth=width;c.lineCap='round';c.beginPath();
  c.moveTo(x,base);c.bezierCurveTo(x-35*p,base-height*p*.35,x+40*p+sway,base-height*p*.7,x+sway,base-height*p);c.stroke();
  return [x+sway,base-height*p];
}
function flower(x,y,r,p,t,color=P.yellow,petals=10){
  if(p<=0)return;
  c.save();c.translate(x,y);c.rotate(Math.sin(t*1.2)*.025);
  for(let i=0;i<petals;i++){
    const a=i/ petals*Math.PI*2;
    const q=back(clamp((p-i*.023)/.76));
    c.save();c.rotate(a);c.translate(0,-r*.63*q);c.rotate(Math.sin(t*1.7+i)*.018);
    ellipse(0,0,r*.31*q,r*.66*q,color);c.restore();
  }
  const core=back(clamp(p*1.8));circle(0,0,r*.39*core,P.ink);
  for(let i=0;i<13;i++){
    const a=i*2.399;const rr=Math.sqrt(i/13)*r*.27*core;
    circle(Math.cos(a)*rr,Math.sin(a)*rr,r*.025*core,P.paper);
  }
  c.restore();
}
function ground(t){
  c.fillStyle=P.soil;c.beginPath();c.moveTo(0,845);c.bezierCurveTo(390,795,650,862,960,831);c.bezierCurveTo(1300,803,1580,845,1920,803);c.lineTo(1920,1080);c.lineTo(0,1080);c.closePath();c.fill();
  c.strokeStyle=P.paper;c.lineWidth=3;
  for(let i=0;i<34;i++){
    const x=70+(i*173)%1810,y=882+(i*47)%123;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+10+(i%3)*8,y);c.stroke();
  }
  const ripple=clamp((t-cues.seedLand)/.65);
  if(ripple>0&&ripple<1){c.save();c.globalAlpha=1-ripple;c.strokeStyle=P.ink;c.lineWidth=4;c.beginPath();c.ellipse(960,832,30+ripple*135,8+ripple*15,0,0,Math.PI*2);c.stroke();c.restore();}
}
function seed(t){
  const fall=clamp(t/cues.seedLand);
  let y=mix(-60,815,fall*fall);
  if(t>cues.seedLand)y-=Math.abs(Math.sin((t-cues.seedLand)*9))*55*Math.exp(-(t-cues.seedLand)*6);
  const disappear=1-phase(t,1.25,1.75);
  const squish=1+.35*Math.exp(-(((t-.82)/.10)**2));
  c.save();c.translate(960,y);c.rotate(-.3+Math.sin(t*6)*.05);c.scale(squish*disappear,disappear/squish);
  c.fillStyle=P.ink;c.beginPath();c.moveTo(0,-37);c.bezierCurveTo(47,-11,39,26,0,37);c.bezierCurveTo(-27,25,-32,-9,0,-37);c.fill();
  c.strokeStyle=P.yellow;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(1,-23);c.quadraticCurveTo(14,1,0,23);c.stroke();c.restore();
}
const garden=[
  {x:250,h:235,r:61,color:P.pink},
  {x:435,h:358,r:90,color:P.yellow},
  {x:666,h:210,r:61,color:P.blue},
  {x:1245,h:275,r:74,color:P.pink},
  {x:1470,h:373,r:84,color:P.blue},
  {x:1695,h:220,r:61,color:P.yellow},
].map((f,i)=>({...f,s:cues.gardenTimes[i]}));
function smallPlant(f,t){
  const g=phase(t,f.s,f.s+.6);
  if(!g)return;
  const base=840+Math.sin(f.x)*6;
  const top=stem(f.x,base,f.h,g,t,8);
  leaf(f.x,base-f.h*.33*g,.43*back(clamp((t-f.s-.1)/.5)),-1,-.18);
  leaf(f.x,base-f.h*.5*g,.34*back(clamp((t-f.s-.2)/.5)),1,.12);
  flower(...top,f.r,clamp((t-f.s-.25)/.9),t,f.color,8);
}
function pollen(t){
  const onset=phase(t,4.2,5.4)*(1-phase(t,7.5,8.2));
  for(let i=0;i<15;i++){
    const a=i*2.399,r=145+(t-4.2)*42+i%4*11;
    const x=960+Math.cos(a)*r,y=412+Math.sin(a)*r*.65-(t-4.2)*10;
    c.save();c.globalAlpha=onset*.7;circle(x,y,3+i%3,i%2?P.pink:P.yellow);c.restore();
  }
}
function accents(t){
  c.save();c.globalAlpha=.55;circle(1620,205,61,P.yellow);
  for(let i=0;i<8;i++){c.save();c.translate(1620,205);c.rotate(i*Math.PI/4+t*.02);c.strokeStyle=P.yellow;c.lineWidth=5;c.beginPath();c.moveTo(0,79);c.lineTo(0,91);c.stroke();c.restore()}
  c.restore();
  c.save();c.globalAlpha=1-phase(t,7.5,8.3);
  text('GROW',125,94,29,P.ink,'Fredoka');text('FIELD NOTES / 01',1790,94,23,P.ink,'Fredoka','right');
  c.strokeStyle=P.ink;c.lineWidth=1;c.beginPath();c.moveTo(125,112);c.lineTo(1790,112);c.stroke();c.restore();
}
function draw(t){
  c.clearRect(0,0,1920,1080);c.fillStyle=P.paper;c.fillRect(0,0,1920,1080);
  accents(t);
  const intro=(1-phase(t,2.1,2.8))*phase(t,.1,.6);
  c.save();c.globalAlpha=intro;text('从一粒种子开始',125,247,72);text('Every garden begins somewhere.',130,299,31,P.green,'Fredoka');c.restore();
  const zoom=mix(1.65,1,phase(t,1.2,7));
  const focusY=t<cues.seedLand
    ? Math.max(290,mix(-60,815,(t/cues.seedLand)**2)-80)
    : mix(735,540,phase(t,cues.seedLand,6.5));
  c.save();c.translate(960,540);c.scale(zoom,zoom);c.translate(-960,-focusY);
  ground(t);
  for(const f of garden)smallPlant(f,t);
  const g=phase(t,cues.sproutStart,cues.stemReady);
  if(g>0){
    const [x,y]=stem(960,837,400,g,t,15);
    leaf(956,837-170*g,.95*back(clamp((t-cues.leafTimes[0])/.9)),-1,-.08+Math.sin(t*1.3)*.025);
    leaf(969,837-285*g,.79*back(clamp((t-cues.leafTimes[1])/.9)),1,.04+Math.sin(t*1.6)*.03);
    const bud=phase(t,3.25,3.8)*(1-phase(t,4.0,4.5));
    if(bud>0){ellipse(x,y,25*bud,38*bud,P.ink);ellipse(x+3,y-7,11*bud,24*bud,P.green)}
    flower(x,y,144,clamp((t-cues.bloomStart)/(cues.bloomReady-cues.bloomStart)),t);
  }
  seed(t);pollen(t);c.restore();
  const reveal=phase(t,cues.titleStart,cues.endHold);
  c.save();c.globalAlpha=reveal;
  text('微小的开始，也会盛放。',960,170+(1-reveal)*25,77,P.ink,'Rounded','center');
  text('SMALL BEGINNINGS. WILD POSSIBILITIES.',960,227+(1-reveal)*18,27,P.green,'Fredoka','center');
  text('G R O W',960,975,34,P.ink,'Fredoka','center');c.restore();
}
window.DEMO={width:1920,height:1080,fps:30,duration:cues.duration,motionBlur:{samples:1,shutter:.5}};
window.renderAt=draw;
draw(0);window.__ready=true;
