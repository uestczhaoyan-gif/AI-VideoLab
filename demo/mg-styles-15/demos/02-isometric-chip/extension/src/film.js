import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {Accumulator} from '/source/demos/03-isometric/js/render.js';
import {stateAt} from './state.mjs';
const c=await(await fetch('./cues.json')).json();await document.fonts.load('700 67px Harmony');
const renderer=new T.WebGLRenderer({canvas:document.querySelector('#c'),preserveDrawingBuffer:true});renderer.setSize(1920,1080);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e0e6e7');
const camera=new T.OrthographicCamera(-13.5,13.5,7.6,-7.6,.1,100);camera.position.set(13,16,19);camera.lookAt(0,1,0);
const sun=new T.DirectionalLight('#fff7e7',2.7);sun.position.set(-7,14,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.1,far:50});sun.shadow.normalBias=.03;scene.add(sun,new T.HemisphereLight('#f3ffff','#71898b',1.8));
const material=(color)=>new T.MeshStandardMaterial({color,roughness:.65});
function box(parent,x,y,z,w,h,d,m,r=.09){const a=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);a.position.set(x,y,z);a.castShadow=a.receiveShadow=true;parent.add(a);return a;}
box(scene,0,-.6,0,200,.2,200,material('#e0e6e7'));
const board=new T.Group();scene.add(board);board.position.z=.8;const ivory=material('#e4eee8'),copper=material('#d7b478'),navy=material('#234c60');
box(board,0,-.12,0,13,.6,7.2,navy,.2);box(board,0,.2,0,12.8,.1,7,material('#8faea9'));
for(let i=0;i<17;i++){box(board,-5.8+i*.72,-.18,3.85,.29,.15,.8,copper,.025);box(board,-5.8+i*.72,-.18,-3.85,.29,.15,.8,copper,.025);}
const blocks=[],labels=[];
function module(id,x,z,w,d,title){const group=new T.Group();group.position.set(x,.25,z);board.add(group);const m=material('#dfece6');box(group,0,.43,0,w,.86,d,m,.15);box(group,0,.9,0,w-.16,.1,d-.16,ivory,.04);blocks.push({group,m,id});const el=document.createElement('div');el.className='label';el.innerHTML=title;document.querySelector('#labels').append(el);labels.push({el,point:new T.Vector3(x,1.65,z),id});return group;}
module('memory',-4,-1.8,2.8,1.6,'指令存储器<br><small>ADD x3, x1, x2</small>');
module('decode',-.3,-1.8,2.4,1.6,'译码／控制<br><small>加法 · 来源 · 目的地</small>');
module('registers',-3,1.45,3.8,1.8,'寄存器组<br><b id="registers">x1: 3　x2: 5　x3: 0</b>');
const alu=module('alu',3.6,.1,2.6,2.6,'运算单元 ALU<br><b id="alu">等待操作数</b>');
for(let i=0;i<4;i++)box(alu,(i-1.5)*.45,.99,.7,.25,.06,.18,copper,.02);
function path(points,color,width=.045){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'catmullrom',.02);board.add(new T.Mesh(new T.TubeGeometry(curve,80,width,8,false),material(color)));return curve;}
const fetchPath=path([[-2.6,.42,-1.8],[-1.5,.42,-1.8]],'#dda846');
path([[-.3,.37,-1],[-.3,.37,-.1],[-3,.37,-.1],[-3,.37,.55]],'#dda846');
path([[.9,.37,-1.8],[3.6,.37,-1.8],[3.6,.37,-1.2]],'#dda846');
const aPath=path([[-1.1,.4,1.15],[.6,.4,1.15],[1.3,.4,-.5],[2.3,.4,-.5]],'#346878');
const bPath=path([[-1.1,.4,1.8],[1.1,.4,1.8],[1.8,.4,.5],[2.3,.4,.5]],'#346878');
const backPath=path([[3.6,.4,1.4],[3.6,.4,2.85],[-3,.4,2.85],[-3,.4,2.35]],'#deab50',.065);
const tokens=[];function token(text,curve,start,end){const el=document.createElement('div');el.className='token';el.textContent=text;document.querySelector('#tokens').append(el);tokens.push({el,curve,start,end});}
token('ADD',fetchPath,c.fetch,3.6);token('3',aPath,c.read,9.5);token('5',bPath,c.read,9.5);token('8',backPath,c.write,c.commit);
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
const acc=new Accumulator(renderer,1920,1080);acc.finalMat.uniforms.uGrain.value=.007;
function project(p){const v=p.clone().add(board.position).project(camera);return [(v.x*.5+.5)*1920,(-v.y*.5+.5)*1080]}
function update(t){const s=stateAt(t,c);blocks.forEach((b,i)=>{const grown=smooth((t-i*.12)/.7);b.group.scale.y=Math.max(.001,grown);const active=(s.phase===0&&b.id==='memory')||(s.phase===1&&b.id==='decode')||(s.phase===2&&b.id==='registers')||(s.phase===3&&b.id==='alu')||(s.committed&&b.id==='registers');b.m.color.set(active?'#e5b95f':'#dfece6');});camera.zoom=1.02-.035*smooth((t-15)/2);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
const captions=[['01 / 取指：拿到要执行的指令','ADD x3, x1, x2：把 x1 与 x2 相加，结果交给 x3。'],['02 / 译码：确定做什么、从哪里读、写到哪里','控制逻辑识别 ADD，并选中源寄存器 x1、x2 和目的寄存器 x3。'],['03 / 读数：把 3 和 5 送入运算单元','读取不会清空寄存器；x1 和 x2 仍然保留原值。'],['04 / 运算：ALU 完成 3 + 5','结果先在运算单元产生；此时 x3 还没有被改写。'],['05 / 写回：把结果 8 存入 x3','只更新目的寄存器；x1 = 3、x2 = 5 保持不变。']];
function render(t){acc.frame(scene,camera,8,(i,n,sub)=>update(Math.max(0,t+(sub.frac-.5)/60)),t);update(t);const s=stateAt(t,c);
 labels.forEach(l=>{const [x,y]=project(l.point);l.el.style.left=(x+(l.id==='alu'?110:0))+'px';l.el.style.top=(y-(l.id==='alu'?85:0))+'px';l.el.style.opacity=smooth((t-.6)/.5);});
 tokens.forEach(k=>{const q=(t-k.start)/(k.end-k.start);k.el.style.display=q>=0&&q<1?'block':'none';const p=k.curve.getPoint(smooth(q));p.y+=.4;const[x,y]=project(p);k.el.style.left=x+'px';k.el.style.top=y+'px';});
 document.querySelector('#registers').textContent=`x1: ${s.x1}　x2: ${s.x2}　x3: ${s.x3}`;
 document.querySelector('#alu').textContent=s.aluResult!==null?'3 + 5 = 8':t>=9.5?'3 + 5':t>=c.read?'接收 3 和 5':'等待操作数';
 document.querySelectorAll('.steps span').forEach((e,i)=>e.classList.toggle('active',i===s.phase));document.querySelector('#caption').textContent=s.committed?'完成 / x3 = 8，一条加法指令执行完毕':captions[s.phase][0];document.querySelector('#detail').textContent=captions[s.phase][1];
}
window.DEMO={width:1920,height:1080,fps:30,duration:c.duration,motionBlur:{samples:1,shutter:.5}};window.renderAt=render;render(0);window.__ready=true;
