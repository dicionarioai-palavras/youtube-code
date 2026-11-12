import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const root='C:/Users/Dell/Desktop/Redes-sociais',project=root+'/code/remotion-redes-sociais',dir=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v3';
const serveUrl=await bundle({entryPoint:project+'/src/PilotoInvejaV3.tsx',publicDir:project+'/public'});const chromiumOptions={gl:'swangle'};
const mode=process.argv[2]??'stills';
for(const id of mode==='overlay'?['InvejaCityOverlayV3']:['InvejaFeedV3','InvejaCameraRealV3']){
 const composition=await selectComposition({serveUrl,id,chromiumOptions});
 if(mode==='overlay'){await renderStill({serveUrl,composition,frame:0,chromiumOptions,imageFormat:'png',output:dir+'/entrega/05-registros/city-titles.png'});}
 else if(mode==='stills'){for(const f of id.includes('Feed')?[25,160,410,500,640,840,960]:[32])await renderStill({serveUrl,composition,frame:f,chromiumOptions,output:dir+'/entrega/05-registros/'+id+'-'+f+'.png'});}
 else {const output=dir+'/entrega/02-cenas/'+(id.includes('Feed')?'feed-grafismo.mp4':'camera-real-remotion.mp4');if(fs.existsSync(output)){console.log('REUSADO '+id);continue;}let last=0;await renderMedia({serveUrl,composition,chromiumOptions,binariesDirectory:project+'/.runtime-piloto',outputLocation:output+'.tmp.mp4',codec:'h264',crf:18,x264Preset:'fast',concurrency:1,onProgress:p=>{if(p.progress-last>.15){console.log(id+' '+Math.round(p.progress*100)+'%');last=p.progress;}},ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','1',args.at(-1)]});fs.renameSync(output+'.tmp.mp4',output);console.log('RENDERIZADO '+id);}
}
process.exit(0);
