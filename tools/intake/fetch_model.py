"""Download a faster-whisper CTranslate2 model through the HF mirror.

This machine reaches huggingface.co only via https://hf-mirror.com, and the
hf-xet transfer backend plus urllib large-file reads stall here; curl resumes
and saturates the mirror. The model is cached outside the repository.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import urllib.request

MIRROR = os.environ.get("HF_ENDPOINT", "https://hf-mirror.com").rstrip("/")
CACHE = os.path.join(os.path.expanduser("~"), ".cache", "videolab-models")


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def download(url: str, dest: str) -> None:
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"  exists {os.path.basename(dest)} {os.path.getsize(dest)/1e6:.1f} MB")
        return
    curl = shutil.which("curl") or shutil.which("curl.exe")
    if curl:
        tmp = dest + ".part"
        if os.path.exists(tmp):
            os.remove(tmp)
        cmd = [curl, "-L", "--fail", "--max-time", "900", "--retry", "3", "--retry-delay", "2", "-o", tmp, url]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"curl failed for {url}: {result.stderr[-300:]}")
        os.replace(tmp, dest)
    else:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
            shutil.copyfileobj(r, f)
    print(f"  saved {os.path.basename(dest)} {os.path.getsize(dest)/1e6:.1f} MB")


def ensure(model_size: str) -> str:
    root = os.path.join(CACHE, f"faster-whisper-{model_size}")
    os.makedirs(root, exist_ok=True)
    repo = f"Systran/faster-whisper-{model_size}"
    info = fetch_json(f"{MIRROR}/api/models/{repo}")
    files = [s["rfilename"] for s in info.get("siblings", []) if not s["rfilename"].startswith(".")]
    print(f"model {repo}: {len(files)} files -> {root}")
    for name in files:
        download(f"{MIRROR}/{repo}/resolve/main/{name}", os.path.join(root, name))
    return root


if __name__ == "__main__":
    size = sys.argv[1] if len(sys.argv) > 1 else "small"
    path = ensure(size)
    print("MODEL_DIR=" + path)
