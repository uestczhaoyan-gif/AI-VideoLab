import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {Accumulator} from '/source/demos/03-isometric/js/render.js';
const cues=await (await fetch('./cues.json')).json();
await document.fonts.load('700 72px Harmony');
const renderer=new T.WebGLRenderer({canvas:document.querySelector('#c'),antialias:false,preserveDrawingBuffer:true});
renderer.setSize(1920,1080);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e6e9dc');
const camera=new T.OrthographicCamera(-12.8,12.8,7.2,-7.2,.1,100);
const light=new T.DirectionalLight('#fff2d4',3);light.position.set(-6,13,8);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.1,far:45});light.shadow.bias=-.0003;light.shadow.normalBias=.035;scene.add(light,new T.HemisphereLight('#f4ffff','#8e9b87',2.0));
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.7,...extra});
const cream=mat('#f5f0db'),green=mat('#78a395'),dark=mat('#244e53'),gold=mat('#efb94f'),roof=mat('#cf7960'),pale=mat('#b3c6ae');
function box(parent,x,y,z,w,h,d,m,r=.08){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(parent,x,y,z,r,m){const o=new T.Mesh(new T.SphereGeometry(r,24,16),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
const floor=box(scene,0,-.65,0,200,.2,200,mat('#e6e9dc'));
const island=new T.Group();scene.add(island);box(island,0,-.23,0,12,.55,7.2,cream,.22);box(island,0,.06,0,11.8,.12,7,pale,.1);
// Three functional zones: solar collection, storage, residential use.
const panels=new T.Group();panels.position.set(-3.8,.15,-.65);island.add(panels);
for(let i=0;i<2;i++)for(let j=0;j<2;j++){
 const p=new T.Group();p.position.set(i*1.45-.7,0,j*1.65-.65);panels.add(p);box(p,0,.4,0,.12,.8,.12,cream);
 const face=new T.Group();face.position.y=.8;face.rotation.x=-.24;p.add(face);box(face,0,0,0,1.32,.12,1.42,cream,.04);
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)box(face,(a-1)*.4,.075,(b-1)*.43,.36,.03,.39,dark,.015);
}
const battery=new T.Group();battery.position.set(0,.15,-.55);island.add(battery);box(battery,0,1,0,1.5,2,1.35,cream,.18);box(battery,0,2.08,0,.65,.18,.6,dark);
const cells=[];for(let i=0;i<4;i++){const m=mat('#51756b');cells.push(m);box(battery,0,.4+i*.4,.695,.95,.24,.05,m,.035);}
box(battery,0,1,-.7,1,.65,.06,gold);
const homes=[],windows=[];
for(let i=0;i<3;i++){
 const g=new T.Group();g.position.set(3.3+(i===1?1.1:0),.15,(i-1)*1.9);island.add(g);homes.push(g);
 box(g,0,.6,0,1.2,1.2,1.2,cream);const roofMesh=new T.Mesh(new T.CylinderGeometry(.99,.99,1.45,3),roof);roofMesh.rotation.z=Math.PI/2;roofMesh.position.y=1.4;roofMesh.castShadow=true;g.add(roofMesh);
 box(g,-.25,.3,.615,.26,.6,.04,dark,.015);
 for(const x of [-.3,.3]){const m=mat('#41656a');windows.push(m);box(g,x,.85,.62,.28,.3,.04,m,.025);}
 const m=mat('#41656a');windows.push(m);box(g,.62,.7,0,.04,.38,.4,m,.025);
}
for(const [x,z,s] of [[-5,2.5,.8],[-2,2.6,.65],[1.5,-2.7,.7],[5.1,2.6,.65],[5,-2.8,.6]]){
 box(island,x,.4,z,.12,.7,.12,roof);ball(island,x,.95,z,.45*s,green);ball(island,x,1.25,z,.36*s,green);
}
function cable(points){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'catmullrom',.05);const mesh=new T.Mesh(new T.TubeGeometry(path,80,.055,8,false),dark);island.add(mesh);return path;}
const inbound=cable([[-3.8,.22,1],[-3.8,.22,2],[-.1,.22,2],[-.1,.22,.3]]);
const outbound=cable([[.7,.22,.1],[1.5,.22,.1],[1.5,.22,2],[3.3,.22,2],[3.3,.22,1.7]]);
const packets=[];for(let i=0;i<8;i++)packets.push(ball(island,0,0,0,.12,mat('#ffdc75',{emissive:'#ffba3b',emissiveIntensity:.6})));
const sun=new T.Group();sun.position.set(-4.2,3.8,-1.9);scene.add(sun);ball(sun,0,0,0,.48,gold);
for(let i=0;i<12;i++){const a=i*Math.PI/6;const ray=box(sun,Math.cos(a)*.75,Math.sin(a)*.75,0,.09,.26,.09,gold,.025);ray.rotation.z=a-Math.PI/2;}
const beams=[];for(let i=0;i<5;i++)beams.push(ball(scene,0,0,0,.075,gold));
const accumulator=new Accumulator(renderer,1920,1080);accumulator.finalMat.uniforms.uGrain.value=.008;
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
const rise=(t,start)=>{const x=T.MathUtils.clamp((t-start)/.8,0,1);return x===1?1:1-Math.pow(1-x,3)*Math.cos(x*5)};
function update(t){
 island.scale.setScalar(Math.max(.001,smooth(t/.8)));panels.scale.y=Math.max(.001,rise(t,cues.panels));battery.scale.y=Math.max(.001,rise(t,cues.battery));homes.forEach((g,i)=>g.scale.y=Math.max(.001,rise(t,cues.homes+i*.18)));
 sun.scale.setScalar(Math.max(.001,smooth((t-.5)/.8)));sun.rotation.z=t*.08;
 const night=smooth((t-7)/2);scene.background.set('#e6e9dc').lerp(new T.Color('#b7cdd0'),night*.6);floor.material.color.copy(scene.background);
 cells.forEach((m,i)=>{const q=smooth((t-cues.charge-i*.35)/.35);m.color.set('#51756b').lerp(new T.Color('#eec15c'),q);m.emissive.set('#d9a538');m.emissiveIntensity=q*.35;});
 windows.forEach((m,i)=>{const q=smooth((t-cues.lights-Math.floor(i/3)*.2)/.3);m.color.set('#41656a').lerp(new T.Color('#ffe7a0'),q);m.emissive.set('#ffbf51');m.emissiveIntensity=q*1.2;});
 packets.forEach((p,i)=>{const first=i<4,base=first?cues.collect:cues.deliver;const q=(t-base-(i%4)*.23)/1.3;p.visible=q>=0&&q<1;p.position.copy((first?inbound:outbound).getPoint(T.MathUtils.clamp(q,0,1)));});
 beams.forEach((p,i)=>{const q=(t-2.5-i*.18)/.8;p.visible=q>=0&&q<1;p.position.lerpVectors(new T.Vector3(-4.2,3.5,-1.9),new T.Vector3(-3.8+i*.2,1.1,-.5),T.MathUtils.clamp(q,0,1));});
 const pull=smooth((t-8.6)/1.8);camera.position.set(14,13,17);camera.lookAt(0,.2,0);camera.zoom=1.08-.10*pull;camera.updateProjectionMatrix();
}
function render(t){accumulator.frame(scene,camera,8,(i,n,s)=>update(Math.max(0,t+(s.frac-.5)/60)),t);update(t);
 document.querySelector('#progress').style.width=`${Math.min(t/12,1)*100}%`;
 document.querySelector('#step').textContent=t<3.3?'01 / 建立一座能源岛':t<4.6?'02 / 让阳光变成电能':t<6.4?'03 / 储存，等待需要的时刻':t<9.3?'04 / 能量抵达，生活亮起':'一束阳光，点亮一座小镇。';
}
window.DEMO={width:1920,height:1080,fps:30,duration:cues.duration,motionBlur:{samples:1,shutter:.5}};window.renderAt=render;render(0);window.__ready=true;
