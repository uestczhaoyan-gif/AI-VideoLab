"""Cache only the authorized video tracks supplied by the browser, for local OCR research."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parent.parent / '_evidence'
text = (root / 'media-access.txt').read_text(encoding='utf-8-sig')
payload = text.split('### Result', 1)[1].split('### Ran', 1)[0].strip()
rows = json.loads(payload)
allowed = {'BV1wqpi6PE19','BV1xGah67E1j','BV1Z28P6HEGa','BV1Haaq6ZEei','BV1E2t26vEVx'}

def download(row):
    if row['bvid'] not in allowed:
        raise ValueError('Unexpected source ID')
    target = root / 'media' / (row['bvid'] + '.mp4')
    if not target.exists():
        request = Request(row['url'], headers={'Referer':'https://www.bilibili.com/', 'User-Agent':'Mozilla/5.0'})
        temporary = target.with_suffix('.partial')
        with urlopen(request, timeout=60) as response, temporary.open('wb') as dest:
            while block := response.read(1024*1024):
                dest.write(block)
        temporary.replace(target)
    return {'bvid':row['bvid'],'bytes':target.stat().st_size,'width':row['width'],'height':row['height'],'codec':row['codec'],'duration':row['duration']}

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(download, rows))
(root / 'media-manifest.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
