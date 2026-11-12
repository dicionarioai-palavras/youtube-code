import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';import {selectComposition,renderMedia} from '@remotion/renderer';
const root=path.resolve('../..');const d=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1';const out=d+'/entrega';
const ff=root+'/_esteiras/cortes-redes-sociais/bin/ffmpeg.exe';const run=args=>execFileSync(ff,['-v','error',...args],{maxBuffer:4e6});
const serveUrl=await bundle({entryPoint:path.resolve('src/PilotoInveja.tsx')});
const inputProps={kind:'distance-overlay',frames:321};const chromiumOptions={gl:'swangle'};
const composition=await selectComposition({serveUrl,id:'PilotoInveja',inputProps,chromiumOptions});
fs.mkdirSync(out+'/08-grafismos',{recursive:true});const overlay=out+'/08-grafismos/c026-028-regua-alpha.mov';
console.log('Renderizando régua transparente');
await renderMedia({serveUrl,composition,inputProps,chromiumOptions,binariesDirectory:path.resolve('.runtime-piloto'),outputLocation:overlay,codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',imageFormat:'png',concurrency:1,ffmpegOverride:({args})=>[...args.slice(0,-1),'-threads','1',args.at(-1)],onProgress:p=>{if(p.renderedFrames&&p.renderedFrames%90===0)console.log('Régua '+p.renderedFrames);}});
console.log('Régua pronta');
run(['-i',d+'/originais/mesa-distancia.mp4','-i',overlay,'-filter_complex','[0:v]scale=1920:1080,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=1[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v]','-map','[v]','-an','-frames:v','321','-threads','1','-c:v','libx264','-crf','18','-preset','fast','-y',out+'/02-cenas/c026-028-distancia.mp4']);
run(['-i','public/piloto-inveja-v1/camera.mp4','-vf','scale=2054:1156,crop=1920:1080:67:38,setsar=1','-frames:v','48','-r','30','-an','-threads','1','-c:v','libx264','-crf','18','-y',out+'/02-cenas/c031-camera.mp4']);
// Banco fotográfico: enquadramento horizontal com movimento discreto, sem geração paga.
run(['-loop','1','-i',d+'/originais/pixabay-casa.jpg','-vf',"scale=2304:-1,crop=1920:1080:x='192+12*sin(t/4)':y='(ih-oh)/2',setsar=1",'-frames:v','111','-r','30','-an','-threads','1','-c:v','libx264','-crf','18','-y',out+'/02-cenas/c033-casa.mp4']);
// O texto Grécia é tipografia local. O vídeo não é recriado por IA.
run(['-ss','2','-i',d+'/originais/pixabay-santorini.mp4','-vf','scale=1920:1080,setsar=1','-frames:v','46','-r','30','-an','-threads','1','-c:v','libx264','-crf','18','-y',out+'/02-cenas/c118-santorini.mp4']);
console.log('CENAS-FINAIS-PRONTAS');process.exit(0);
