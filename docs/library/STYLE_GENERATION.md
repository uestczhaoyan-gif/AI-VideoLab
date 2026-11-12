# 从资源 Prompt 生成视频代码（Agent）

0.3 起，视频代码由 Agent **每次从零写**；不存在“先为 51 个风格各写适配器”的路径。

```text
资源 STYLE.md / Prompt
  → Agent 读懂视觉语言与用户 Brief
  → 生成当前这一条视频的 scene.html（新代码）
  → npm run render:agent -- --project <任务目录> --stage stills
  → 用户看风格帧
  → npm run render:agent -- --project <任务目录> --stage render
```

不同模型、不同次生成会有不同结果，这是预期；不要复制旧 scene/recipe/style。

## Agent 操作

1. 选定资源参考：

   ```sh
   npm run make -- --topic "..." --suggest
   ```

   或读 `docs/library/TEMPLATE_MAP.md` 找到 `prompt_path`。没有同名模板是正常的，选最接近的视觉语言即可，不要停下来反问。

2. 创建任务（如果还没有）：

   ```sh
   npm run make -- --topic "..." --duration 10
   ```

3. 在任务目录写 `scene.html`：
   - 自包含，不联网，不使用未授权素材/字体；
   - 读取 `video.json` 的 duration/fps/width/height（或内联同值）；
   - 必须定义 `window.render(t)`，相同 t 得到相同画面；
   - 不依赖 Date、Math.random、浏览器默认动画；
   - 标题、步骤、事实按用户需求写。

4. 出风格帧：

   ```sh
   npm run render:agent -- --project projects/<目录> --stage stills
   ```

5. 用户确认后渲染：

   ```sh
   npm run render:agent -- --project projects/<目录> --stage render
   ```

## 给 Agent 的 Prompt 模板

```text
你是导演、视觉设计与动画工程师。请根据 BRIEF.md、RESOURCES.md 和选中的资源 Prompt，
为这条视频从零写一个确定性 HTML 场景（不要复制仓库里旧的固定模板）。
输出到 <任务目录>/scene.html。

硬性要求：
- 自包含 HTML/CSS/SVG/JS；不联网；不使用未授权素材/字体
- 定义 window.render(t)，t 单位秒；相同 t 必须得到相同画面
- 不依赖 Date、Math.random、网络请求、浏览器默认动画
- 画面、文字、步骤来自本次 Brief；不确定的事实先问用户
- 先能出三张风格帧，再优化完整动画
```

## 旧路径

`recipes/code-motion` 与旧的 `--style-file` 只是 0.2 的确定性回归测试夹具；0.3 主流程不使用，也不要再新增固定风格适配器。
