export const REVISIONS = {
  CAP: '69ccbeaf0b821591a40936572c2f559d8f4cfb68',
  LEMO: 'b5e8ef93930b6d828f352055a689320f138237b1',
  MG15: '49052d80bfaf9fa8412cc9710530e5e95a3b8d8c',
};
export const LICENCES = {
  unknown: { label: '待核查', commercial: 'unknown', note: '没有取得适用于本条目的完整授权；公开可见不等于允许复制或商用。' },
  CAP: { label: '混合来源 / 免费分享约定', commercial: 'unknown', note: '非统一 MIT；合集分享条件和第三方条款分别适用。仅索引并引用本机文件，不重发 Prompt 或媒体。' },
  LEMO: { label: 'MIT / 素材另计', commercial: 'unknown', note: '工程 MIT；字体、声音、图像按各案例 CREDITS 核查，未统一取得商用结论。' },
  MG15: { label: 'MIT / 资产另计', commercial: 'unknown', note: '工程与 Prompt 参考上游 MIT，使用前仍须核对外部素材和字体。' },
  noncommercial: { label: 'PolyForm Noncommercial 1.0.0', commercial: 'restricted', note: '相应非商业用途，商业使用不允许；影片源码不随公开案例提供。' },
};

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
    id: 'code-motion', revision: 'draft-1', name: '代码动效短片',
    summary: '参考现成 Prompt 或工程，先定视觉变化与时基，再分段制作、渲染和返修。',
    purposes: ['motion', 'product', 'story', 'education'], source_ids: ['P02', 'P09', 'P11'],
    requirements: ['准确文案与时长／画幅', '选中模板与资产许可', '可调用模型和兼容渲染器'],
    limitations: ['尚无统一适配器', '实际模型与费用未知', 'P11 当前 HyperFrames，视频 Remotion 示例不可混用'],
    stages, status: 'draft', runnable: false,
  },
  {
    id: 'explain-data', revision: 'draft-1', name: '科普与数据解释',
    summary: '以真实机制、数据与单位为基础，选择图解、Manim 或代码动画，明确声音与时间依据。',
    purposes: ['education', 'data'], source_ids: ['P05', 'P06', 'P10', 'P13'],
    requirements: ['事实／数据出处与单位', '希望观众理解的关系', '合适的图解模板与声音要求'],
    limitations: ['未跑通统一链路', 'ManimGL 与 Community 不能混用', '科学正确不能用渲染成功代替'],
    stages, status: 'draft', runnable: false,
  },
  {
    id: 'real-product', revision: 'draft-1', name: '真实产品与素材包装',
    summary: '真实截图／录屏或授权素材先行，编排讲解、标注与动效，再按实际声音总装。',
    purposes: ['product'], source_ids: ['P01', 'P04', 'V05'],
    requirements: ['真实产品截图／录屏及功能事实', '素材和声音授权', '正式文字／音频与输出规格'],
    limitations: ['未独立跑通完整产品片', '不得用虚构 UI 冒充真实功能', '仅有通用风格不证明适合当前产品'],
    stages, status: 'draft', runnable: false,
  },
];
