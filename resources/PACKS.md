# 资源上传与恢复

资源快照约 **2.1 GB**，不能直接塞进普通 Git 仓库：GitHub 单文件 100 MB，仓库建议 <1 GB。`resources/**/source/` 被 `.gitignore` 排除，不是遗漏。

用户仍有三种拿到完整资源的方式：

## 方式 A：从 GitHub Release 下载（推荐）

仓库的 Release 附件携带按分类打包的 **7 个 ZIP**（prompts 文本已在 Git 中，不重复打包）：

| ZIP | 约大小 |
| --- | ---: |
| `styles`（LEMO 51 + MG 15） | 1.4 GB |
| `engines`（manim / hyperframes / anidoodle / onetake / video-shotcraft） | 531 MB |
| `prompt-libraries`（CAP 341 + fifi） | 89 MB |
| `collections`（三个作品索引） | 83 MB |
| `skills`（auto-motion / manim-skill / open-design / remotion-skills / claudian） | 69 MB |
| `studies`（anatomy） | 14 MB |
| `workflows`（ai-promo / Table-VideoSOP） | 1 MB |

生成：

```sh
npm run resources:pack
# 输出 dist/resources/videolab-resources-<category>-<date>.zip
```

在 GitHub → Releases → 对应版本 → Edit → 上传这些 ZIP。用户下载后：

```sh
unzip videolab-resources-styles-*.zip -d resources/
```

这样仓库本身轻，用户仍能拿到全部模板、Prompt、引擎源码与演示媒体；不必把 2.1 GB 写进 Git 历史。

## 方式 B：一条命令从上游恢复

```sh
npm run resources:fetch -- --dry-run       # 看将下载什么
npm run resources:fetch -- --only P05,P13   # 先恢复两个轻量仓库
npm run resources:fetch                     # 恢复全部 19 个（P12 默认跳过）
```

脚本使用 [resources/MANIFEST.json](MANIFEST.json) 的固定 commit，从 GitHub codeload 下载并解压到 `resources/<category>/<name>/source/`。P12 Open Design 上游约 3.6 GB，只有可读部分，默认跳过；需要全量时用 `--include-partial`。

## 方式 C：Git LFS（不推荐）

GitHub 免费 LFS 额度约 1 GB，装不下 2.1 GB；且克隆成本高。除非你已购买 LFS 流量，否则优先 Release 附件。

## 仓库里应该提交什么

- 提交：`resources/README.md`、`resources/AUDIT.md`、`resources/MANIFEST.json`、`resources/MANIFEST.md`、`resources/PACKS.md`、`resources/PROMPTS.md`、`resources/prompts/`、各分类的 README/许可说明。
- 不提交：`resources/**/source/`、`resources/**/preview/`、`dist/`。
- 不要用 `git add -f` 绕过忽略；否则仓库会超过 GitHub 限制。

## 许可

资源包仍受各上游许可约束，打包不等于获得再分发/商用授权：

- P16 Onetake：PolyForm Noncommercial 1.0.0，不能默认商用。
- CAP（P09）：混合来源/免费分享约定，不是统一 MIT。
- MG、LEMO、video-shotcraft 的代码许可不自动覆盖素材、字体、音效与品牌资产。
- P12 只保存可读部分；P22 为 Apache-2.0 代码、素材另计。

详见 [MANIFEST.md](MANIFEST.md) 与 [AUDIT.md](AUDIT.md)。
