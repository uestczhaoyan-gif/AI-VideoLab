"""A shared radial traveling-pulse design, not a physical material simulation."""
import math,json
from pathlib import Path
P=json.loads(Path(__file__).with_name('wave.json').read_text())
def cells():
 result=[];step=P['pitch'];dy=step*math.sqrt(3)/2
 for row in range(-22,23):
  for col in range(-20,21):
   x=(col+.5*(row%2))*step;y=row*dy;r=math.hypot(x,y)
   if P['inner']<=r<=P['outer']:result.append((x,y,r))
 return result
def height(r,t):
 dt=t-P['impact'];h=0
 for delay,gain in [(0,1),(P['second_delay'],P['second_gain'])]:
  u=dt-delay
  if u<0:continue
  q=(r-(P['inner']+P['speed']*u))/P['width']
  if abs(q)<1:
   ramp=min(1,u/.18);ramp=ramp*ramp*(3-2*ramp)
   h+=gain*.5*(1+math.cos(math.pi*q))*ramp
 return P['rest_height']+P['amplitude']*math.exp(-.055*(r-P['inner']))*h
