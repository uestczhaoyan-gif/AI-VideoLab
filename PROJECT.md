# PROJECT：VideoLab Agent-led 版

状态：**0.3 Agent-led。** CLI 不再直接套模板出片；每次视频由用户的 AI Agent（DSH / Pi / Codex / Claude）读取 Brief 与资源库后，从零写代码；VideoLab 只负责资源、渲染与机械 QA。

## 1. 产品定义

一句话：**本地优先的 Agent-led AI 视频项目：资源库负责参考，Agent 负责创作，CLI 负责渲染。**

目标流程：

```text
npm run make -- --topic "..."
  → 生成 Brief、资源候选、AGENT_TASK.md、video.json
  → 用户把项目交给自己的 Agent
  → Agent 从零写 scene.html（或自选本地工程）
  → npm run render:agent -- --stage stills
  → 用户看风格帧
  → npm run render:agent -- --stage render
  → mp4 + storyboard + report/qa
```

不做：固定风格适配器、模板填空视频、网页工作台、视频预览 UI、平台内模型调用/API 代理、真人短剧、模型训练。

## 2. 当前范围

### 已有

- `npm run make`：只生成 **Agent 任务**，不渲染。
- `npm run render:agent`：通用 Chrome 逐帧抓取 + ffmpeg 编码 + 机械 QA；不写视频代码。
- 资源库 20 个仓库/索引、约 2.1 GB；仓库内提交 `resources/prompts/` 详实 Prompt 文本。
- 410 个模板 → Prompt → Workflow 映射；38 个来源。
- 机械测试与契约检查随代码变化。
- 通过 GitHub Release 分发 2.1 GB 资源；`resources:fetch` 从固定 commit 恢复。

### 不再作为主路径

- 旧的固定 recipe / 固定 HTML 风格 / `--style` 选择器：仅保留为回归测试或历史代码，不再由 `npm run make` 使用。**不要继续给它们做新适配器。**
- 不再以“逐条做 demo 视频”验证资源；资源可用性靠映射与 Audit。

## 3. 用户与 Agent 的分工

| 角色 | 负责 |
| --- | --- |
| 用户 | 主题、受众、事实边界、风格偏好、看风格帧、完整观看、采用 |
| Agent | 读懂 Brief、选资源 Prompt、写代码、出风格帧、按反馈重写 |
| VideoLab CLI | 生成任务、资源候选、抓帧、编码、机械 QA；不决定创意 |

不同 Agent/模型会产生不同实现，这是预期结果，不是缺陷。

## 4. 阶段

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 0 | 来源、catalog、资源恢复 | 完成 |
| 1 | 固定 recipe 验证渲染链 | 历史；保留测试 |
| 2 | CLI-only 发布 | 完成（0.2） |
| 3 | Agent-led 任务与通用渲染 | **当前 0.3** |
| 4 | 资源 Release、Prompt 入库、模板映射 | 完成 |
| 5 | 多个 Agent/模型的效果对照与反馈 | 后续 |
| 6 | 自动选择/调用 Agent | 有 API 与用户授权后再做 |

## 5. 验证

```sh
npm test
npm run catalog:check
npm run catalog:map:check
npm run integration:check
npm run docs:check
npm run resources:audit
```

Agent 流程至少验证：`make` 生成的 `AGENT_TASK.md`/`video.json` 完整；`render:agent --stage stills` 可出风格帧；`render:agent --stage render` 可出 mp4 与 QA。不要求每个模板都做视频。

## 6. 资源与许可

- `resources/**/source/` 不入 Git；Release ZIP 或 `resources:fetch`。
- 资源是参考，不是平台可执行承诺；P16 非商业，CAP 混合许可，P12 部分，P22 素材另计。
- 不把下载资源重新分发为“平台能力”；Agent 使用前核对许可。

## 7. 下一步

1. 增加 `--agent` 任务启动适配（DSH/Pi/Codex/Claude 各自命令由用户配置；CLI 不内置密钥）。
2. 让 `render:agent` 支持 Agent 自选 Remotion/Manim 产物并统一 QA。
3. 收集不同模型对同一 Brief 的结果差异，作为效果对照（不预设“最优风格”）。
4. 不再新增固定风格适配器；如确实需要，作为独立插件，不进入主 `make`。
