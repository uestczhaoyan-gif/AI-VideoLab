"""Original instruction-journey arrangement using upstream MIT instruments."""
import os,sys,json
from pathlib import Path
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,drums
c=json.loads(Path(__file__).with_name('cues.json').read_text())
m=Mix(c['duration']);keys=m.track('instruction',level=-22,sends={'plate':-22},group='music');pad=m.track('system',level=-28,group='music')
for i in range(34):keys.add(fm.mallet(['C5','G5','D5','E5','G5','E5','D5','C5'][i%8],.55,.5,'marimba'),.25+i*.5)
for at,chord in [(0,['C3','E3','G3']),(4,['F3','A3','C4']),(8,['G3','B3','D4']),(12,['C3','E3','G3']),(15,['C3','G3','C4'])]:
 for note in chord:pad.add(fm.epiano(note,2.5,.35,bright=.2,tremolo=.1,release=.6),at)
for i,key in enumerate(['fetch','decode','read','execute','write','commit']):
 keys.add(fm.mallet(['C6','D6','E6','G6','A6','C7'][i],.8,.65,'marimba'),c[key]);m.sfx(sfx.pop('soft',pitch=.8+i*.1),at=c[key],gain=-21)
m.sfx(sfx.shimmer_hit('C6'),at=c['commit'],gain=-24)
print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
