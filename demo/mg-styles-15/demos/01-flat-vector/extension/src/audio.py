"""Original arrangement using upstream mgaudio instruments; no original soundtrack reused."""
from pathlib import Path
import os
import sys
import json

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, os.environ.get('VIDEOLAB_AUDIO_LIB', str(ROOT / 'source/lib/audio')))
from mgaudio import Mix, fm, sfx, synth, drums

HERE = Path(__file__).resolve().parent
cues = json.loads((HERE / 'cues.json').read_text(encoding='utf-8'))
out = Path(os.environ.get('VIDEOLAB_AUDIO_OUT', str(HERE.parent / 'audio.wav')))
out.parent.mkdir(parents=True, exist_ok=True)
m = Mix(cues['duration'])
keys = m.track('seed_melody', level=-17, sends={'plate': -20}, group='music')
pad = m.track('garden_harmony', level=-26, group='music')
# Build a light pentatonic figure and increase its density as flowers appear.
notes = ['C5','E5','G5','A5','G5','E5','D5','G5']
for i in range(20):
    at = .2 + i * .45
    keys.add(fm.mallet(notes[i % len(notes)], .58, .60 + .08 * (i % 3), 'marimba'), at)
for at, chord in [(1.5,['C3','E3','G3']), (4.0,['F3','A3','C4']), (5.8,['G3','B3','D4']), (8.0,['C3','E3','G3'])]:
    for note in chord:
        pad.add(fm.epiano(note, 1.75, .42, bright=.18, tremolo=.12, release=.6), at)
beat = m.track('soft_pulse', level=-29, group='music')
for i in range(14):
    beat.add(drums.kick('soft', .35), 2.8 + i*.45)
m.sfx(sfx.pop('soft', pitch=.7), at=cues['seedLand'], gain=-8)
m.sfx(sfx.whoosh(.5, 'air', direction=1, peak=.55), at=cues['sproutStart'], gain=-20)
for at in cues['leafTimes']:
    m.sfx(sfx.pop('bubble', pitch=1.2), at=at, gain=-15)
m.sfx(sfx.shimmer_hit('C6'), at=cues['bloomStart']+.4, gain=-17)
for i, at in enumerate(sorted(cues['gardenTimes'])):
    keys.add(fm.mallet(['C6','D6','E6','G6','A6','C7'][i], .8, .62, 'marimba'), at+.35)
    m.sfx(sfx.pop('bubble', pitch=1.05+i*.09), at=at+.35, gain=-19)
m.sfx(sfx.shimmer_hit('C6'), at=cues['titleStart'], gain=-20)
result = m.export(str(out), lufs=-16, tp=-2.0)
print({k: result[k] for k in ('duration','lufs','true_peak','warnings') if k in result})
