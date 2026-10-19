"""RIPPLE: original scene and deterministic motion; Blender 5.1 / Cycles CPU."""
import bpy,math,json,sys,os,time,argparse
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;OUT=HERE.parent
C=json.loads((HERE/'cues.json').read_text())
sys.path.insert(0,str(HERE))
from radial_wave import P,cells,height
ap=argparse.ArgumentParser();ap.add_argument('--frames',default='');ap.add_argument('--all',action='store_true');ap.add_argument('--samples',type=int,default=16);ap.add_argument('--pct',type=int,default=100);args=ap.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=args.samples;sc.cycles.use_adaptive_sampling=True;sc.cycles.adaptive_threshold=.06;sc.cycles.adaptive_min_samples=4;sc.cycles.use_denoising=True
sc.cycles.max_bounces=5;sc.cycles.diffuse_bounces=2;sc.cycles.glossy_bounces=3;sc.cycles.transmission_bounces=2
sc.render.resolution_x=1920;sc.render.resolution_y=1080;sc.render.resolution_percentage=args.pct;sc.render.fps=24;sc.render.use_persistent_data=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGB';sc.render.image_settings.compression=15
sc.render.use_motion_blur=True;sc.render.motion_blur_shutter=.35;sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
def color(h):
 v=[int(h[i:i+2],16)/255 for i in (0,2,4)];return tuple(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v)+(1,)
def mat(name,h,rough=.3,metal=0,sss=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=color(h);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;p.inputs['Subsurface Weight'].default_value=sss;return m
ivory=mat('porcelain','E6E8D8',.32);sage=mat('sage','78988A',.3);mint=mat('mint','A7C1AD',.3);orange=mat('soft coral','ED865F',.24,sss=.06);brass=mat('brushed gold','C5A66B',.22,.7);ground=mat('studio','CCD8D0',.65)
def sphere(name,loc,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 return o
def cylinder(name,r,depth,z,m):
 bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=r,depth=depth,location=(0,0,z));o=bpy.context.object;o.name=name;o.data.materials.append(m);bevel=o.modifiers.new('soft edge','BEVEL');bevel.width=.14;bevel.segments=4;o.modifiers.new('weighted normals','WEIGHTED_NORMAL');return o
bpy.ops.mesh.primitive_plane_add(size=200);bpy.context.object.data.materials.append(ground)
cylinder('floating plinth',5.6,.38,.24,ivory);cylinder('inset',5.35,.07,.47,sage)
cushion=sphere('soft contact pad',(0,0,.6),(1.0,1.0,.24),mint)
hero=sphere('coral hero',(0,0,4.6),(.75,.75,.75),orange)
rings=[]
for i,(x,y,r) in enumerate(cells()):
 o=sphere(f'cell_{i}',(x,y,P['base']+P['rest_height']/2),(P['radius'],P['radius'],P['rest_height']/2),ivory);rings.append((o,r))
for a in [0,math.pi/2,math.pi,3*math.pi/2]:sphere('gold marker',(5.17*math.cos(a),5.17*math.sin(a),.55),(.09,.09,.06),brass)
world=bpy.data.worlds.new('studio world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.65,.75,.8,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.4;sc.world=world
def light(name,loc,energy,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.5))-o.location).to_track_quat('-Z','Y').to_euler()
light('key',(-4,-5,10),1500,7);light('rim',(4,3,8),1800,6);light('fill',(-5,5,5),650,5)
bpy.ops.object.camera_add();cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=18.3;cam.data.lens=50
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
for f in range(-2,195):
 t=f/24;dt=t-C['impact']
 if dt<0:z=1.56+3.8*(1-smooth((t+.2)/2))
 else:z=1.56+.42*math.exp(-dt*2.4)*abs(math.sin(dt*5.2))
 squash=.27*math.exp(-((dt-.06)/.16)**2)
 hero.location.z=z-squash*(.75+.24*.65);hero.scale=(.75*(1+squash*.55),.75*(1+squash*.55),.75*(1-squash));hero.keyframe_insert('location',frame=f);hero.keyframe_insert('scale',frame=f)
 cushion.scale=(1+squash*.35,1+squash*.35,.24*(1-squash*.65));cushion.keyframe_insert('scale',frame=f)
 for o,r in rings:
  h=height(r,t);o.location.z=P['base']+h/2;o.scale=(P['radius'],P['radius'],h/2);o.keyframe_insert('location',frame=f);o.keyframe_insert('scale',frame=f)
 angle=0;cam.location=(0,-12,13);cam.rotation_euler=(Vector((0,0,1.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert('location',frame=f);cam.keyframe_insert('rotation_euler',frame=f)
sc.frame_start=0;sc.frame_end=191
(OUT/'work').mkdir(exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'work/scene.blend'))
frames=range(192) if args.all else [int(x) for x in args.frames.split(',') if x]
folder=OUT/('frames' if args.pct==100 else 'draft-frames');folder.mkdir(exist_ok=True)
for f in frames:
 path=folder/f'{f:04d}.png'
 if path.exists():continue
 start=time.time();sc.frame_set(f);sc.render.filepath=str(path)+'.tmp.png';bpy.ops.render.render(write_still=True);os.replace(str(path)+'.tmp.png',path);print(f'FRAME {f} {time.time()-start:.1f}s',flush=True)
