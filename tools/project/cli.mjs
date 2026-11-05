import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createProject, parseProject, assertProject, forkProject, projectMarkdown, projectReferences, projectGaps, selectionIssues, MAX_PROJECT_BYTES } from '../../shared/project.mjs';
import { loadCatalog, ROOT } from '../catalog/validate.mjs';

function readProject(file) {
  if(!file)throw new Error('需要 --from 项目.json');
  if(fs.statSync(file).size>MAX_PROJECT_BYTES)throw new Error('项目 JSON 不能超过 2 MiB。');
  return parseProject(fs.readFileSync(file,'utf8'));
}
function writeNew(file,content) {
  if(!file)throw new Error('需要 --out 新文件路径；已有文件不会被覆盖。');
  fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});
  fs.writeFileSync(file,content,{encoding:'utf8',flag:'wx'});
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
  const options={from:{type:'string'},out:{type:'string'},topic:{type:'string'},help:{type:'boolean'}};
  const {values}=parseArgs({args,options,allowPositionals:false});
  if(values.help||!command){
    console.log('VideoLab 项目数据（不调用模型、不执行制片）\ninit --topic "主题" --out projects/name/project.json\ncheck --from project.json\nimport --from 旧方案或项目.json --out 新项目.json\nfork --from project.json --out 新版本.json\nmarkdown --from project.json --out project.md\n所有写入拒绝覆盖；文件引用仅检查是否存在，不读取内容或访问网址。');
  }else if(command==='check'){
    const p=readProject(values.from),references=inspectReferences(p,values.from);
    console.log(JSON.stringify({valid:true,schema_version:p.schema_version,project_id:p.project_id,revision:p.revision,migrated_from:p.migration?.from_version??null,execution_ready:false,content_gaps:projectGaps(p),catalog_issues:selectionIssues(p,loadCatalog()),references},null,2));
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
