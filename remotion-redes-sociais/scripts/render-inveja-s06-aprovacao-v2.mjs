import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderStill} from '@remotion/renderer';
const root=process.cwd(),out=path.resolve(root,'../../palavras/youtube/peças/inveja/videos/remotion/S06-aprovacao-v2-2026-10-28');fs.mkdirSync(out,{recursive:true});const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.join(root,'src/inveja-s06-aprovacao-v2/index.tsx'),publicDir:path.join(root,'public-s06'),outDir:path.join(out,'bundle')});
const comp=await selectComposition({serveUrl,id:'inveja-s06-aprovacao',browserExecutable,inputProps:{stage:0}});
for(let stage=0;stage<9;stage++){await renderStill({serveUrl,composition:{...comp,props:{stage}},browserExecutable,inputProps:{stage},frame:0,imageFormat:'png',output:path.join(out,'proposta-'+String(stage).padStart(2,'0')+'.png')});console.log('Quadro '+(stage+1)+'/9');}

