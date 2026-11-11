# code-motion 示例

一条 10 秒、720p、30 fps 的代码动效：用「一条时间表驱动画面与声音」做例子，验证 catalog 第一条 recipe 的本地半自动执行链。示例只用于验证流程，不代表成片质量或风格上限。

## 文件

- `content.json`：导演内容（标题、副标题、3 个步骤卡、页脚、时长／帧率）。
- `make-project.mjs`：根据 content 生成带 brief、recipe 选择与三个待确认门的项目 JSON。

## 跑一遍

```sh
# 1. 生成项目（确认门均为 pending）
node examples/code-motion/make-project.mjs

# 2. 确认 Brief 门（依据必须写清楚；输出新文件，不覆盖）
node tools/project/cli.mjs gate \
  --from .tmp/recipe-runs/example-code-motion/project.json \
  --id brief --basis "已核对示例 Brief 与内容边界" \
  --out .tmp/recipe-runs/example-code-motion/project-brief.json

# 3. 出风格帧并查看
node recipes/code-motion/run.mjs \
  --project .tmp/recipe-runs/example-code-motion/project-brief.json \
  --content examples/code-motion/content.json --stage stills

# 4. 看 .tmp/recipe-runs/example-code-motion/stills/ 和 style-frames.jpg，
#    确认后写 style_frame 门
node tools/project/cli.mjs gate \
  --from .tmp/recipe-runs/example-code-motion/project-brief.json \
  --id style_frame --basis "已查看风格帧" \
  --out .tmp/recipe-runs/example-code-motion/project-style.json

# 5. 渲染全片并生成 QA 与项目新版本
node recipes/code-motion/run.mjs \
  --project .tmp/recipe-runs/example-code-motion/project-style.json \
  --content examples/code-motion/content.json --stage render
```

产物在 `.tmp/recipe-runs/example-code-motion/`：`code-motion.mp4`、`frames/`（300 张 PNG）、`storyboard.jpg`、`qa.json`、`project-vN.json/.md`。`export` 门保持 pending；`qa-audio`、`qa-viewing`、`qa-accept` 保持 `not_checked`。

## 换成自己的内容

1. 改 `content.json` 的标题、副标题、步骤卡与时长；保持 `duration`／`fps` 与项目 brief 一致。
2. 改 `make-project.mjs` 里的 `form`（主题、受众、目标、规格）后重新生成项目。
3. 不需要改执行器；不同内容只是同一模板的参数。

示例内容本身没有事实性数字或可争议结论，但**不因为流程跑通就代表内容、声音、完整观看或用户采用已验收**。
