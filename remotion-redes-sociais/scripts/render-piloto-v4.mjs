import fs from 'node:fs';import crypto from 'node:crypto';import {bundle} from '@remotion/bundler';import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const root='C:/Users/Dell/Desktop/Redes-sociais',project=root+'/code/remotion-redes-sociais',d=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v4';
const mode=process.argv[2]??'stills',chromiumOptions={gl:'swangle'};
const src=project+'/src/PilotoInvejaV4.tsx',hash=crypto.createHash('sha256').update(fs.readFileSync(src)).update('banco-equilibrado-v2').digest('hex').slice(0,14),bundleDir=project+'/out/bundle-piloto-v4-'+hash;
const isolated=project+'/.runtime-v4-public';fs.mkdirSync(isolated,{recursive:true});fs.cpSync(project+'/public/piloto-inveja-v4',isolated+'/piloto-inveja-v4',{recursive:true});fs.mkdirSync(isolated+'/fonts',{recursive:true});for(const f of ['BebasNeue.woff2','Inter-400.woff2','Inter-500.woff2'])fs.copyFileSync(project+'/public/fonts/'+f,isolated+'/fonts/'+f);
const serveUrl=fs.existsSync(bundleDir+'/index.html')?bundleDir:await bundle({entryPoint:src,publicDir:isolated,outDir:bundleDir});
const composition=await selectComposition({serveUrl,id:'InvejaAlmocoV4',chromiumOptions});
if(mode==='stills'){
 for(const f of [65,390,757,945,1115,1300,1535,1820,2130,2300,2395,2445]){await renderStill({serveUrl,composition,frame:f,chromiumOptions,scale:.5,output:d+'/entrega/05-registros/revisao-'+String(f).padStart(4,'0')+'.png'});}
 console.log('12-QUADROS-RENDERIZADOS');
}else{
 const output=d+'/entrega/02-cenas/00-montagem-remotion-sem-audio.mp4';
 if(fs.existsSync(output)){console.log('RENDER-EXISTENTE');process.exit(0);}
 let last=-1;const start=Date.now();
 await renderMedia({serveUrl,composition,chromiumOptions,binariesDirectory:project+'/.runtime-piloto',outputLocation:output+'.tmp.mp4',codec:'h264',crf:18,x264Preset:'fast',concurrency:2,onProgress:p=>{const n=Math.floor(p.progress*10);if(n>last){last=n;console.log('RENDER '+(n*10)+'%');}},ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','2',args.at(-1)]});
 fs.renameSync(output+'.tmp.mp4',output);fs.writeFileSync(d+'/entrega/05-registros/render-local.json',JSON.stringify({seconds:(Date.now()-start)/1000,code_sha256:hash,frames:2471,concurrency:2,paid_api_calls:0},null,2));console.log('RENDER-CONCLUIDO');
}
process.exit(0);
