import fs from 'node:fs';import path from 'node:path';import {bundle} from '@remotion/bundler';import {selectComposition,renderStill} from '@remotion/renderer';
const root=process.cwd(),out=path.resolve(root,'../../canais/palavras/episodios/ep01-inveja/videos/remotion/S05-aprovacao-2026-10-28');fs.mkdirSync(out,{recursive:true});const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const serveUrl=await bundle({entryPoint:path.join(root,'src/inveja-s05-aprovacao/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(out,'bundle')});
const comp=await selectComposition({serveUrl,id:'inveja-s05-aprovacao',browserExecutable,inputProps:{stage:0}});
for(let stage=0;stage<12;stage++){await renderStill({serveUrl,composition:{...comp,props:{stage}},browserExecutable,inputProps:{stage},frame:0,imageFormat:'png',output:path.join(out,'proposta-'+String(stage).padStart(2,'0')+'.png')});console.log('Prancha '+(stage+1)+'/12');}console.log('APROVACAO '+out);
