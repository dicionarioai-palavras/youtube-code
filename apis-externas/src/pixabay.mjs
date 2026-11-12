import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {getCredential,projectRoot} from './config.mjs';
const TTL=24*60*60*1000;
export async function searchPixabay(kind,query,options={}){
 if(!['image','video'].includes(kind)||typeof query!=='string'||!query.trim()||query.length>100)throw new Error('Tipo ou consulta inválida.');
 const q=query.trim();const count=options.perPage??3;
 if(!Number.isInteger(count)||count<3||count>10)throw new Error('Selecionar de 3 a 10 candidatos por consulta.');
 const criteria={kind,query:q,perPage:count,safesearch:true};
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify(criteria)).digest('hex');
 const cacheDir=options.cacheDir??path.join(projectRoot,'code/apis-externas/.cache/pixabay');
 const cacheFile=path.join(cacheDir,fingerprint+'.json');
 if(fs.existsSync(cacheFile)){try{const cache=JSON.parse(fs.readFileSync(cacheFile,'utf8'));if(cache.schema_version===1&&Date.now()-Date.parse(cache.fetched_at)<TTL)return {...cache,cache_hit:true,network_calls:0};}catch{}}
 const key=options.apiKey??getCredential('pixabay');
 const url=new URL(kind==='video'?'https://pixabay.com/api/videos/':'https://pixabay.com/api/');
 url.searchParams.set('key',key);url.searchParams.set('q',q);url.searchParams.set('per_page',String(count));url.searchParams.set('safesearch','true');
 if(kind==='image'){url.searchParams.set('image_type','photo');url.searchParams.set('orientation','horizontal');}else url.searchParams.set('video_type','film');
 let response;try{response=await (options.fetchImpl??fetch)(url,{signal:AbortSignal.timeout(20000),redirect:'error'});}catch{throw new Error('Conexão Pixabay falhou; URL e credencial omitidas.');}
 if(!response.ok){const error=new Error('Pixabay respondeu HTTP '+response.status);error.status=response.status;throw error;}
 let body;try{body=await response.json();}catch{throw new Error('Pixabay retornou dados inválidos.');}
 if(!Array.isArray(body.hits))throw new Error('Resposta Pixabay sem resultados reconhecíveis.');
 const results=body.hits.map(h=>({id:h.id,type:h.type,tags:h.tags,page_url:h.pageURL,author:h.user,author_id:h.user_id,...(kind==='image'?{width:h.imageWidth,height:h.imageHeight,preview_url:h.webformatURL,download_url:h.fullHDURL||h.largeImageURL,download_full_resolution:!!h.fullHDURL}: {duration_s:h.duration,variants:Object.fromEntries(Object.entries(h.videos||{}).map(([name,v])=>[name,{url:v.url,width:v.width,height:v.height,bytes:v.size,thumbnail:v.thumbnail}]))}),license_url:'https://pixabay.com/service/license-summary/',review_status:'candidato-nao-revisado'}));
 const report={schema_version:1,status:response.status,fetched_at:new Date().toISOString(),criteria,total:body.total,total_accessible:body.totalHits,rate:{limit:response.headers.get('x-ratelimit-limit'),remaining:response.headers.get('x-ratelimit-remaining'),reset:response.headers.get('x-ratelimit-reset')},results};
 // Nunca persistir o URL de requisição ou o corpo bruto; defesa extra contra eco da credencial.
 const serialized=JSON.stringify(report,null,2).split(key).join('[redacted]');
 fs.mkdirSync(cacheDir,{recursive:true});fs.writeFileSync(cacheFile,serialized+'\n');
 return {...JSON.parse(serialized),cache_hit:false,network_calls:1};
}
