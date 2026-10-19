"""A continuous new musical phrase for the extended WANDER sequence."""
import os,sys,json
from pathlib import Path
sys.path.insert(0,os.environ['VIDEOLAB_AUDIO_LIB'])
from mgaudio import Mix,fm,sfx,drums
c=json.loads(Path(__file__).with_name('cues.json').read_text());m=Mix(c['duration'])
keys=m.track('journey',level=-21,sends={'plate':-20},group='music');pad=m.track('breath',level=-27,group='music');beat=m.track('pulse',level=-30,group='music')
for i in range(30):keys.add(fm.mallet(['D5','F#5','A5','B5','A5','E5','F#5','D5'][i%8],.65,.48,'marimba'),.3+i*.43)
for at,chord in [(0,['D3','F#3','A3']),(2.8,['G3','B3','D4']),(5.6,['A3','C#4','E4']),(8.8,['B2','D3','F#3']),(11.3,['D3','F#3','A3'])]:
 for n in chord:pad.add(fm.epiano(n,2.3,.4,bright=.23,release=.8),at)
for i in range(22):beat.add(drums.kick('soft',.28),2.2+i*.43)
for i,event in enumerate(c['morphs']):
 m.sfx(sfx.whoosh(.8,'air',direction=1 if i<2 else -1,peak=.6),at=event['start']+.35,gain=-25)
 keys.add(fm.mallet(['D6','F#6','A5','D6'][i],1,.5,'marimba'),event['end'])
m.sfx(sfx.shimmer_hit('D6'),at=c['title'],gain=-25)
print(m.export(os.environ['VIDEOLAB_AUDIO_OUT'],lufs=-16,tp=-2))
