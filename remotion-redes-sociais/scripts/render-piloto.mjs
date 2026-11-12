import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
const root=path.resolve('../..');
const dir=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1';
const recipe=JSON.parse(fs.readFileSync(dir+'/receita-montagem.json'));
const serveUrl=await bundle({entryPoint:path.resolve('src/PilotoInveja.tsx')});
for(const s of recipe.shots){
 if(['distance','camera','house','travel'].includes(s.kind))continue;
 const output=dir+'/entrega/02-cenas/'+s.id+'.mp4';if(fs.existsSync(output)){console.log('Existe '+s.id);continue;}
 const inputProps={kind:s.kind,frames:s.frames};const chromiumOptions={gl:'swangle'};console.log('Iniciando '+s.id);const composition=await selectComposition({serveUrl,id:'PilotoInveja',inputProps,chromiumOptions});
 await renderMedia({serveUrl,composition,inputProps,chromiumOptions,binariesDirectory:path.resolve('.runtime-piloto'),outputLocation:output+'.tmp.mp4',codec:'h264',crf:18,x264Preset:'fast',concurrency:1,ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','1',args.at(-1)],offthreadVideoCacheSizeInBytes:64*1024*1024,onProgress:p=>{}});
 fs.renameSync(output+'.tmp.mp4',output);console.log('Renderizado '+s.id);
}
execFileSync(process.execPath,['scripts/finalizar-cenas-piloto.mjs'],{stdio:'inherit'});
console.log('RENDER-CONCLUIDO');
process.exit(0);
