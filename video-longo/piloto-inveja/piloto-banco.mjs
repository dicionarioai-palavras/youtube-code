import fs from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const {loadExternalEnv}=await import(pathToFileURL(root+'/code/apis-externas/src/config.mjs'));loadExternalEnv();
const {searchPixabay}=await import(pathToFileURL(root+'/code/apis-externas/src/pixabay.mjs'));
const dir=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1/originais';fs.mkdirSync(dir,{recursive:true});
const records=[];
for(const [kind,q,name] of [['image','luxury house','pixabay-casa.jpg'],['video','Santorini','pixabay-santorini.mp4']]){
 const r=await searchPixabay(kind,q);const asset=r.results[0];let url=asset.download_url;
 if(kind==='video'){const variants=Object.values(asset.variants).filter(x=>x.width>=1280&&x.url).sort((a,b)=>a.bytes-b.bytes);url=variants[0]?.url;if(!url)throw Error('Sem variante de vídeo adequada');}
 const file=dir+'/'+name;if(!fs.existsSync(file)){const res=await fetch(url,{signal:AbortSignal.timeout(120000)});if(!res.ok)throw Error('Download Pixabay HTTP '+res.status);fs.writeFileSync(file,Buffer.from(await res.arrayBuffer()));}
 records.push({name,id:asset.id,source:asset.page_url,author:asset.author,license:asset.license_url,downloaded_at:new Date().toISOString(),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),search:q,cache_hit:r.cache_hit});console.log('Baixado '+name);
}
fs.writeFileSync(dir+'/pixabay-fontes.json',JSON.stringify(records,null,2));
