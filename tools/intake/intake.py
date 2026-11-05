#!/usr/bin/env python3
"""VideoLab source intake helper (local research only).

Given a Bilibili BV id, this tool:
  1. fetches public metadata / chapters / subtitle availability;
  2. resolves the anonymous low-resolution DASH streams;
  3. downloads video and audio tracks into an ignored evidence directory;
  4. decodes frames at a fixed interval with OpenCV;
  5. transcribes the audio locally with faster-whisper (no upload).

It never logs in, never reads browser credentials, never republishes media, and
writes every artifact into the git-ignored `docs/theory/_evidence/` tree.
The generated notes are human-written; this tool only produces raw evidence.

Usage:
  python tools/intake/intake.py BV1ztH96uE1Z
  python tools/intake/intake.py BV1ztH96uE1Z --frame-interval 10 --model small
  python tools/intake/intake.py BV1ztH96uE1Z --skip-asr --skip-download
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.request

# The local network cannot reach huggingface.co directly and the xet transfer
# backend stalls on the mirror; both are documented in tools/intake/README.md.
# These defaults only affect this helper's model download, never the media fetch.
os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0 Safari/537.36"
)
HEADERS = {"User-Agent": UA, "Referer": "https://www.bilibili.com/"}
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EVIDENCE = os.path.join(ROOT, "docs", "theory", "_evidence", "batch03")


def api(url: str) -> dict:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def download(url: str, dest: str, referer: str = "https://www.bilibili.com/") -> None:
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"  exists: {os.path.relpath(dest, ROOT)}")
        return
    req = urllib.request.Request(url, headers={**HEADERS, "Referer": referer})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
    print(f"  saved: {os.path.relpath(dest, ROOT)} ({os.path.getsize(dest)/1e6:.1f} MB)")


def pick_tracks(playurl: dict) -> tuple[str | None, str | None, dict]:
    """Pick the best accessible video + audio track from a DASH playurl payload."""
    dash = (playurl.get("data") or {}).get("dash") or {}
    videos = [v for v in (dash.get("video") or []) if v.get("baseUrl") or v.get("base_url")]
    audios = [a for a in (dash.get("audio") or []) if a.get("baseUrl") or a.get("base_url")]
    # Prefer AVC (broad decoder support), then lower id (smaller, anonymous-safe).
    videos.sort(key=lambda v: (0 if (v.get("codecs") or "").startswith("avc") else 1, -(v.get("id") or 0)))
    avc = [v for v in videos if (v.get("codecs") or "").startswith("avc")]
    chosen_video = avc[0] if avc else (videos[0] if videos else None)
    chosen_audio = audios[0] if audios else None
    info = {
        "video": None if not chosen_video else {
            "id": chosen_video.get("id"), "codecs": chosen_video.get("codecs"),
            "width": chosen_video.get("width"), "height": chosen_video.get("height"),
            "bandwidth": chosen_video.get("bandwidth"),
        },
        "audio": None if not chosen_audio else {
            "id": chosen_audio.get("id"), "codecs": chosen_audio.get("codecs"),
            "bandwidth": chosen_audio.get("bandwidth"),
        },
        "available_video_ids": sorted({v.get("id") for v in videos}, reverse=True),
    }
    return (
        (chosen_video.get("baseUrl") or chosen_video.get("base_url")) if chosen_video else None,
        (chosen_audio.get("baseUrl") or chosen_audio.get("base_url")) if chosen_audio else None,
        info,
    )


def extract_frames(video_path: str, out_dir: str, interval: float) -> list[dict]:
    import cv2

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total / fps if fps else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    os.makedirs(out_dir, exist_ok=True)
    frames = []
    t = 0.0
    while t < duration:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, frame = cap.read()
        if ok:
            name = f"t{int(t):05d}.jpg"
            cv2.imwrite(os.path.join(out_dir, name), frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
            frames.append({"t": round(t, 2), "file": name})
        t += interval
    cap.release()
    return {
        "fps": round(fps, 3), "frames": total, "duration": round(duration, 3),
        "width": width, "height": height, "interval": interval,
        "sampled": len(frames), "items": frames,
    }


def model_path(model_size: str) -> str:
    """Resolve a local CTranslate2 model directory before asking the Hub."""
    if os.path.isdir(model_size):
        return model_size
    local = os.path.join(
        os.path.expanduser("~"), ".cache", "videolab-models", f"faster-whisper-{model_size}"
    )
    if os.path.exists(os.path.join(local, "model.bin")):
        return local
    return model_size


def transcribe(audio_path: str, out_dir: str, model_size: str, language: str = "zh") -> dict:
    from faster_whisper import WhisperModel

    t0 = time.time()
    model = WhisperModel(model_path(model_size), device="cpu", compute_type="int8", cpu_threads=8)
    segments, info = model.transcribe(
        audio_path,
        language=language,
        vad_filter=True,
        beam_size=5,
        condition_on_previous_text=False,
    )
    items = []
    for seg in segments:
        items.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": seg.text.strip()})
    elapsed = time.time() - t0

    with open(os.path.join(out_dir, "asr.json"), "w", encoding="utf-8") as f:
        json.dump({
            "model": model_size, "language": info.language,
            "language_probability": round(info.language_probability, 4),
            "duration": round(info.duration, 2), "elapsed_s": round(elapsed, 1),
            "segments": items,
        }, f, ensure_ascii=False, indent=2)

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "asr.txt"), "w", encoding="utf-8") as f:
        for it in items:
            m0, s0 = divmod(int(it["start"]), 60)
            f.write(f"[{m0:02d}:{s0:02d}] {it['text']}\n")

    def ts(sec: float) -> str:
        h, rem = divmod(sec, 3600)
        m, s = divmod(rem, 60)
        return f"{int(h):02d}:{int(m):02d}:{s:06.3f}".replace(".", ",")

    with open(os.path.join(out_dir, "asr.srt"), "w", encoding="utf-8") as f:
        for i, it in enumerate(items, 1):
            f.write(f"{i}\n{ts(it['start'])} --> {ts(it['end'])}\n{it['text']}\n\n")

    return {"segments": len(items), "elapsed_s": round(elapsed, 1),
            "speed_x": round(info.duration / elapsed, 2) if elapsed else None,
            "model": model_size}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("bvid")
    ap.add_argument("--frame-interval", type=float, default=10.0)
    ap.add_argument("--model", default="small")
    ap.add_argument("--skip-download", action="store_true")
    ap.add_argument("--skip-frames", action="store_true")
    ap.add_argument("--skip-asr", action="store_true")
    ap.add_argument("--out", default=EVIDENCE)
    args = ap.parse_args()

    work = os.path.join(args.out, args.bvid)
    os.makedirs(work, exist_ok=True)

    print(f"[{args.bvid}] metadata")
    view = api(f"https://api.bilibili.com/x/web-interface/view?bvid={args.bvid}")
    d = view["data"]
    pages = d.get("pages") or [{}]
    cid = pages[0].get("cid")
    player = api(f"https://api.bilibili.com/x/player/v2?aid={d['aid']}&cid={cid}")
    sub = ((player.get("data") or {}).get("subtitle") or {})
    meta = {
        "bvid": d["bvid"], "title": d["title"], "author": d["owner"]["name"],
        "mid": d["owner"]["mid"], "duration": d["duration"], "pubdate": d["pubdate"],
        "aid": d["aid"], "cid": cid, "pages": [{"cid": p.get("cid"), "part": p.get("part"), "duration": p.get("duration")} for p in pages],
        "desc": d.get("desc"),
        "chapters": [{"from": c.get("from"), "to": c.get("to"), "content": c.get("content")} for c in ((player.get("data") or {}).get("view_points") or [])],
        "subtitle": {"allow_submit": sub.get("allow_submit"), "count": len(sub.get("subtitles") or []),
                     "items": [{"lan": s.get("lan"), "lan_doc": s.get("lan_doc")} for s in (sub.get("subtitles") or [])]},
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    }
    with open(os.path.join(work, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"  {meta['title']} | {meta['author']} | {meta['duration']}s | chapters={len(meta['chapters'])}")

    manifest: dict = {"bvid": args.bvid, "metadata": "metadata.json"}
    if not args.skip_download:
        print("[download] playurl")
        pj = api(
            "https://api.bilibili.com/x/player/playurl"
            f"?bvid={args.bvid}&cid={cid}&qn=64&fnval=16&fourk=1"
        )
        vurl, aurl, track_info = pick_tracks(pj)
        if not vurl:
            print("  no accessible DASH video track (anonymous limit?)", file=sys.stderr)
            return 2
        vpath = os.path.join(work, "video.mp4")
        apath = os.path.join(work, "audio.m4a") if aurl else None
        download(vurl, vpath)
        if apath:
            download(aurl, apath)
        manifest["tracks"] = track_info
        manifest["files"] = {
            "video": {"path": "video.mp4", "bytes": os.path.getsize(vpath), "sha256": sha256(vpath)},
        }
        if apath:
            manifest["files"]["audio"] = {"path": "audio.m4a", "bytes": os.path.getsize(apath), "sha256": sha256(apath)}

    if not args.skip_frames and os.path.exists(os.path.join(work, "video.mp4")):
        print(f"[frames] every {args.frame_interval}s")
        info = extract_frames(os.path.join(work, "video.mp4"), os.path.join(work, "frames"), args.frame_interval)
        manifest["frames"] = {k: v for k, v in info.items() if k != "items"}
        manifest["frames"]["items"] = info["items"]
        print(f"  {info['sampled']} frames from {info['duration']}s @ {info['width']}x{info['height']}")

    if not args.skip_asr and os.path.exists(os.path.join(work, "audio.m4a")):
        print(f"[asr] faster-whisper {args.model}")
        manifest["asr"] = transcribe(os.path.join(work, "audio.m4a"), work, args.model)
        print(f"  {manifest['asr']}")

    with open(os.path.join(work, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("done:", os.path.relpath(work, ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
