"""Run pinned upstream scene/render scripts with CPU device selection only.
blender -b [-path-to-scene] -P tools/blender-cpu.py -- scene|render [upstream options]
Leaves upstream files unchanged; image quality settings stay at upstream defaults.
"""
import os,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'source'
args=sys.argv[sys.argv.index('--')+1:]
mode=args.pop(0)
if mode not in ('scene','render'):raise ValueError(mode)
os.environ['MG_ROOT']=str(root)
os.environ['MG_DEVICE']='NONE'
script=root/'demos/04-3d-render/blender'/f'{mode}.py'
code=script.read_text(encoding='utf-8')
old="cy.device = 'GPU'" if mode=='scene' else "sc.cycles.device = 'GPU'"
if code.count(old)!=1:raise RuntimeError('Upstream device selector changed')
code=code.replace(old,old.replace("'GPU'","'CPU'"))
sys.argv=[str(script),'--',*args]
exec(compile(code,str(script),'exec'),{'__name__':'__main__','__file__':str(script)})
