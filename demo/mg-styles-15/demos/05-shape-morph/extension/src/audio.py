"""New WANDER arrangement, upstream instruments only."""
import os,sys,json
from pathlib import Path
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,drums
c=json.loads(Path(__file__).with_name('cues.json').read_text());m=Mix(c['duration']);keys=m.track('wander',level=-19,sends={'plate':-20},group='music');pad=m.track('sky',level=-27,group='music');beat=m.track('pulse',level=-28,group='music')
for i in range(22):keys.add(fm.mallet(['D5','F#5','A5','B5','A5','F#5','E5','A5'][i%8],.5,.5,'marimba'),.2+i*.4)
for at,chord in [(0,['D3','F#3','A3']),(2.9,['G3','B3','D4']),(5.1,['A3','C#4','E4']),(7.3,['D3','F#3','A3'])]:
 for n in chord:pad.add(fm.epiano(n,1.9,.4,bright=.2,release=.7),at)
for i in range(18):beat.add(drums.kick('soft',.35),1.6+i*.4)
for i,event in enumerate(c['morphs']):
 m.sfx(sfx.whoosh(.65,'air',direction=1,peak=.5),at=event['start']+.15,gain=-21)
 m.sfx(sfx.pop('bubble',pitch=1+i*.2),at=event['end'],gain=-14)
m.sfx(sfx.shimmer_hit('D6'),at=7.3,gain=-18);m.sfx(sfx.pop('soft',pitch=.8),at=.95,gain=-20)
print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
