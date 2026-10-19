"""New score for The Way Home. Uses upstream MIT audio instruments."""
import os,sys,json
from pathlib import Path
import numpy as np
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,Sound
c=json.loads(Path(__file__).with_name('cues.json').read_text());m=Mix(c['duration'])
piano=m.track('way_home',level=-21,sends={'plate':-18},group='music');pad=m.track('horizon',level=-29,group='music')
for at,note in [(0,'D4'),(.7,'A4'),(1.4,'F#4'),(2.5,'E4'),(3.1,'A4'),(4.15,'G4'),(4.9,'B4'),(5.5,'D5'),(6.05,'A4'),(6.9,'E5'),(7.6,'C#5'),(8.25,'D5'),(9.5,'F#5'),(10.2,'A5')]:piano.add(fm.epiano(note,1.5,.5,bright=.16,tremolo=.05,release=.7),at)
for at,chord in [(0,['D3','F#3','A3']),(2.5,['B2','D3','F#3']),(4.15,['G2','B2','D3']),(6.9,['A2','C#3','E3']),(8.25,['D3','F#3','A3'])]:
 for n in chord:pad.add(fm.epiano(n,2.2,.35,bright=.08,tremolo=.1,release=.8),at)
# Quiet dry texture follows each draw section's easing, not an unrelated loop.
sr=48000;times=np.arange(int(sr*c['duration']))/sr;env=np.zeros_like(times)
for p in c['pieces']:
 q=(times-p['start'])/(p['end']-p['start']);inside=(q>=0)&(q<1);env+=inside*(.25+.75*6*np.clip(q,0,1)*(1-np.clip(q,0,1)))
noise=np.random.default_rng(24).normal(0,.013,len(times))*env
noise*=np.minimum(1,times/.03)*np.minimum(1,np.maximum(0,8.3-times)/.1)
m.track('pen',level=-21,group='sfx').add(Sound(noise.astype(np.float32)),0)
m.sfx(sfx.shimmer_hit('D6'),at=c['fill'],gain=-18)
m.sfx(sfx.whoosh(.9,'air',direction=-1,peak=.45),at=c['return'],gain=-25)

print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
