import {fileURLToPath} from 'node:url';
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');const dir=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v2';const old=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v1';const out=dir+'/entrega';const ff=root+'/_esteiras/cortes-redes-sociais/bin/ffmpeg.exe';
const run=args=>execFileSync(ff,['-v','error',...args],{maxBuffer:4e6});
fs.copyFileSync(old+'/entrega/08-grafismos/c026-028-regua-alpha.mov',out+'/08-grafismos/c026-028-regua-alpha.mov');
// O plano gerado é desacelerado para cobrir o bloco de10,7s; áudio gerado descartado.
run(['-loop','1','-i',dir+'/originais/restaurante-realista.png','-i',out+'/08-grafismos/c026-028-regua-alpha.mov','-filter_complex','[0:v]scale=1998:1124,crop=1920:1080,setsar=1,fps=30[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v]','-map','[v]','-an','-frames:v','321','-video_track_timescale','90000','-threads','1','-c:v','libx264','-crf','18','-preset','fast','-y',out+'/02-cenas/c026-028-distancia.mp4']);
// Dissolução sobre vídeos alinhados: atuação real guia o personagem, sem sintetizar voz.
run(['-i',dir+'/originais/luiz-real-2s.mp4','-i',dir+'/originais/luiz-atuacao-personagem.mp4','-filter_complex',"[0:v]fps=30,scale=1920:1080,setsar=1,setpts=PTS-STARTPTS[a];[1:v]fps=30,scale=1920:1080,setsar=1,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1[b];[a][b]blend=all_expr='A*(1-min(1,max(0,(T-0.55)/0.6)))+B*min(1,max(0,(T-0.55)/0.6))',format=yuv420p[v]",'-map','[v]','-an','-frames:v','48','-video_track_timescale','90000','-threads','1','-c:v','libx264','-crf','18','-preset','fast','-y',out+'/02-cenas/c031-camera.mp4']);
for(const name of ['c033-casa.mp4','c118-santorini.mp4'])fs.copyFileSync(old+'/entrega/02-cenas/'+name,out+'/02-cenas/'+name);
run(['-i',dir+'/originais/restaurante-atuacao.mp4','-vf','scale=1920:1080,setsar=1,fps=30','-frames:v','137','-an','-video_track_timescale','90000','-threads','1','-c:v','libx264','-crf','18','-preset','fast','-y',out+'/02-cenas/c004-005-almoco.mp4']);
console.log('CLIPES-V2-MONTADOS');
