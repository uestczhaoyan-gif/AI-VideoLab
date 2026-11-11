# explain-data 示例

一条 10 秒、720p、30 fps 的**数据解释示例**，验证 `explain-data` recipe 的本地半自动执行链：标题／副标题、4 组指标条、数值增长、单位、来源脚注、结尾 takeaway。

> **数据说明：content.json 里的数字是「示例数据，不是真实统计」**，只用于验证渲染与检查链路；不代表任何真实指标、趋势或结论。

## 文件

- `content.json`：导演内容（标题、副标题、4 组示例指标、单位、来源脚注、结尾 takeaway、时长／帧率）。`data_kind: "example"`，`source` 已明确写「示例数据」。
- `make-project.mjs`：根据 content 生成带 brief、`recipe_id = explain-data` 与三个待确认门的项目 JSON。

## 跑一遍

```sh
# 1. 生成项目（确认门均为 pending；不覆盖已有文件）
node examples/explain-data/make-project.mjs

# 2. 确认 Brief 门（依据必须写清楚；输出新文件，不覆盖）
node tools/project/cli.mjs gate --from .tmp/explain-data/example-explain-data/project.json \
  --id brief --basis "已核对示例 Brief、数据边界（示例数据不是真实统计）与规格" \
  --out .tmp/explain-data/example-explain-data/project-brief.json

# 3. 出 3 张风格帧并查看（brief 门未确认会失败）
node recipes/explain-data/run.mjs \
  --project .tmp/explain-data/example-explain-data/project-brief.json \
  --content examples/explain-data/content.json --stage stills

# 4. 看 .tmp/explain-data/example-explain-data/stills/ 和 style-frames.jpg，
#    确认后写 style_frame 门
node tools/project/cli.mjs gate --from .tmp/explain-data/example-explain-data/project-brief.json \
  --id style_frame --basis "已查看开场／中段／结尾要点三帧" \
  --out .tmp/explain-data/example-explain-data/project-style.json

# 5. 渲染全片并生成 QA 与项目新版本
node recipes/explain-data/run.mjs \
  --project .tmp/explain-data/example-explain-data/project-style.json \
  --content examples/explain-data/content.json --stage render
```

产物在 `.tmp/explain-data/example-explain-data/`：`explain-data.mp4`、`frames/`（300 张 PNG）、`storyboard.jpg`、`qa.json`、`brief.md`、`outline.md`、`project-vN.json/.md`、`report.json`。`export` 门保持 pending；`qa-content`、`qa-audio`、`qa-viewing`、`qa-accept` 保持 `not_checked`；无旁白字幕时 `qa-timing` 为 `waived`。

## 换成自己的内容

1. 改 `content.json` 的标题、副标题、图表（`chart.bars` 2–6 组）、单位、来源与结尾要点；保持 `duration`／`fps` 与项目 brief 一致。
2. 真实数据必须把 `data_kind` 改为 `"real"`，并在 `source` 写清出处、口径与日期；`data_kind: "example"` 时 `source` 必须含「示例数据」，否则执行器拒绝渲染。
3. 改 `make-project.mjs` 里的 `form`（主题、受众、目标、规格）后重新生成项目。
4. 不需要改执行器；不同内容只是同一模板的参数。

跑通流程**不代表**内容真实、声音合格或成片已被采用；这些检查在项目里保持 `not_checked`。
