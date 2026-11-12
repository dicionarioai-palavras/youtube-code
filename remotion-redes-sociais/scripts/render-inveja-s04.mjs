import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
const root=process.cwd(),out=path.resolve(root,'../../palavras/youtube/peças/inveja/videos/remotion/S04-9s-2026-10-28');fs.mkdirSync(out,{recursive:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.join(root,'src/inveja-s04/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(out,'bundle')});
const composition=await selectComposition({serveUrl,id:'inveja-s04-9s',browserExecutable});
fs.writeFileSync(path.join(out,'composicao.json'),JSON.stringify({width:1920,height:1080,fps:24,durationInFrames:216,durationSeconds:9,scene_start:46.487,vale_onset:50.447,entry_frame:96,entry_local:4.0,audio:false},null,2));
if(process.argv.includes('--stills')||process.argv.includes('--preview')){
for(const frame of (process.argv.includes('--preview')?[144]:[0,95,102,144,215]))await renderStill({serveUrl,composition,browserExecutable,frame,imageFormat:'png',output:path.join(out,'quadro-'+String(frame).padStart(3,'0')+'.png')});
console.log('QUADROS '+out);process.exit(0);
}
let last=-25;await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:2,outputLocation:path.join(out,'inveja-s04-9s-fullhd.mp4'),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p>=last+20){last=p;console.log('Render S04 '+p+'%')}}});console.log('ENTREGA '+out+'/inveja-s04-9s-fullhd.mp4');
