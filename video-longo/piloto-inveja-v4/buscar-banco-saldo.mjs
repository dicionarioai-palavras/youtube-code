import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const root='C:/Users/Dell/Desktop/Redes-sociais',d=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v4';
const {loadExternalEnv}=await import(pathToFileURL(root+'/code/apis-externas/src/config.mjs'));loadExternalEnv();
const {searchPixabay}=await import(pathToFileURL(root+'/code/apis-externas/src/pixabay.mjs'));
const {getRunwayBalance}=await import(pathToFileURL(root+'/code/apis-externas/src/runway-saldo.mjs'));
const b=await getRunwayBalance();fs.writeFileSync(d+'/direcao/saldo-antes.json',JSON.stringify(b,null,2));console.log('SALDO '+b.credit_balance);
const reports=[];for(const q of ['restaurant friends lunch','restaurant table','brazil food','coffee cup']){const r=await searchPixabay('video',q,{perPage:6});reports.push(r);console.log(JSON.stringify({q,cache:r.cache_hit,total:r.total,results:r.results.map(x=>({id:x.id,tags:x.tags,duration:x.duration_s,author:x.author,variants:Object.keys(x.variants)}))}));}
fs.writeFileSync(d+'/direcao/pixabay-buscas.json',JSON.stringify(reports,null,2));
