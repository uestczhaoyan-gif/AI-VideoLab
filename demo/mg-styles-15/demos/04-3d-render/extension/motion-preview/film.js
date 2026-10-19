import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const P=await(await fetch('../src/wave.json')).json();await document.fonts.load('500 43px Harmony');
const W=1920,H=1080,renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new T.Scene();scene.background=new T.Color('#cdd8d0');scene.environment=new T.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.4;
const camera=new T.OrthographicCamera(-9.15,9.15,5.147,-5.147,.1,80);camera.position.set(0,13,-12);camera.lookAt(0,1.1,0);
scene.add(new T.HemisphereLight('#ffffff','#708c7c',1.5));const key=new T.DirectionalLight('#fff8ed',3);key.position.set(-4,10,-5);key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});key.shadow.normalBias=.025;scene.add(key);
const mat=(color,roughness=.35)=>new T.MeshStandardMaterial({color,roughness});const mint=mat('#a7c1ad'),ivory=mat('#e6e8d8'),sage=mat('#78988a'),coral=mat('#ed865f',.22);
function mesh(geo,m,pos){const a=new T.Mesh(geo,m);a.position.set(...pos);a.castShadow=a.receiveShadow=true;scene.add(a);return a;}
const floor=mesh(new T.PlaneGeometry(200,200),mat('#cdd8d0',.7),[0,0,0]);floor.rotation.x=-Math.PI/2;
mesh(new T.CylinderGeometry(5.6,5.6,.38,128),ivory,[0,.24,0]);mesh(new T.CylinderGeometry(5.35,5.35,.07,128),sage,[0,.47,0]);
const pad=mesh(new T.SphereGeometry(1,48,24),mint,[0,.6,0]);pad.scale.set(1,.24,1);
const ball=mesh(new T.SphereGeometry(1,48,32),coral,[0,5,0]);ball.scale.setScalar(.75);
const cells=[],dy=P.pitch*Math.sqrt(3)/2;for(let row=-22;row<=22;row++)for(let col=-20;col<=20;col++){const x=(col+.5*((row%2+2)%2))*P.pitch,z=row*dy,r=Math.hypot(x,z);if(r>=P.inner&&r<=P.outer)cells.push({x,z,r});}
const beads=new T.InstancedMesh(new T.SphereGeometry(1,16,12),ivory,cells.length);beads.castShadow=beads.receiveShadow=true;scene.add(beads);const dummy=new T.Object3D();
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
function height(r,t){let h=0;for(const [delay,gain] of [[0,1],[P.second_delay,P.second_gain]]){const u=t-P.impact-delay;if(u<0)continue;const q=(r-(P.inner+P.speed*u))/P.width;if(Math.abs(q)<1)h+=gain*.5*(1+Math.cos(Math.PI*q))*smooth(u/.18);}return P.rest_height+P.amplitude*Math.exp(-.055*(r-P.inner))*h;}
function render(t){cells.forEach((c,i)=>{const h=height(c.r,t);dummy.position.set(c.x,P.base+h/2,c.z);dummy.scale.set(P.radius,h/2,P.radius);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);});beads.instanceMatrix.needsUpdate=true;
const dt=t-P.impact,squash=.27*Math.exp(-Math.pow((dt-.06)/.16,2));const z=dt<0?1.56+3.8*(1-smooth((t+.2)/2)):1.56+.42*Math.exp(-dt*2.4)*Math.abs(Math.sin(dt*5.2));ball.position.y=z-squash*(.75+.24*.65);ball.scale.set(.75*(1+squash*.55),.75*(1-squash),.75*(1+squash*.55));pad.scale.set(1+squash*.35,.24*(1-squash*.65),1+squash*.35);document.querySelector('#title').style.opacity=smooth((t-5.5)/.7);renderer.render(scene,camera);}
window.DEMO={width:W,height:H,fps:30,duration:8,motionBlur:{samples:1,shutter:.35}};window.renderAt=render;window.waveHeight=height;window.waveCellCount=cells.length;render(0);window.__ready=true;
