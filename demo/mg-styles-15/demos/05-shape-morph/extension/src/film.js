const cues=await(await fetch('./cues.json')).json();await Promise.all([document.fonts.load('500 36px Harmony'),document.fonts.load('600 100px DM')]);
const paper=new Image();paper.src='/source/assets/textures/paper/Paper001_4K_color.jpg';await paper.decode();
const ctx=document.querySelector('canvas').getContext('2d');const N=256;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},mix=(a,b,u)=>a+(b-a)*u;
const paths=[
 'M0 -205 C-30 -145 -143 -40 -143 55 C-143 230 143 230 143 55 C143 -40 30 -145 0 -205 Z',
 'M185 0 C100 -115 -35 -100 -83 -36 L-195 -100 L-163 0 L-195 100 L-83 36 C-35 100 100 115 185 0 Z',
 'M0 45 C-65 -8 -150 -100 -235 -70 C-177 -164 -70 -166 0 -40 C70 -166 177 -164 235 -70 C150 -100 65 -8 0 45 Z',
 Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?88:205;return `${i?'L':'M'}${r*Math.cos(a)} ${r*Math.sin(a)}`}).join(' ')+' Z'
];
function sample(d){const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);document.querySelector('svg').append(el);const len=el.getTotalLength();let p=Array.from({length:N},(_,i)=>{const v=el.getPointAtLength(i*len/N);return [v.x,v.y]});let area=p.reduce((s,v,i)=>s+v[0]*p[(i+1)%N][1]-v[1]*p[(i+1)%N][0],0);if(area<0)p.reverse();return p;}
function align(a,b){let best=Infinity,shift=0;for(let k=0;k<N;k++){let score=0;for(let i=0;i<N;i++){const v=b[(i+k)%N];score+=(a[i][0]-v[0])**2+(a[i][1]-v[1])**2;}if(score<best){best=score;shift=k;}}return b.map((_,i)=>b[(i+shift)%N]);}
const shapes=paths.map(sample);for(let i=1;i<shapes.length;i++)shapes[i]=align(shapes[i-1],shapes[i]);
const bg=['#f3ebdd','#2b4bd8','#427ec0','#18253e'],ink=['#2b4bd8','#fff3d6','#fff3d6','#efbe65'];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),colour=(a,b,u)=>{a=rgb(a);b=rgb(b);return `rgb(${a.map((v,i)=>mix(v,b[i],u)).join(',')})`;};
const labels=['一滴 / A DROP','游动 / SWIM','飞翔 / FLY','闪耀 / SHINE'];
function state(t){let index=0;for(let i=0;i<3;i++){const c=cues.morphs[i];if(t<c.start)return {a:i,b:i,u:0,q:0};if(t<c.end){const q=clamp((t-c.start)/(c.end-c.start));return{a:i,b:i+1,u:ease(q),q};}index=i+1;}return{a:index,b:index,u:0,q:0};}
function draw(t){const st=state(t),u=st.u;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle=colour(bg[st.a],bg[st.b],u);ctx.fillRect(0,0,1920,1080);ctx.globalAlpha=.065;ctx.globalCompositeOperation='multiply';ctx.drawImage(paper,0,0,1920,1080);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
const settle=ease((t-cues.title)/1.1),x=960+Math.sin(t*1.2)*35*(1-settle),y=mix(520,310,settle)-170*(1-ease(t/1.1));let scale=mix(1.15,.63,settle)*(1-.1*Math.sin(Math.PI*st.q));
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(st.a===3)ctx.rotate(.06*Math.sin((t-7.3)*1.5));
ctx.fillStyle=colour(ink[st.a],ink[st.b],u);ctx.beginPath();for(let i=0;i<N;i++){let px=mix(shapes[st.a][i][0],shapes[st.b][i][0],u),py=mix(shapes[st.a][i][1],shapes[st.b][i][1],u);if(st.a===2&&st.b===2)py*=1+.08*Math.sin((t-5.1)*7)*ease((t-5.1)/.25)*(1-ease((t-5.9)/.3));i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();
// Semantic accents fade out before changing topology, then reappear on the next settled form.
const fish=st.a===1&&st.b===1?1:st.b===1?ease((u-.82)/.18):st.a===1?1-ease(u/.18):0;
if(fish>0){ctx.globalAlpha=fish;ctx.fillStyle='#2b4bd8';ctx.beginPath();ctx.arc(110,-13,9,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
ctx.restore();
if(t<1.8){ctx.strokeStyle='#2b4bd8';ctx.globalAlpha=.25*ease((t-.7)/.3);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,780,110+40*ease((t-.8)/.8),10,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
if(t>7.3){const a=ease((t-7.3)/.4)*(1-.5*settle);ctx.strokeStyle='#efbe65';ctx.lineWidth=3;ctx.globalAlpha=a;for(let k=0;k<8;k++){const ang=k*Math.PI/4+.2,r=205*scale+25;ctx.beginPath();ctx.moveTo(x+Math.cos(ang)*r,y+Math.sin(ang)*r);ctx.lineTo(x+Math.cos(ang)*(r+22),y+Math.sin(ang)*(r+22));ctx.stroke();}ctx.globalAlpha=1;}
ctx.fillStyle=st.a<1?'#252c43':'#fff3d6';ctx.globalAlpha=.8*(1-settle);ctx.font='500 25px Harmony';ctx.fillText(labels[u>.5?st.b:st.a],105,968);ctx.font='500 20px DM';ctx.fillText('SHAPE STUDY / 05',1550,968);ctx.globalAlpha=1;
const title=ease((t-cues.title)/.6);ctx.globalAlpha=title;ctx.fillStyle='#fff3d6';ctx.textAlign='center';ctx.font='600 106px DM';ctx.fillText('WANDER',960,650+18*(1-title));ctx.font='500 36px Harmony';ctx.fillText('一滴，游向天空。',960,735);ctx.font='500 22px Harmony';ctx.globalAlpha=title*.65;ctx.fillText('让想象，改变形状。',960,800);ctx.textAlign='left';ctx.globalAlpha=1;
}
window.DEMO={width:1920,height:1080,fps:30,duration:10,motionBlur:{samples:4,shutter:.5}};window.renderAt=draw;window.morphState=state;window.morphPolygon=t=>{const s=state(t);return shapes[s.a].map((p,i)=>[mix(p[0],shapes[s.b][i][0],s.u),mix(p[1],shapes[s.b][i][1],s.u)]);};draw(0);window.__ready=true;
