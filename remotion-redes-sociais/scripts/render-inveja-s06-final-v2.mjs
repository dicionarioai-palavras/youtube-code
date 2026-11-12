import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
const root=process.cwd(),out=path.resolve(root,'../../canais/palavras/episodios/ep01-inveja/videos/remotion/S06-2026-10-28');fs.mkdirSync(out,{recursive:true});const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.join(root,'src/inveja-s06-final-v2/index.tsx'),publicDir:path.join(root,'public-s06'),outDir:path.join(out,'bundle-v2')});
const composition=await selectComposition({serveUrl,id:'inveja-s06-final',browserExecutable});
if(process.argv.includes('--stills')){for(const frame of [10,22,35,49,56,70,84,135,228,296,368,374,382,450]){await renderStill({serveUrl,composition,browserExecutable,frame,imageFormat:'png',output:path.join(out,`quadro-${String(frame).padStart(3,'0')}.png`)});console.log('Quadro '+frame);}process.exit(0);}
let last=-10;await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:2,outputLocation:path.join(out,'inveja-s06-fullhd-v2-copacabana.mp4'),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p>=last+10){last=p;console.log('S06 '+p+'%')}}});console.log('S06 concluido');

