import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
const root=process.cwd(),out=path.resolve(root,'../../palavras/youtube/peças/inveja/videos/remotion/S03-20s-2026-10-27');
fs.mkdirSync(out,{recursive:true});
const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.join(root,'src/inveja-s03/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(out,'bundle')});
const composition=await selectComposition({serveUrl,id:'inveja-s03-20s',browserExecutable});
fs.writeFileSync(path.join(out,'composicao.json'),JSON.stringify({id:composition.id,width:composition.width,height:composition.height,fps:composition.fps,durationInFrames:composition.durationInFrames,durationSeconds:20,audio:false},null,2));
if(process.argv.includes('--stills')){
 for(const frame of [0,90,150,190,226,255,315,400,479]){await renderStill({serveUrl,composition,browserExecutable,frame,imageFormat:'png',output:path.join(out,'quadro-'+String(frame).padStart(3,'0')+'.png')});}
 console.log('QUADROS_PRONTOS '+out);process.exit(0);
}
let last=-25;
await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:2,outputLocation:path.join(out,'inveja-s03-20s-fullhd.mp4'),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p>=last+20){last=p;console.log('Render S03 '+p+'%');}}});
console.log('ENTREGA '+path.join(out,'inveja-s03-20s-fullhd.mp4'));
