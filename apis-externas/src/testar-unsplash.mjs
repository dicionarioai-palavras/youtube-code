import fs from 'node:fs';
import path from 'node:path';
import {loadExternalEnv,credentialStatus,projectRoot} from './config.mjs';
import {searchUnsplash} from './unsplash.mjs';
const output=path.join(projectRoot,'code/apis-externas/teste-unsplash.json');
try{
 loadExternalEnv();
 if(!credentialStatus().unsplash){console.log(JSON.stringify({ok:false,reason:'UNSPLASH_ACCESS_KEY ausente',network_calls:0}));process.exitCode=2;}
 else {const result=await searchUnsplash('Santorini Greece',{perPage:3});
 const report={ok:true,checked_at:new Date().toISOString(),network_calls:1,media_downloads:0,paid_generation:0,...result};fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:true,status:result.status,total:result.total,returned:result.results.length,rate:result.rate,network_calls:1,media_downloads:0},null,2));}
}catch(e){const report={ok:false,checked_at:new Date().toISOString(),status:Number.isInteger(e.status)?e.status:null,reason:Number.isInteger(e.status)?'API retornou erro HTTP':'Falha de configuração/conexão; sem detalhes sensíveis',media_downloads:0};fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));process.exitCode=1;}
