import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const dir=root+'/canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1';
const ff=root+'/_esteiras/cortes-redes-sociais/bin/ffmpeg.exe';
const out=dir+'/entrega';for(const sub of ['01-previa','02-cenas','03-audio','04-premiere','05-registros','06-fontes'])fs.mkdirSync(out+'/'+sub,{recursive:true});
const pub=root+'/code/remotion-redes-sociais/public/piloto-inveja-v1';fs.mkdirSync(pub,{recursive:true});
for(const file of fs.readdirSync(dir+'/originais').filter(f=>/\.(png|jpg|mp4)$/.test(f)))fs.copyFileSync(dir+'/originais/'+file,pub+'/'+file);
const raw=root+'/canais/palavras/episodios/ep01-inveja/sessoes-brutas/20261016_211135/20261016_211135.mp4';
const voice=root+'/canais/palavras/episodios/ep01-inveja/videos/inveja-v2/inveja-narracao-final-v5.wav';
// Alinhamento pela correlação do envelope da voz; não altera a narração final.
function envelope(file,start,duration){const b=execFileSync(ff,['-v','error','-ss',String(start),'-i',file,'-t',String(duration),'-vn','-ac','1','-ar','8000','-f','f32le','pipe:1'],{maxBuffer:8e6});const a=new Float32Array(b.buffer,b.byteOffset,b.length/4);const e=[];for(let i=0;i+80<=a.length;i+=80){let s=0;for(let k=0;k<80;k++)s+=a[i+k]**2;e.push(Math.sqrt(s/80));}return e;}
const ref=envelope(voice,79.13,1.3),rawEnv=envelope(raw,247,5);let best={score:-1,offset:0};
for(let t=0;t<rawEnv.length-ref.length;t++){const seg=rawEnv.slice(t,t+ref.length);const ma=ref.reduce((a,b)=>a+b)/ref.length,mb=seg.reduce((a,b)=>a+b)/seg.length;let xy=0,xx=0,yy=0;for(let i=0;i<ref.length;i++){const a=ref[i]-ma,b=seg[i]-mb;xy+=a*b;xx+=a*a;yy+=b*b;}const score=xy/Math.sqrt(xx*yy);if(score>best.score)best={score,offset:t/100};}
const cameraStart=247+best.offset;
execFileSync(ff,['-v','error','-ss',String(cameraStart),'-i',raw,'-t','1.6','-vf','scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1','-an','-r','30','-c:v','libx264','-preset','fast','-crf','19','-y',pub+'/camera.mp4']);
const shots=[
 {id:'c004-005-almoco',kind:'base',start:11.88,end:16.44,source_scenes:[4,5]},
 {id:'c006-008-sorriso',kind:'smile',start:16.44,end:21.04,source_scenes:[6,7,8]},
 {id:'c009-011-salario',kind:'salary',start:21.04,end:29.63,source_scenes:[9,10,11]},
 {id:'c012-013-calculadora',kind:'calculator',start:29.63,end:32.34,source_scenes:[12,13]},
 {id:'c026-028-distancia',kind:'distance',start:62.65,end:73.36,source_scenes:[26,27,28]},
 {id:'c031-camera',kind:'camera',start:79.13,end:80.73,source_scenes:[31],camera_alignment:{raw_start:cameraStart,correlation:best.score,method:'envelope RMS 10ms; conferir labial no Premiere'}},
 {id:'c033-casa',kind:'house',start:82.36,end:86.07,source_scenes:[33]},
 {id:'c118-santorini',kind:'travel',start:351.77,end:353.30,source_scenes:[118]}
];
let cursor=0;for(const s of shots){s.frames=Math.round((s.end-s.start)*30);s.pilot_frame=cursor;s.original_frame=Math.round(s.start*30);cursor+=s.frames;const p=out+'/03-audio/'+s.id+'-voz.wav';if(!fs.existsSync(p))execFileSync(ff,['-v','error','-ss',String(s.start),'-i',voice,'-t',String(s.frames/30),'-ac','2','-ar','48000','-c:a','pcm_s24le','-y',p]);}
const recipe={schema_version:1,scope:'Inveja',fps:30,width:1920,height:1080,frames:cursor,shots,narration_source:path.relative(root,voice),note:'Seleção técnica de trechos, não abertura contínua. Cada corte conserva vínculo temporal ao mapa V5. Câmera c031 adicionada ao piloto; c072 continua prevista no mapa integral.'};
fs.writeFileSync(dir+'/receita-montagem.json',JSON.stringify(recipe,null,2));fs.writeFileSync(out+'/05-registros/receita-montagem.json',JSON.stringify(recipe,null,2));
console.log(JSON.stringify({frames:cursor,seconds:cursor/30,camera_alignment:best,cameraStart}));
