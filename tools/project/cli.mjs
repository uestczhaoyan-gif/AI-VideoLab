import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createProject, parseProject, assertProject, forkProject, projectMarkdown, projectReferences, projectGaps, selectionIssues, MAX_PROJECT_BYTES, confirmGate, updateCheck } from '../../shared/project.mjs';
import { loadCatalog, ROOT } from '../catalog/validate.mjs';

function readProject(file) {
  if(!file)throw new Error('需要 --from 项目.json');
  if(fs.statSync(file).size>MAX_PROJECT_BYTES)throw new Error('项目 JSON 不能超过 2 MiB。');
  return parseProject(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
}
function writeNew(file,content) {
  if(!file)throw new Error('需要 --out 新文件路径；已有文件不会被覆盖。');
  fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});
  fs.writeFileSync(file,content,{encoding:'utf8',flag:'wx'});
}
function parseEvidence(value) {
  if (!value) return null;
  const match = /^(repository|project|url):(.+)$/.exec(value);
  if (!match) throw new Error('--evidence 需要形如 repository:.tmp/x.json');
  return { base: match[1], path: match[2] };
}
function inspectReferences(p,projectFile) {
  return projectReferences(p).map(ref=>{
    if(ref.base==='url')return {...ref,status:'not_fetched'};
    const root=ref.base==='project'?path.dirname(path.resolve(projectFile)):ROOT;
    const target=path.resolve(root,ref.path);
    try {
      const realRoot=fs.realpathSync(root),real=fs.realpathSync(target),relative=path.relative(realRoot,real);
      return {...ref,status:relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)?'outside_root':'exists'};
    }catch{return {...ref,status:'missing'};}
  });
}
try {
  const [command,...args]=process.argv.slice(2);
  const options={from:{type:'string'},out:{type:'string'},topic:{type:'string'},help:{type:'boolean'},id:{type:'string'},basis:{type:'string'},status:{type:'string'},evidence:{type:'string'},notes:{type:'string'}};
  const {values}=parseArgs({args,options,allowPositionals:false});
  if(values.help||!command){
    console.log(`VideoLab 项目数据（不调用模型、不执行制片）

init --topic "主题" --out projects/name/project.json
check --from project.json
import --from 旧方案或项目.json --out 新项目.json
fork --from project.json --out 新版本.json
markdown --from project.json --out project.md
gate --from project.json --id brief --basis "确认依据" --out 新项目.json
qa --from project.json --id qa-spec --status passed --evidence repository:.tmp/qa.json --notes "…" --out 新项目.json

gate 状态可选 confirmed / waived；waived 也要求写依据。
qa 状态可选 not_checked / pending / passed / failed / waived；passed／failed 必须有 --evidence。
所有写入拒绝覆盖；文件引用仅检查是否存在，不读取内容或访问网址。`);
  }else if(command==='check'){
    const p=readProject(values.from),references=inspectReferences(p,values.from);
    console.log(JSON.stringify({valid:true,schema_version:p.schema_version,project_id:p.project_id,revision:p.revision,migrated_from:p.migration?.from_version??null,execution_ready:false,content_gaps:projectGaps(p),catalog_issues:selectionIssues(p,loadCatalog()),references},null,2));
  }else if(command==='gate'){
    if(!values.id)throw new Error('gate 需要 --id brief|style_frame|export');
    if(!values.basis?.trim())throw new Error('gate 需要 --basis "确认依据"');
    const status=values.status??'confirmed';
    if(!['confirmed','waived'].includes(status))throw new Error('gate 的 --status 只能是 confirmed 或 waived');
    const p=confirmGate(readProject(values.from),values.id,{basis:values.basis,status});
    writeNew(values.out,JSON.stringify(p,null,2)+'\n');
    console.log(`已写入 ${path.resolve(values.out)}；确认门 ${values.id} = ${status}，项目版本 ${p.revision}。`);
  }else if(command==='qa'){
    if(!values.id)throw new Error('qa 需要 --id qa-spec 等检查项 ID');
    if(!values.status)throw new Error('qa 需要 --status');
    const p=updateCheck(readProject(values.from),values.id,{status:values.status,evidence:parseEvidence(values.evidence),notes:values.notes??''});
    writeNew(values.out,JSON.stringify(p,null,2)+'\n');
    console.log(`已写入 ${path.resolve(values.out)}；检查 ${values.id} = ${values.status}，项目版本 ${p.revision}。`);
  }else {
    let p;
    if(command==='init'){
      if(!values.topic?.trim())throw new Error('init 需要 --topic "主题"');
      p=createProject({topic:values.topic.trim()});
    }else if(['import','fork','markdown'].includes(command)){
      p=readProject(values.from);
      if(command==='fork')p=assertProject(forkProject(p));
    }else throw new Error('未知命令；使用 --help 查看用法。');
    writeNew(values.out,command==='markdown'?projectMarkdown(p):JSON.stringify(p,null,2)+'\n');
    console.log(`已写入 ${path.resolve(values.out)}；${command==='markdown'?'完整结构以同版本 JSON 为准':`项目版本 ${p.revision}，尚无自动执行能力`}。`);
    if(values.from&&path.dirname(path.resolve(values.from))!==path.dirname(path.resolve(values.out)))console.log('项目相对引用保持原样；移动到新目录后请运行 check，补齐文件，未复制媒体。');
  }
}catch(error){console.error(error.code==='EEXIST'?'目标文件已存在，拒绝覆盖。请使用新文件名。':error.message);process.exitCode=1;}
