# 上传到 GitHub

当前仓库：<https://github.com/uestczhaoyan-gif/AI-VideoLab>（`origin` 已配置）。以下命令在仓库根目录执行；本仓库当前**没有提交、也没有推送**。

## 1. 上传前检查

```sh
git status --short
git diff --stat
git ls-files | grep -E 'resources/.*/source/|\.env|projects/' || true
```

确认：

- `resources/**/source/`、`projects/`、`.tmp/`、`.venv/` 都没有被 `git add`。
- 没有 API Key、`.env`、私人稿件、用户截图、渲染帧、日志。
- `resources/` 只提交 `README.md`、`AUDIT.md`、各分类的说明与许可证文件；大仓库快照留在本地。
- `npm test`、`npm run integration:check`、`npm run docs:check` 通过。

## 2. 初始化提交（本地）

```sh
git add -A
git status --short
git commit -m "release: VideoLab 0.2 CLI-only"
```

如果只想先看差异、不提交：

```sh
git diff --cached --stat
```

## 3. 推送到远端

先确认远端：

```sh
git remote -v
git branch --show-current
```

如果远端 `main` 还是历史重写前的旧提交，普通推送会被拒绝。**确认要覆盖远端历史后**（会改变远端已有提交）再执行：

```sh
git push -u origin main
# 若提示 non-fast-forward，且你确认以本地为准：
git push --force-with-lease origin main
```

如果不想覆盖旧历史，更安全的做法是新建一个空仓库（例如 `videolab-cli`），再：

```sh
git remote set-url origin https://github.com/<你的账号>/videolab-cli.git
git push -u origin main
```

不确定远端状态时先 `git fetch origin && git log --oneline origin/main -3`，不要直接 force。

## 4. 打标签与 Release

```sh
git tag -a v0.2.0 -m "VideoLab 0.2: CLI-only publishable preview"
git push origin v0.2.0
```

在 GitHub → Releases → Draft a new release：

### 上传完整资源包（重要）

仓库内已提交 `resources/prompts/`（约 2.7 MB：LEMO 51 个风格、MG 15 条 Prompt、video-shotcraft 125 张镜头卡等文本）。其余 **2.1 GB** 的源码与媒体不进 Git。

仓库不直接提交 2.1 GB 的 `resources/**/source/`（GitHub 单文件 100 MB、仓库建议 <1 GB）。先生成按分类的 ZIP，再作为 Release assets 上传：

```sh
npm run resources:pack
ls dist/resources/*.zip
```

可以用 GitHub CLI 一次上传：

```sh
gh release create v0.2.0 --title "VideoLab 0.2 — CLI-only" --notes-file docs/RELEASE_NOTES.md
gh release upload v0.2.0 dist/resources/*.zip
```

或在网页编辑 Release，把 `dist/resources/videolab-resources-<category>-*.zip` 逐个上传为附件。用户下载后解压到 `resources/`，即可获得模板、Prompt、引擎与演示媒体。仓库内的 `resources/MANIFEST.md` / `resources/PACKS.md` 记录了固定版本、大小与恢复命令。

Release 说明还应写：

- 选择 `v0.2.0`；
- 标题：`VideoLab 0.2 — CLI-only`；
- 说明写清：三条本地 recipe、无网页 UI、资源需按 `resources/README.md` 恢复、`resources/AUDIT.md` 的 checked 不代表已跑通；
- 不把 `resources/**/source/` 直接 `git add`；通过 Release assets 上传分类 ZIP。
- `resources/prompts/`（文本）可直接提交；`resources/**/source/`（媒体/源码）不提交。
- 不上传生成视频或私人素材。

## 5. 上传后验证

在一台干净机器/新目录：

```sh
git clone https://github.com/uestczhaoyan-gif/AI-VideoLab.git
cd AI-VideoLab
npm ci --ignore-scripts
npm test
npm run catalog:check
npm run integration:check
npm run make -- --topic "一段 5 秒测试动效" --duration 5 --yes
```

最后一条需要本机 Chrome/Edge 与 ffmpeg；如果失败，检查 `VIDEOLAB_BROWSER` / `FFMPEG`，而不是重新引入网页服务。

## 6. 不要上传的东西

- `resources/**/source/`（上游仓库/媒体，体积大且许可各异）
- `projects/`、`.tmp/`、`.venv/`、`node_modules/`
- 任何密钥、私人截图、未公开稿件、模型日志与账单
- 生成的 mp4/帧（如确需演示，只放少量压缩截图并注明来源）
