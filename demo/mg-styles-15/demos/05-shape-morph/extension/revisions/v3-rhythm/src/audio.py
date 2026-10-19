"""Fast rhythmic score aligned to WANDER v3's eight short shape changes."""
import os,sys,json
from pathlib import Path
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,drums
c=json.loads(Path(__file__).with_name('cues.json').read_text());m=Mix(c['duration'],bpm=150)
keys=m.track('quick forms',level=-19,sends={'plate':-18},group='music');pad=m.track('colour bed',level=-26,group='music');pulse=m.track('beat',level=-27,group='music')
for i in range(21):keys.add(fm.mallet(['D5','A5','F#5','E5','G5','A5','D6','F#5'][i%8],.62,.55,'marimba'),.12+i*.36)
for at,chord in [(0,['D3','F#3','A3']),(1.6,['B2','D3','F#3']),(3.2,['G3','B3','D4']),(4.8,['A2','C#3','E3']),(6.4,['B2','D3','F#3']),(8.0,['D3','F#3','A3']),(8.2,['D3','A3','D4'])]:
 for n in chord:pad.add(fm.epiano(n,1.4,.38,bright=.24,tremolo=.08,release=.45),at)
for i in range(19):pulse.add(drums.kick('soft',.28),.28+i*.4)
for i,event in enumerate(c['morphs']):
 m.sfx(sfx.whoosh(.34,'air',direction=1,peak=.42,seed=13+i),at=event['start']+.02,gain=-20)
 m.sfx(sfx.chime(('E6','G#6','B6','D#7'),step=.035,kind='celesta'),at=event['end'],gain=-17+i*.15,verb=-9)
m.sfx(sfx.shimmer_hit('D6'),at=c['title'],gain=-20,verb=-8)
print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
