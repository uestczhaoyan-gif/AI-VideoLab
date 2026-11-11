# 统一制作规范与资源路由（整合层）

状态：`2026-11-09` 首版。目的：把分散的 catalog 资源、来源笔记、Prompt、上游工程和我们自己的三条本地执行器，收成**一套可校验的路由**，而不是让用户在不同仓库之间自己拼。

入口：[视频 Workflow 总表](VIDEO_WORKFLOWS.md) · [catalog](../../catalog/README.md) · [PROJECT](../../PROJECT.md)

## 一条统一流水线

```text
想法 / Brief（人）
  → 路由：选择 recipe + 资源包（工具）
  → 3 张风格帧（人确认）
  → 制作：本地执行器或外部工具（工具）
  → 机械 QA + 人工内容/声音/完整观看（人+工具）
  → 导出：成片、项目 JSON、确认门记录（人）
```

六个阶段共用同一份项目契约（`shared/project.schema.json`）：三处确认门（Brief / 风格帧 / 导出）、四类文档引用、8 项 QA。无论走哪条 recipe，都不允许跳过确认门或把 `not_checked` 当通过。

## 三条已接线的 recipe

| 路由 | 适用 | 本地执行器 | 已验证产物 | 主要限制 |
| --- | --- | --- | --- | --- |
| `code-motion` | 文字/图形卡点动效、片头、风格片段 | `recipes/code-motion/run.mjs` | 10 s / 1280×720 / 30 fps / 300 帧全唯一 / H.264+AAC | 无生成式素材、角色、真人；CLI 可直接生成 |
| `explain-data` | 固定横向条形图的数据解释 | `recipes/explain-data/run.mjs` | 10 s / 1280×720 / 30 fps / 300 帧全唯一 / H.264+AAC | 仅固定图表版式；不验证数据真实性 |
| `real-product` | 真实产品截图包装 | `recipes/real-product/run.mjs` | 10 s / 1280×720 / 30 fps / 300 帧全唯一 / H.264+AAC | 只包装真实截图；不生成 UI、不录屏 |

`code-motion` 还接入了三个风格模板（`--style blueprint|bauhaus|ink-wash`），分别改写自 LEMO blueprint、MG 09-bauhaus、LEMO ink-wash；这是把资源模板变成**可执行视觉语言**的第一层适配，不是全部 408 条模板的一键执行。三个 20 秒光学 demo 见 `demos/optics-2026-11-11/`。

三条执行器接口一致：

```sh
node recipes/<id>/run.mjs --project <项目.json> --content <content.json> --stage stills|render --out <目录>
```

都必须先确认 Brief 才能出风格帧、确认风格帧才能渲染；把 QA 写回项目新版本，`export` 门保持 pending。

## 资源访问等级（38 个来源）

| 等级 | 数量 | 含义 | 例子 |
| --- | --- | --- | --- |
| `reference` | 14 | 视频证据/方法参考，不能直接调用 | V01–V14 |
| `prompt` | 3 | Prompt/风格库，可由当前模型写进执行器内容 | P09（341 条）、P02（15 条）、P03 |
| `install_required` | 14 | 有代码/引擎/Skill，但需安装、验证、许可核对 | P05–P08、P11–P18、P22、LEMO |
| `index_only` | 7 | 只有文档/站点/索引/外链 | P01、P04、P10、P19–P21、P23 |
| `blocked` | 0 | 当前无条目被判为完全不可用（P16 记 install_required + 非商业限制） | — |

**prompt-usable entries：356**（341 条 CAP + 15 条 MG15）。它们可以被路由成“导演内容”，但仍要当前模型写代码/文案，不是自动渲染。

本地资源快照的固定版本、大小与恢复方式见 [resources/MANIFEST.md](../../resources/MANIFEST.md) 与 [resources/PACKS.md](../../resources/PACKS.md)。`npm run resources:fetch` 从上游恢复快照；`npm run resources:pack` 生成按分类的 Release ZIP。资源约 2.1 GB，不进入 Git 历史。

## 路由判断

`tools/catalog/route.mjs` 按用途与关键词推荐：

- 数据/图表/统计/机制 → `explain-data`
- 产品/截图/界面/功能/演示/落地页 → `real-product`
- 动效/片头/转场/代码动画/风格 → `code-motion`
- 其他 → `code-motion` 兜底
- 同时输出备选，不删除其他路线

```sh
npm run route -- --topic "用三个指标解释缓存命中率" --purpose education
npm run route -- --topic "产品截图演示" --purpose product --json
npm run integration:check
npm run integration:build
```

## “能调用所有资源”怎么落地

**不是**把所有上游仓库都装一遍、假装都能跑。整合层用可验证的等级表达真实边界：

- **3 条 recipe**：本地执行器已实测（stills→render、确认门、QA 写回）。
- **356 条 Prompt 条目**：路由把它们作为导演/风格输入；由当前 CLI 模型写成 `content.json`，执行器只渲染。
- **14 个 install_required 资源**：源码大多已下载到 resources/（见 [resources/AUDIT.md](../../resources/AUDIT.md)），但未安装/运行；没有安装与渲染证据之前，不标记为可执行。
- **7 个 index_only**：只作参考/索引。
- **14 个 reference**：只作方法证据，不能直接出片。

`npm run integration:check` 会验证：所有 38 个来源都有访问记录、410 个模板的 source_id 都存在、3 条路由的 recipe 可执行且适配器文件存在、`catalog/integration.json` 与生成逻辑一致。它不会把 `install_required` 说成已安装。

## 扩展方式

1. 新增来源：按 [来源模板](templates/SOURCE.md) 写笔记 → `tools/catalog/import.mjs` 自动生成 source。
2. 在 `tools/catalog/integration.mjs` 的 `ACCESS` 里登记访问等级；在 `ROUTES` 里决定是否进入资源包。
3. 若新增可执行 recipe：在 `catalog/seed.mjs` 写 `runnable` + `adapter`；在 `integration.mjs` 加 route；必须有 `examples/<id>/` 和实测证据。
4. 运行 `npm run catalog:import`、`npm run integration:build`、`npm run integration:check`、`npm test`、`npm run docs:check`。

## 未完成与边界

- `explain-data` / `real-product` 已通过 CLI 直接生成。
- `install_required` 的 14 个资源没有安装/运行证据；`P22 video-shotcraft` 只做了 README/SKILL/两张预览的只读快照，未克隆/渲染。
- 路线推荐是规则匹配，不理解完整语义；用户可改用途/recipe。
- 所有资源许可仍需逐项复核；Apache-2.0 只覆盖代码，不自动覆盖仓库素材、字体、音效与品牌资产。
- 本文件只定义整合与验证口径，不改 `PROJECT.md` 的阶段排期。
