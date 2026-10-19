"""SUNGRID: new arrangement, upstream MIT mgaudio instruments."""
from pathlib import Path
import os, sys, json
sys.path.insert(0, os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix, fm, sfx, drums
c=json.loads(Path(__file__).with_name('cues.json').read_text())
m=Mix(c['duration'])
keys=m.track('sunlight',level=-19,sends={'plate':-20},group='music')
pad=m.track('warmth',level=-27,group='music')
for i in range(23):
    keys.add(fm.mallet(['D5','A5','F#5','E5','D5','F#5','A5','B5'][i%8],.7,.55,'marimba'),.2+i*.5)
for at,chord in [(0,['D3','F#3','A3']),(3,['G3','B3','D4']),(6,['A3','C#4','E4']),(9,['D3','F#3','A3'])]:
    for note in chord: pad.add(fm.epiano(note,2.5,.4,bright=.18,tremolo=.1,release=.6),at)
beat=m.track('pulse',level=-30,group='music')
for i in range(16): beat.add(drums.kick('soft',.3),3+i*.5)
for key in ['panels','battery','homes']:
    m.sfx(sfx.pop('soft',pitch=.9),at=c[key],gain=-18)
for i in range(4):
    m.sfx(sfx.pop('bubble',pitch=1+i*.12),at=c['charge']+i*.35,gain=-22)
m.sfx(sfx.whoosh(.65,'air',direction=1,peak=.5),at=c['deliver'],gain=-23)
for i in range(3): keys.add(fm.mallet(['D6','F#6','A6'][i],1,.6,'marimba'),c['lights']+i*.2)
m.sfx(sfx.shimmer_hit('D6'),at=c['final'],gain=-23)
print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
