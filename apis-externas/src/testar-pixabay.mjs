import fs from 'node:fs';
import path from 'node:path';
import {loadExternalEnv,credentialStatus,projectRoot} from './config.mjs';
import {searchPixabay} from './pixabay.mjs';
const output=path.join(projectRoot,'code/apis-externas/teste-pixabay.json');
const report={checked_at:new Date().toISOString(),media_downloads:0,paid_generation:0,searches:[]};
try{
 loadExternalEnv();if(!credentialStatus().pixabay)throw new Error('Credencial ausente');
 for(const [kind,query,scenes] of [['image','luxury house',[33,47]],['video','Santorini',[118,124]]]){
  try{const r=await searchPixabay(kind,query);report.searches.push({...r,scenes});}
  catch(e){report.searches.push({kind,query,ok:false,status:Number.isInteger(e.status)?e.status:null,reason:'Falha de configuração/conexão ou resposta API; detalhes sensíveis omitidos.'});}
 }
 report.ok=report.searches.every(r=>r.status===200);report.network_calls=report.searches.reduce((n,r)=>n+(r.network_calls??1),0);
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:report.ok,network_calls:report.network_calls,media_downloads:0,searches:report.searches.map(r=>({kind:r.criteria?.kind??r.kind,query:r.criteria?.query??r.query,status:r.status,total:r.total,returned:r.results?.length,cache_hit:r.cache_hit,rate:r.rate}))},null,2));
 if(!report.ok)process.exitCode=1;
}catch{report.ok=false;report.reason='Credencial ausente ou configuração inválida; valores não exibidos.';report.network_calls=0;fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:false,reason:report.reason,network_calls:0}));process.exitCode=1;}
