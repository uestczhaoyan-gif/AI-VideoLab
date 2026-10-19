"""Original RIPPLE score, shared upstream sound instruments only."""
import os,sys,json
from pathlib import Path
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,drums
c=json.loads(Path(__file__).with_name('cues.json').read_text());m=Mix(c['duration'])
pad=m.track('breath',level=-26,group='music');keys=m.track('ripples',level=-19,sends={'plate':-20},group='music')
for at,chord in [(0,['F3','A3','C4']),(2.15,['Bb3','D4','F4']),(4,['C3','E3','G3']),(5.5,['F3','A3','C4'])]:
 for n in chord:pad.add(fm.epiano(n,1.8,.4,bright=.18,tremolo=.08,release=.8),at)
keys.add(fm.mallet('C5',1,.5,'marimba'),.3)
for at,n in zip(c['ring_hits'],['F5','A5','C6','F6']):
 keys.add(fm.mallet(n,.85,.6,'marimba'),at);m.sfx(sfx.pop('bubble',pitch=1.1),at=at,gain=-24)
m.track('soft contact',level=-18,group='sfx').add(drums.kick('soft',.55),c['impact']);m.sfx(sfx.pop('soft',pitch=.65),at=c['impact'],gain=-13)
m.sfx(sfx.whoosh(.7,'air',direction=1,peak=.5),at=3,gain=-28)
keys.add(fm.epiano('F5',1.6,.5,bright=.2,release=.7),c['title']);print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
