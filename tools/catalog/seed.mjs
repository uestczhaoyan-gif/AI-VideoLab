export const REVISIONS = {
  CAP: '69ccbeaf0b821591a40936572c2f559d8f4cfb68',
  LEMO: 'b5e8ef93930b6d828f352055a689320f138237b1',
  MG15: '49052d80bfaf9fa8412cc9710530e5e95a3b8d8c',
};
export const LICENCES = {  unknown: { label: '待核查', commercial: 'unknown', note: '没有取得适用于本条目的完整授权；公开可见不等于允许复制或商用。' },
  CAP: { label: '混合来源 / 免费分享约定', commercial: 'unknown', note: '非统一 MIT；合集分享条件和第三方条款分别适用。仅索引并引用本机文件，不重发 Prompt 或媒体。' },
  LEMO: { label: 'MIT / 素材另计', commercial: 'unknown', note: '工程 MIT；字体、声音、图像按各案例 CREDITS 核查，未统一取得商用结论。' },
  MG15: { label: 'MIT / 资产另计', commercial: 'unknown', note: '工程与 Prompt 参考上游 MIT，使用前仍须核对外部素材和字体。' },
  noncommercial: { label: 'PolyForm Noncommercial 1.0.0', commercial: 'restricted', note: '相应非商业用途，商业使用不允许；影片源码不随公开案例提供。' },
  APACHE: { label: 'Apache License 2.0（代码；素材另计）', commercial: 'unknown', note: '代码许可允许商用，但仓库内演示素材、字体、音效、品牌资产与第三方模板需逐项复核；不是所有内容都随 Apache-2.0 授权。' },
  SITE: { label: 'NOASSERTION / 条目许可各异', commercial: 'unknown', note: '索引仓库未给出统一许可；每个作品、提示词与源码的许可由原作者决定，使用前逐项核对；不搬运素材。' },
};

export const MODEL_ID = 'deepseek-v4.1-flash';
export const MODELS = [
  {
    id: MODEL_ID,
    label: 'DeepSeek V4.1 Flash（用户指定当前模型）',
    provider: 'deepseek',
    model_id: MODEL_ID,
    modality: ['text'],
    verification: 'user_designated_unverified',
    price_status: 'unknown',
    price: null,
    checked_at: '2026-11-06',
    note: '2026-11-06 用户指定用于本地 CLI／工作台。未核对官方 API ID、价格、上下文长度与工具能力；不能据此对外声明能力、排名或费用。',
  },
];

export const MG_STYLES = [
  ['01-flat-vector', '平面矢量', '几何图形'],
  ['02-line-art', '线条动画', '手绘与线条'],
  ['03-isometric', '等轴空间', '空间与三维'],
  ['04-3d-render', '三维材质', '空间与三维'],
  ['05-cel-boil', '手绘沸腾线', '手绘与线条'],
  ['06-collage', '拼贴', '印刷与拼贴'],
  ['07-liquid', '液态', '形变与运动'],
  ['08-morph', '连续形变', '形变与运动'],
  ['09-bauhaus', '包豪斯', '几何图形'],
  ['10-synthwave', '合成波', '光与材质'],
  ['12-aurora-glass', '极光玻璃', '光与材质'],
  ['18-hanazi', '综艺花字', '文字与排版'],
  ['19-paperclip', '知识拼贴', '印刷与拼贴'],
  ['20-pixel', '像素', '像素与游戏'],
  ['22-hud', 'HUD', '信息与图表'],
];

const stages = [
  { id: 'research', name: '内容与事实', output: '有出处的稿件／准确文案', premium: '检索、推理与事实核验可靠的候选', budget: '复用已核实资料；低成本整理，关键事实升级核验', model_id: null },
  { id: 'direction', name: '导演与风格', output: '代表帧、对象变化链与分镜', premium: '参考理解、叙事与风格设计表现可靠的候选', budget: '成熟模板辅助设计，困难镜头由较强候选处理一次', model_id: null },
  { id: 'timing', name: '声音与时基', output: '音频版本与句／事件时间表', premium: '音色、语言与表现可靠的语音服务，按需独立试听', budget: '合规低价／本地语音先测代表句；自带音频优先复用', model_id: null },
  { id: 'production', name: '代码与素材', output: '可编辑工程、资产清单和片段', premium: '与所选引擎兼容、实际质量可靠的制作候选', budget: '低成本编码候选＋相关 Skill；只对失败局部升级', model_id: null },
  { id: 'render', name: '渲染与合成', output: '真实视频、字幕、混音和规格记录', premium: '任务所需原生渲染器；不是模型调用', budget: '同样最终规格，缓存与局部重渲；不是模型调用', model_id: null },
  { id: 'review', name: '审查与返修', output: '按时刻的问题、复查与采用记录', premium: '必要的独立多模态审查与人审', budget: '自动技术检查先行，重要质量问题按需升级，保留人审', model_id: null },
];
export const RECIPES = [
  {
    id: 'code-motion', revision: 'local-1', name: '代码动效短片',
    summary: '参考现成 Prompt 或工程，先定视觉变化与时基，再分段制作、渲染和返修。本地已提供半自动执行器。',
    purposes: ['motion', 'product', 'story', 'education'], source_ids: ['P02', 'P09', 'P11'],
    requirements: ['准确文案与时长／画幅', 'brief.json 与 content.json（导演脚本）', '本机 Chrome／Edge 与 ffmpeg'],
    limitations: ['只覆盖文字／图形卡点短动效；不生成真实素材、角色或真人', '无后台队列、无自动剪辑、无自动发布', '导演脚本由当前 CLI 模型生成，执行器只负责渲染与机械检查', 'P11 当前 HyperFrames，视频 Remotion 示例不可混用'],
    stages, status: 'local_adapted', runnable: true,
    adapter: {
      status: 'local_only',
      entry: 'recipes/code-motion/run.mjs',
      director_model: MODEL_ID,
      limits: [
        '本地 HTML render(t) + Chrome 逐帧 + ffmpeg；需要本机浏览器与 ffmpeg，不自动安装',
        '只支持文字／图形卡点短动效；素材、角色、真人与生成式镜头另行接入',
        '工作台本身不执行；用导出的项目 JSON 手动运行本地执行器',
      ],
    },
  },
  {
    id: 'explain-data', revision: 'local-1', name: '科普与数据解释',
    summary: '以真实机制、数据与单位为基础，输出固定版式的数据解释短片；本地已提供半自动执行器。',
    purposes: ['education', 'data'], source_ids: ['P05', 'P06', 'P10', 'P13'],
    requirements: ['数据点、单位与来源口径', 'brief.json 与 content.json（示例数据 / 真实数据声明）', '本机 Chrome／Edge 与 ffmpeg'],
    limitations: ['固定横向条形图版式；不支持折线图、多图联动或自定义布局', '执行器不验证数据真实性；真实统计必须人工核对', '无配音、BGM、字幕烧录或自动剪辑', 'ManimGL 与 Community 不能混用；科学正确不能用渲染成功代替'],
    stages, status: 'local_adapted', runnable: true,
    adapter: {
      status: 'local_only',
      entry: 'recipes/explain-data/run.mjs',
      director_model: MODEL_ID,
      limits: [
        '只做 2–6 条横向条形图的固定版式；折线图、多图联动、自定义布局未支持',
        '数据真实性、单位与口径由人核对；示例数据必须标“示例数据，不是真实统计”',
        '不调用模型 API；工作台暂不直接生成，需用 CLI 执行器与 examples/explain-data/',
      ],
    },
  },
  {
    id: 'real-product', revision: 'local-1', name: '真实产品与素材包装',
    summary: '真实截图／录屏或授权素材先行，编排说明、标注与动效；本地已提供截图包装的半自动执行器。',
    purposes: ['product'], source_ids: ['P01', 'P04', 'V05'],
    requirements: ['真实产品截图（PNG/JPG）与逐场景说明', '截图来源、产品事实与素材许可', 'brief.json 与 content.json'],
    limitations: ['只做截图包装：不生成 UI、不录屏、不验证功能真实性', '2–6 个场景；图片须在仓库工作区内', '无配音、BGM、字幕文件、自动剪辑或发布', '不得用虚构 UI 冒充真实功能；仅有通用风格不证明适合当前产品'],
    stages, status: 'local_adapted', runnable: true,
    adapter: {
      status: 'local_only',
      entry: 'recipes/real-product/run.mjs',
      director_model: MODEL_ID,
      limits: [
        '输入真实截图（PNG/JPG，2–6 场景，单图 <3 MiB、总 <8 MiB），不生成 UI 或录屏',
        '产品事实、截图来源与素材版权由人核对；不验证截图真实性',
        '不调用模型 API；工作台暂不直接生成，需用 CLI 执行器与 examples/real-product/',
      ],
    },
  },
];
