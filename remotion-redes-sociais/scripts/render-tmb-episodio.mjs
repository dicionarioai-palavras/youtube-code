import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const b='/usr/bin/google-chrome';
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts')});
for (const id of ['tmb-thumb-ep01-final-a','tmb-thumb-ep01-final-b']){const t=await selectComposition({serveUrl,id,browserExecutable:b});await renderStill({composition:t,serveUrl,browserExecutable:b,output:`out/canal-dark/${id}.png`});}
const c=await selectComposition({serveUrl,id:'tmb-ep01',browserExecutable:b});
let last=0;
await renderMedia({composition:c,serveUrl,browserExecutable:b,codec:'h264',crf:21,muted:true,concurrency:2,outputLocation:'out/canal-dark/ep01-video-mudo.mp4',
 onProgress:({progress})=>{const p=Math.floor(progress*100);if(p>=last+5){last=p;console.log('progresso',p+'%',new Date().toISOString())}}});
console.log('FIM');
