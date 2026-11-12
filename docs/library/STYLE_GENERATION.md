# 即时生成风格（Agent 路径）

风格不一定要“提前为每个模板写适配器”。有两种做法：

1. **CLI 内置**：3 个确定性 HTML 模板（blueprint / bauhaus / ink-wash），不调用模型，`npm run make` 直接渲染。
2. **Agent 即时生成**：Agent 读取资源里的 STYLE.md/Prompt，按主题生成一份新的确定性 HTML，交给 CLI 的 `--style-file` 渲染。这是“模板 → 主题 → 代码 → 视频”的即时路径。

当前 `npm run make` 本身不调用模型/API，所以没有第 2 条路径时，只能先用第 1 条；这不是说每个主题都要提前做适配器，而是“谁来写代码”的差别。

## Agent 操作步骤

```text
1. 选定一个资源模板：
   npm run make -- --topic "主题" --suggest
   或读 docs/library/TEMPLATE_MAP.md，找到 prompt_path。

2. 让 Agent 读该 Prompt/STYLE.md + 本说明，生成一个 HTML 文件：
   - 必须包含 <script>const C = __CONTENT_JSON__;</script>
   - 必须定义 window.render(t)，相同 t 得到相同画面
   - 不依赖 Date/random/网络/外部字体
   - 画面/步骤/文字全部来自 C（标题、subtitle、steps、duration、fps）

3. 保存到例如：
   .\my-styles\optical-nonlinear.html

4. 交给 CLI 渲染：
   npm run make -- --topic "做一个非线性光学的视频" --style-file .\my-styles\optical-nonlinear.html

5. 看风格帧确认；不满意就把风格帧与修改意见交回 Agent 改 HTML。
```

## 给 Agent 的生成提示（可直接复制）

```text
你是一个逐帧渲染器作者。请把下面 STYLE.md / Prompt 的视觉语言，改写成一个 16:9、
1280×720、30fps 的确定性 HTML 模板，供 VideoLab code-motion 执行器使用。

资源风格文件：<prompt_path>
本次主题：<topic>
本次内容字段：title / subtitle / steps[3] / duration / fps / specTitle / specSubtitle

硬性要求：
- 只输出一个完整 HTML 文件；包含 <script>const C = __CONTENT_JSON__;</script>
- 定义 window.render(t)，t 单位秒；相同 t 必须得到相同画面
- 不使用 Date、Math.random、网络请求、外部字体/图片/音频
- 所有文字、步骤、时长、规格从 C 读取；不要硬编码本主题之外的事实
- 视觉上必须能看出 STYLE.md 的特征；不要只换颜色
- 先输出风格帧可读的静态构图，再让 render(t) 做有限动画

输出文件：<你的路径>.html
```

## 用 Agent 生成非线性光学风格

```text
读取 resources/prompts/lemo/blueprint/STYLE.md。
为“非线性光学：光如何改写介质”生成一个 HTML 模板：
深蓝工程蓝图底，泵浦光进入 χ(2)/χ(3) 介质，出射 2ω、ω1/ω2、ω 三束光；
标题/步骤来自 C；确定性 render(t)。
保存到 projects\nonlinear\custom-style.html。
```

然后：

```sh
npm run make -- --topic "做一个非线性光学的视频" --style-file projects\nonlinear\custom-style.html
```

## 边界

- 生成代码可能失败或效果差；必须看风格帧，必要时重生成；`--style-file` 不做风格审核。
- 这是本地 Agent + 用户自己的模型/密钥；CLI 本身仍不调用付费 API。
- 资源 Prompt 只作风格参考，不要把上游完整 Prompt 重新分发；遵守 `resources/AUDIT.md` 的许可说明。
