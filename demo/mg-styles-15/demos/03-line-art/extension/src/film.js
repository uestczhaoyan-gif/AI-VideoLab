const cues=await(await fetch('./cues.json')).json();
await Promise.all([document.fonts.load('500 58px Cormorant'),document.fonts.load('300 38px NotoSerif','归途越过山河总有一盏光等你')]);
const grain=new Image();grain.src='/source/assets/textures/grain/grain_fine_2048.png';await grain.decode();
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
let endpoint=[70,690],total=0;const pts=[],pieces=[];
for(const def of cues.pieces){const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',(def.d.startsWith('M')?'':`M${endpoint[0]} ${endpoint[1]} `)+def.d);document.querySelector('#geometry').append(el);const len=el.getTotalLength(),startIndex=pts.length;for(let i=0,n=Math.ceil(len/1.5);i<=n;i++){const p=el.getPointAtLength(len*i/n);pts.push([p.x,p.y,total+len*i/n]);}pieces.push({...def,offset:total,len,startIndex});total+=len;endpoint=pts.at(-1);}
function distance(t){for(const p of pieces){if(t<p.end){const q=clamp((t-p.start)/(p.end-p.start));return p.offset+p.len*(.25*q+.75*ease(q));}}return total;}
function point(s){let lo=0,hi=pts.length-1;while(lo<hi){const m=(lo+hi)>>1;if(pts[m][2]<s)lo=m+1;else hi=m;}return pts[lo];}
function camera(t){const keys=[[0,300,575,1.5],[2.3,520,560,1.4],[4.1,850,650,1.32],[6.1,1160,575,1.28],[7.5,1500,440,1.32],[9.5,960,540,.94],[12,960,540,.94]];let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=ease((t-a[0])/(b[0]-a[0]));return{x:mix(a[1],b[1],u),y:mix(a[2],b[2],u),z:mix(a[3],b[3],u)};}
const house=new Path2D('M1420 645 L1420 435 L1530 305 L1640 435 L1640 645 L1572 645 L1572 500 C1572 444 1488 444 1488 500 L1488 645 Z');
function stroke(s){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts){if(p[2]>s)break;ctx.lineTo(p[0],p[1]);}}
function spaced(text,y,size,gap,font){ctx.font=`500 ${size}px ${font}`;const chars=[...text],widths=chars.map(c=>ctx.measureText(c).width);let x=(1920-widths.reduce((a,b)=>a+b,0)-gap*(chars.length-1))/2;for(let i=0;i<chars.length;i++){ctx.fillText(chars[i],x,y);x+=widths[i]+gap;}}
function render(t){const cam=camera(t),s=distance(t+.08),tip=point(s);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.setTransform(1,0,0,1,0,0);const bg=ctx.createRadialGradient(1050,430,80,960,540,1150);bg.addColorStop(0,'#182b3b');bg.addColorStop(1,'#070e17');ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080);
ctx.save();ctx.translate(960,540);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);ctx.lineCap=ctx.lineJoin='round';
const fill=ease((t-cues.fill)/.9);if(fill>0){ctx.save();ctx.clip(house);const gold=ctx.createLinearGradient(1370,300,1670,650);gold.addColorStop(0,'#fff1b9');gold.addColorStop(.35,'#d7ad62');gold.addColorStop(.6,'#f0d997');gold.addColorStop(1,'#b88741');ctx.fillStyle=gold;ctx.fillRect(1340,660-410*fill,390,410*fill);ctx.restore();}
stroke(s);ctx.lineWidth=3/cam.z;ctx.strokeStyle='#dac68c';ctx.shadowColor='#eacf85';ctx.shadowBlur=8;ctx.globalAlpha=.32;ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=.95;ctx.lineWidth=2.25/cam.z;ctx.stroke();
if(t<8.3){const light=ctx.createRadialGradient(tip[0],tip[1],0,tip[0],tip[1],15/cam.z);light.addColorStop(0,'#fff9df');light.addColorStop(.15,'#ead69bb0');light.addColorStop(1,'#ead69b00');ctx.fillStyle=light;ctx.fillRect(tip[0]-20/cam.z,tip[1]-20/cam.z,40/cam.z,40/cam.z);}
if(t>=cues.return&&t<cues.return+1.3){const p=point(total*(1-ease((t-cues.return)/1.3)));ctx.shadowColor='#ffeac0';ctx.shadowBlur=18;ctx.fillStyle='#fff3c7';ctx.beginPath();ctx.arc(p[0],p[1],2.4/cam.z,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
ctx.restore();ctx.globalAlpha=.035;ctx.drawImage(grain,0,0,1920,1080);ctx.globalAlpha=ease((t-cues.title)/.65);ctx.fillStyle='#e8d49e';spaced('THE WAY HOME',875,54,13,'Cormorant');spaced('归途',945,36,25,'NotoSerif');ctx.font='300 22px NotoSerif';ctx.textAlign='center';ctx.fillStyle='#afaa92';ctx.fillText('越过山河，总有一盏光等你。',960,1001);ctx.textAlign='left';ctx.globalAlpha=1;
}
window.DEMO={width:1920,height:1080,fps:30,duration:cues.duration,motionBlur:{samples:4,shutter:.5}};window.renderAt=render;window.__pathInfo={continuous:true,length:total,pieces:pieces.map(p=>({name:p.name,length:p.len,start:p.start,end:p.end}))};render(0);window.__ready=true;
