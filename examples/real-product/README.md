# real-product 示例：真实截图包装

用 **你自己的真实产品截图**做一支 16:9 产品介绍片。平台不生成 UI、不录屏、不验证产品事实；截图与文案由你提供。

## 目录

- `make-project.mjs`：生成示例项目 JSON（选择 `real-product`，三处确认门 pending），不确认、不渲染。
- `content.example.json`：输入格式示例；图片路径相对 content.json。
- `README.md`：本说明。

## 方式 A：用 CLI（推荐）

把 2–6 张 PNG/JPG 放到一个文件夹，然后：

```sh
npm run make -- --topic "产品功能演示" --screens ./my-screenshots
```

CLI 会问你每张图的说明，生成风格帧，确认后渲染成片。产物在 `projects/<日期>-<主题>/`。

## 方式 B：手动跑执行器

```sh
# 1. 准备 content.json（参考 content.example.json）与 assets/ 截图
# 2. 生成项目
node examples/real-product/make-project.mjs

# 3. 确认 Brief
node tools/project/cli.mjs gate --from .tmp/real-product/project.json --id brief \
  --basis "已核对截图来源与内容边界" --out .tmp/real-product/project-brief.json

# 4. 出风格帧
node recipes/real-product/run.mjs --project .tmp/real-product/project-brief.json \
  --content .tmp/real-product/content.json --stage stills --out .tmp/real-product/run

# 5. 看 style-frames.jpg 后确认风格
node tools/project/cli.mjs gate --from .tmp/real-product/project-brief.json --id style_frame \
  --basis "已查看风格帧" --out .tmp/real-product/run/project-style.json

# 6. 渲染
node recipes/real-product/run.mjs --project .tmp/real-product/run/project-style.json \
  --content .tmp/real-product/content.json --stage render --out .tmp/real-product/run
```

## 输入边界

- `scenes` 2–6 项；每项一张 `.png/.jpg/.jpeg`，单图 <3 MiB、总 <8 MiB。
- 截图必须在仓库工作区内（例如 `projects/<名称>/assets/` 或 `.tmp/`）；执行器拒绝仓库外路径。
- 不调用模型、不联网、不下载素材、不上传；只用本机 Chrome/Edge 与 ffmpeg。
- 内容真实性、产品事实、素材版权与再分发范围由用户负责；`qa-content` 保持 `not_checked`。

## 产物

`real-product.mp4`（1280×720 / 30 fps / H.264+AAC）、`style-frames.jpg`、`storyboard.jpg`、`qa.json`、`project-vN.json/.md`。`export` 门保持 pending。
