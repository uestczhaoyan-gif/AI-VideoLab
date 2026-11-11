# 资源库抽检报告

生成时间：2026-11-10。检查方式：目录存在、文件数量、README/SKILL/LICENSE、入口文件、文档是否真的在讲视频/动画制作。**不是安装/运行测试**；标为 checked 只表示“可作为参考/待安装使用”，不等于已能出片。

| ID | 分类 | 仓库 | 文件数 | MB | 许可文件 | 入口 | 抽检 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P02 | styles | https://github.com/Vincentwei1021/mg-styles-15 | 835 | 1293.5 | 有 | source/prompts | checked（参考/待安装） |
| LEMO | styles | https://github.com/lemomo-ai/lemo-opuscar | 2100 | 104.9 | 有 | source/styles | checked（参考/待安装） |
| P09 | prompt-library | https://github.com/XiaoyeCodes/code-animation-prompts | 581 | 79.9 | 有 | source/skills/code-animation-prompts | checked（参考/待安装） |
| P03 | prompt-library | https://github.com/huiq777/fifi-video-prompt | 45 | 9.1 | 有 | source | checked（参考/待安装） |
| P05 | engine | https://github.com/3b1b/manim | 183 | 2 | 有 | source/manimlib | checked（参考/待安装） |
| P15 | engine | https://github.com/heygen-com/hyperframes | 9495 | 312.6 | 有 | source | checked（参考/待安装） |
| P17 | engine | https://github.com/alexgreensh/anidoodle | 1830 | 51.9 | 有 | source | checked（参考/待安装） |
| P16 | engine | https://github.com/feitangyuan/onetake | 116 | 113.3 | 有 | source | checked（参考/待安装） |
| P22 | engine | https://github.com/Vincentwei1021/video-shotcraft | 1221 | 50.9 | 有 | source/SKILL.md | checked（参考/待安装） |
| P08 | study | https://github.com/wheresryan22/anatomy | 177 | 13.6 | 有 | source | checked（参考/待安装） |
| P11 | skill | https://github.com/vibe-motion/auto-motion | 239 | 43.9 | 无/未统一 | source | checked（参考/待安装） |
| P13 | skill | https://github.com/Yusuke710/manim-skill | 14 | 1.2 | 有 | source/skills | checked（参考/待安装） |
| P12 | skill | https://github.com/nexu-io/open-design | 49 | 0.4 | 有 | source | partial |
| P14 | skill | https://github.com/remotion-dev/skills | 293 | 2.3 | 无/未统一 | source/skills | checked（参考/待安装） |
| P18 | skill | https://github.com/YishenTu/claudian | 1590 | 21.6 | 有 | source | checked（参考/待安装） |
| P01 | workflow | https://github.com/liyupi/ai-promo-video-maker | 80 | 0.7 | 有 | source | checked（参考/待安装） |
| P04 | workflow | https://github.com/duoduoler-ops/Table-VideoSOP | 85 | 0.4 | 有 | source | checked（参考/待安装） |
| P19 | collection | https://github.com/guanmo-ai/awesome-ai-motion | 5381 | 72.7 | 有 | source | checked（参考/待安装） |
| P20 | collection | https://github.com/yihui-dev/awesome-opus5-5-videos | 707 | 1.6 | 有 | source | checked（参考/待安装） |
| P21 | collection | https://github.com/athemeroy/awesome-claude-5-5-videos | 322 | 8.3 | 有 | source | checked（参考/待安装） |

- checked：19；partial：1；missing：0。
- 所有条目都未安装依赖或实际渲染；P16 有非商业限制，P12 因仓库过大只保留可读部分，P22 已下载完整源码但未安装。
- “文档相关”检查只证明仓库在讲视频制作，不证明效果、许可或可运行性。

## 补充抽检（2026-11-10 本机执行）

- JSON 可解析：video-shotcraft、hyperframes、claudian、remotion-skills、mg-styles-15 的 package.json；anidoodle 根目录没有 package.json（以插件结构提供）。
- CAP 索引：catalog.json 声明 341 条，实际 entries 341。
- LEMO：51 个 style.json（不含 _template）。
- Python：resources/engines/manim/source/manimlib/__init__.py 通过 py_compile；Onetake 的 Python 脚本未逐文件编译（只做了目录与入口检查）。
- 未安装任何上游依赖、未运行上游 demo、未渲染上游示例；因此“可以辅助生成视频”只能按参考/待安装理解。
