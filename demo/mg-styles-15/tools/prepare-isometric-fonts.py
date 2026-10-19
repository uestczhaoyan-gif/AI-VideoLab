"""Restore source fonts for the isometric demo, without installing system fonts."""
from pathlib import Path
from urllib.request import urlretrieve
from zipfile import ZipFile
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent
files = {
    'source/assets/fonts/latin/unbounded/Unbounded-VF.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/unbounded/Unbounded%5Bwght%5D.ttf',
    'source/assets/fonts/latin/unbounded/OFL.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/unbounded/OFL.txt',
    'source/assets/fonts/latin/jetbrainsmono/JetBrainsMono-VF.ttf': 'https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/variable/JetBrainsMono%5Bwght%5D.ttf',
    'source/assets/fonts/latin/jetbrainsmono/OFL.txt': 'https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt',
    'downloads/HarmonyOS-Sans.zip': 'https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip',
}
for relative, url in files.items():
    target = root / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        urlretrieve(url, target)
destination = root / 'source/assets/fonts/cjk/harmonyossanssc'
destination.mkdir(parents=True, exist_ok=True)
with ZipFile(root / 'downloads/HarmonyOS-Sans.zip') as archive:
    for name in ['HarmonyOS_Sans_SC_Bold.ttf', 'HarmonyOS_Sans_SC_Medium.ttf', 'LICENSE.txt']:
        (destination / name).write_bytes(archive.read('HarmonyOS Sans/HarmonyOS_Sans_SC/' + name))
static_path = root / 'source/demos/03-isometric/assets/fonts/Unbounded-800-static.ttf'
static_path.parent.mkdir(parents=True, exist_ok=True)
if not static_path.exists():
    font = TTFont(root / 'source/assets/fonts/latin/unbounded/Unbounded-VF.ttf')
    instantiateVariableFont(font, {'wght': 800}, inplace=False).save(static_path)
print('Isometric fonts ready; original licenses retained beside the font files.')
