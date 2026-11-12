import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const root='C:/Users/Dell/Desktop/Redes-sociais',d=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v4',project=root+'/code/remotion-redes-sociais',pub=project+'/public/piloto-inveja-v4',ff=root+'/_esteiras/cortes-redes-sociais/bin/ffmpeg.exe';
const run=args=>execFileSync(ff,['-hide_banner','-loglevel','error','-filter_complex_threads','1',...args],{maxBuffer:3e6});
for(const sub of ['background'])fs.mkdirSync(pub+'/'+sub,{recursive:true});
fs.copyFileSync(d+'/originais/mesa-brasileira.png',pub+'/mesa-brasileira.png');
const segments=[
 {name:'01-cafe-intimo',start:0,end:11.8666667,kind:'video',file:'pixabay-2339.mp4',ss:4,filter:'eq=saturation=0.74:brightness=-0.035'},
 {name:'02-almoco-noticia',start:11.8666667,end:21.0333333,kind:'still',file:'mesa-brasileira.png',zoom:1.015,delta:.035,x:.5,y:.5},
 {name:'03-salario-sorriso',start:21.0333333,end:29.6333333,kind:'video',file:'pixabay-2339.mp4',ss:25,filter:'eq=saturation=0.74:brightness=-0.04'},
 {name:'04-calculadora',start:29.6333333,end:39.7,kind:'video',file:'pixabay-31673.mp4',ss:0,filter:'eq=saturation=0.74:brightness=-0.04'},
 {name:'05-atmosfera',start:39.7,end:46.5,kind:'video',file:'mesa-atmosfera.mp4',ss:0,filter:'eq=saturation=0.85:brightness=-0.045',slow:true},
 {name:'06-vale-refeicao',start:46.5,end:54.9333333,kind:'still',file:'mesa-brasileira.png',zoom:1.65,delta:.035,x:.25,y:.9},
 {name:'07-nada-mudou',start:54.9333333,end:62.6666667,kind:'video',file:'pixabay-2339.mp4',ss:18,filter:'eq=saturation=0.74:brightness=-0.04'},
 {name:'08-distancia-regua',start:62.6666667,end:73.3666667,kind:'still',file:'mesa-brasileira.png',zoom:1.04,delta:.025,x:.5,y:.5},
 {name:'09-confissao',start:73.3666667,end:79.1333333,kind:'video',file:'pixabay-2339.mp4',ss:27,filter:'eq=saturation=0.74:brightness=-0.04'},
 {name:'10-luiz-real',start:79.1333333,end:80.7333333,kind:'camera',file:root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v3/entrega/02-cenas/camera-real-remotion.mp4'},
 {name:'11-pergunta-aberta',start:80.7333333,end:82.3666667,kind:'still',file:'mesa-brasileira.png',zoom:1.08,delta:-.02,x:.5,y:.5}
].map(s=>({...s,start_frame:Math.round(s.start*30),frames:Math.round(s.end*30)-Math.round(s.start*30)}));
if(segments.reduce((n,s)=>n+s.frames,0)!==2471)throw Error('Timeline inválida');
for(const s of segments){const out=d+'/entrega/02-cenas/'+s.name+'-base.mp4';if(fs.existsSync(out)){console.log('REUSO '+s.name);continue;}const file=s.kind==='camera'?s.file:d+'/originais/'+s.file;const duration=s.frames/30;
 if(s.kind==='still'){
 const z=`${s.zoom}+(${s.delta})*on/${Math.max(1,s.frames-1)}`;const vf=`scale=2880:1620,zoompan=z='${z}':x='(iw-iw/zoom)*${s.x}':y='(ih-ih/zoom)*${s.y}':d=${s.frames}:s=1920x1080:fps=30,setsar=1,eq=saturation=0.9:contrast=1.015`;
 run(['-i',file,'-vf',vf,'-frames:v',String(s.frames),'-an','-c:v','libx264','-crf','18','-preset','fast','-threads','2','-pix_fmt','yuv420p','-video_track_timescale','90000','-y',out]);
 }else {const input=s.kind==='camera'?['-i',file]:['-ss',String(s.ss??0),'-i',file];let vf=`${s.slow?'setpts=1.4*PTS,':''}scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,${s.filter??'eq=saturation=1'},tpad=stop_mode=clone:stop_duration=2`;
 run([...input,'-vf',vf,'-frames:v',String(s.frames),'-an','-c:v','libx264','-crf','18','-preset','fast','-threads','2','-pix_fmt','yuv420p','-video_track_timescale','90000','-y',out]);}
 console.log('BASE '+s.name);
}
const list=d+'/entrega/05-registros/base-concat.txt';fs.writeFileSync(list,segments.map(s=>`file '${d}/entrega/02-cenas/${s.name}-base.mp4'`).join('\n'));
const base=d+'/entrega/02-cenas/00-base-sem-grafismos.mp4';run(['-f','concat','-safe','0','-i',list,'-c','copy','-y',base]);
// Pequena dissolução na passagem banco→mesa; apenas em 11,5–11,866s. Assim o corte não troca textura de forma chapada.
const bridged=d+'/entrega/02-cenas/00-base-transicoes.mp4';
fs.copyFileSync(base,bridged);
// JPEGs indexados tornam o Remotion independente de decodificação concorrente de vídeo no navegador.
run(['-i',bridged,'-vf','fps=30','-q:v','3','-threads','2','-frames:v','2471','-y',pub+'/background/%06d.jpg']);
const audio=root+'/palavras/youtube/peças/inveja/videos/inveja-v2/inveja-narracao-final-v5.wav';
run(['-i',audio,'-t',String(2471/30),'-ar','48000','-ac','2','-c:a','pcm_s24le','-y',d+'/entrega/03-audio/01-voz-original.wav']);
const transcript=JSON.parse(fs.readFileSync(root+'/palavras/youtube/peças/inveja/videos/inveja-v2/inveja-narracao-final-v5-traancricao.json'));const words=transcript.segments.flatMap(s=>s.words).filter(w=>w.start<82.36);fs.writeFileSync(d+'/direcao/transcricao-trecho.json',JSON.stringify(words.map(w=>({start:w.start,duration:w.duration,text:w.text})),null,2));
fs.writeFileSync(d+'/receita-base.json',JSON.stringify({fps:30,width:1920,height:1080,frames:2471,source_audio:audio.split(root+'/')[1],audio_sha256:crypto.createHash('sha256').update(fs.readFileSync(audio)).digest('hex'),segments,bank_footage:'2339 Life-Of-Vids e31673 kelvinreislavras, uso ilustrativo de convívio/café sem atribuir inveja ou identidade aos participantes',camera:'Tomada original preservada do tratamento Remotion v3; mesma fala, agora posição cronológica79.13s.',pending:'Cortes finos/sincronia por revisão no Premiere; grafismos e mix seguem na etapa seguinte.'},null,2));console.log('BASE-E-QUADROS-PRONTOS');
