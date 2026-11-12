import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {loadExternalEnv,projectRoot} from './config.mjs';
try{
 const [relative,...args]=process.argv.slice(2);
 if(!relative)throw new Error();
 const script=path.resolve(projectRoot,relative);const rel=path.relative(projectRoot,script);
 if(rel.startsWith('..')||path.isAbsolute(rel)||!['.mjs','.js'].includes(path.extname(script))||!fs.existsSync(script))throw new Error();
 loadExternalEnv();
 const result=spawnSync(process.execPath,[script,...args],{cwd:projectRoot,env:process.env,stdio:'inherit',shell:false});
 process.exitCode=result.error?1:result.status??1;
}catch{console.error('Uso: node code/apis-externas/src/executar.mjs caminho/do/script.mjs [argumentos]. Somente scripts dentro do projeto.');process.exitCode=1;}
