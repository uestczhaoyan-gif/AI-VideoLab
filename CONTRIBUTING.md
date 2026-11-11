# 参与与复现

VideoLab 是本地优先的 CLI AI 视频制作平台。当前范围与阶段见 [PROJECT.md](PROJECT.md)，AI 交接见 [AGENTS.md](AGENTS.md)，资料入口见 [docs/library/README.md](docs/library/README.md)。

## 开发环境

```sh
npm ci --ignore-scripts
npm run catalog:check
npm test
npm run recipe:check
npm run docs:check
npm run resources:audit
```

真实制作还需要本机 Chrome/Edge 与 ffmpeg：

```sh
npm run make -- --topic "一段测试动效" --yes
```

## 代码结构

- `tools/studio/create.mjs`：CLI 交互与制作编排。
- `shared/planning.mjs`：项目构建、类型推荐；`shared/project.*`：契约、确认门、QA。
- `recipes/<id>/`：三条本地执行器；必须保持 `--project --content --stage stills|render --out` 接口。
- `catalog/`：来源/模板/recipe/整合 registry；改动后运行 `npm run catalog:import` 与 `npm run integration:build`。
- `resources/`：分类资源库；`source/` 不入库，不 `git add -f`。
- `docs/`：Workflow、来源笔记、整合规范与手册。

## 修改规则

- 不重新引入网页 UI；平台是 CLI-only。
- 来源 ID（Vxx/Pxx）保持稳定；新增来源按 [来源模板](docs/library/templates/SOURCE.md) 登记。
- 不删除原始证据与失败记录；新增资源只从固定版本恢复，记录许可与抽检状态。
- 确认门、`not_checked` 语义不能放宽；不得用抽帧或渲染成功冒充完整验收。
- 新资源先登记到 `resources/README.md` 与 `resources/AUDIT.md`，再谈“可用”。
- 提交前跑 `npm test`、`npm run integration:check`、`npm run docs:check`；改动 recipe 时跑一次 `npm run make -- --yes`。

## 许可

仓库代码许可见 [LICENSE](LICENSE)。上游资源许可见各自 LICENSE 与 [resources/README.md](resources/README.md)；Apache/MIT 不自动覆盖素材、字体、音效、品牌资产。
