import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'');
const dir=root+'/palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v1';const out=dir+'/entrega';
const ff=root+'/_esteiras/cortes-redes-sociais/bin/ffmpeg.exe';const probe=root+'/_esteiras/cortes-redes-sociais/bin/ffprobe.exe';
const recipe=JSON.parse(fs.readFileSync(dir+'/receita-montagem.json'));const {shots,fps,frames}=recipe;const duration=frames/fps;
const run=(args)=>execFileSync(ff,['-v','error',...args],{maxBuffer:8e6});
const concat=(items,file)=>{const list=file+'.txt';fs.writeFileSync(list,items.map(p=>`file '${p.replaceAll('\\','/').replaceAll("'","'\\''")}'`).join('\n'));return list;};
// Uma única normalização para o conjunto, evitando saltos entre frases.
const rawDir=dir+'/originais/voz-cortes';fs.mkdirSync(rawDir,{recursive:true});
for(const s of shots){const rawFile=rawDir+'/'+s.id+'.wav';if(!fs.existsSync(rawFile))run(['-ss',String(s.start),'-i',root+'/'+recipe.narration_source.replaceAll('\\','/'),'-t',String(s.frames/fps),'-ar','48000','-ac','2','-c:a','pcm_s24le','-y',rawFile]);}
const rawVoice=concat(shots.map(s=>rawDir+'/'+s.id+'.wav'),dir+'/voz-concat');
run(['-f','concat','-safe','0','-i',rawVoice,'-af','loudnorm=I=-16:TP=-2:LRA=11','-ar','48000','-ac','2','-c:a','pcm_s24le','-t',String(duration),'-y',out+'/03-audio/01-voz.wav']);
for(const s of shots)run(['-ss',String(s.pilot_frame/fps),'-i',out+'/03-audio/01-voz.wav','-t',String(s.frames/fps),'-c:a','pcm_s24le','-y',out+'/03-audio/'+s.id+'-voz.wav']);
const music=root+'/audios/Batty McFadden - Slower - Kevin MacLeod.mp3';
run(['-ss','12','-i',music,'-t',String(duration),'-af',"afade=t=in:st=9.2:d=0.7,afade=t=out:st=29.8:d=1.2,volume=0.1",'-ar','48000','-ac','2','-c:a','pcm_s24le','-y',dir+'/musica-base.wav']);
run(['-i',dir+'/musica-base.wav','-i',out+'/03-audio/01-voz.wav','-filter_complex','[0:a][1:a]sidechaincompress=threshold=0.018:ratio=5:attack=20:release=260','-c:a','pcm_s24le','-y',out+'/03-audio/02-musica.wav']);
// Efeitos originais procedurais: cliques leves e ar de transição, sem amostras externas.
const samples=Math.round(duration*48000),pcm=Buffer.alloc(samples*4);let state=97253;
const noise=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296*2-1;};
const events=[{at:13.55,d:.09,type:'click'},{at:19.3,d:.12,type:'click'},{at:19.58,d:.08,type:'click'},{at:23.65,d:.7,type:'air'},{at:27.35,d:.14,type:'click'}];
for(let i=0;i<samples;i++){const time=i/48000;let value=0;for(const e of events){const t=time-e.at;if(t>=0&&t<e.d){value+=e.type==='click'?.055*Math.sin(2*Math.PI*1150*t)*Math.exp(-t*70):.018*noise()*Math.sin(Math.PI*t/e.d)**2;}}const v=Math.round(Math.max(-1,Math.min(1,value))*32767);pcm.writeInt16LE(v,i*4);pcm.writeInt16LE(v,i*4+2);}
const header=Buffer.alloc(44);header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(48000,24);header.writeUInt32LE(192000,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);fs.writeFileSync(out+'/03-audio/03-efeitos.wav',Buffer.concat([header,pcm]));
run(['-i',out+'/03-audio/01-voz.wav','-i',out+'/03-audio/02-musica.wav','-i',out+'/03-audio/03-efeitos.wav','-filter_complex','amix=inputs=3:normalize=0,alimiter=limit=0.891:level=0:latency=1','-c:a','pcm_s24le','-y',out+'/03-audio/00-mix.wav']);
for(const s of shots)for(const [stem,name] of [['02-musica.wav','musica'],['03-efeitos.wav','efeitos']])run(['-ss',String(s.pilot_frame/fps),'-i',out+'/03-audio/'+stem,'-t',String(s.frames/fps),'-c:a','pcm_s24le','-y',out+'/03-audio/'+s.id+'-'+name+'.wav']);
if(process.argv.includes('--audio-only')){console.log('AUDIO-PREPARADO');process.exit(0);}
// Remotion e FFmpeg usam relógios MP4 diferentes. Uniformizar antes de concatenar.
for(const s of shots){const p=out+'/02-cenas/'+s.id+'.mp4';const m=JSON.parse(execFileSync(probe,['-v','error','-select_streams','v:0','-show_entries','stream=time_base','-of','json',p]));if(m.streams[0].time_base!=='1/90000'){const temp=p+'.timescale.mp4';run(['-i',p,'-map','0:v:0','-an','-c:v','copy','-video_track_timescale','90000','-y',temp]);fs.renameSync(temp,p);}}
const list=concat(shots.map(s=>out+'/02-cenas/'+s.id+'.mp4'),dir+'/video-concat');
run(['-f','concat','-safe','0','-i',list,'-i',out+'/03-audio/00-mix.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart','-y',out+'/01-previa/inveja-piloto-38s.mp4']);
// XML Final Cut Pro 7 (xmeml), formato de intercâmbio aceito pelo Premiere.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rate='<rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>';
function mediaFile(p,id,n,audio=false){const format=audio?'<audio><samplecharacteristics><depth>24</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio>':'<video><samplecharacteristics><width>1920</width><height>1080</height><anamorphic>FALSE</anamorphic><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></video>';return `<file id="f-${id}"><name>${esc(path.basename(p))}</name><pathurl>${esc(pathToFileURL(p).href)}</pathurl>${rate}<duration>${n}</duration><media>${format}</media></file>`;}
function clip(p,id,start,n,audio=false,channel=1,linkIds=[],trackBase=1){return `<clipitem id="${id}"><name>${esc(path.basename(p))}</name><duration>${n}</duration>${rate}<start>${start}</start><end>${start+n}</end><in>0</in><out>${n}</out>${mediaFile(p,id,n,audio)}<sourcetrack><mediatype>${audio?'audio':'video'}</mediatype><trackindex>${channel}</trackindex></sourcetrack>${linkIds.map((x,i)=>`<link><linkclipref>${x}</linkclipref><mediatype>audio</mediatype><trackindex>${trackBase+i}</trackindex><clipindex>1</clipindex><groupindex>${Math.ceil(trackBase/2)}</groupindex></link>`).join('')}</clipitem>`;}
const videoFormat='<format><samplecharacteristics>'+rate+'<width>1920</width><height>1080</height><anamorphic>FALSE</anamorphic><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></format>';
function sequence(original){const name=original?'INVEJA - insercoes no mapa V5':'INVEJA - piloto 38 segundos';const total=original?24605:frames;let video='<track>'+shots.map((s,i)=>clip(out+'/02-cenas/'+s.id+'.mp4','v'+original+i,original?s.original_frame:s.pilot_frame,s.frames)).join('')+'</track>';let audio='';
 if(!original){for(const [index,name] of ['01-voz.wav','02-musica.wav','03-efeitos.wav'].entries()){for(let channel=1;channel<=2;channel++){const ids=['a'+index+'-1','a'+index+'-2'];audio+='<track>'+clip(out+'/03-audio/'+name,ids[channel-1],0,frames,true,channel,ids,index*2+1)+'<enabled>TRUE</enabled><locked>FALSE</locked><outputchannelindex>'+channel+'</outputchannelindex></track>';}}}
 else{for(const [a,stem] of ['voz','musica','efeitos'].entries())for(let channel=1;channel<=2;channel++)audio+='<track>'+shots.map((s,i)=>clip(out+'/03-audio/'+s.id+'-'+stem+'.wav','o-a'+a+'-'+channel+'-'+i,s.original_frame,s.frames,true,channel)).join('')+'<outputchannelindex>'+channel+'</outputchannelindex></track>';}
 return `<sequence id="seq-${original}"><name>${esc(name)}</name><duration>${total}</duration>${rate}<timecode>${rate}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode><media><video>${videoFormat}${video}</video><audio><numOutputChannels>2</numOutputChannels><format><samplecharacteristics><depth>24</depth><samplerate>48000</samplerate></samplecharacteristics></format><outputs><group><index>1</index><numchannels>2</numchannels><downmix>0</downmix><channel><index>1</index></channel><channel><index>2</index></channel></group></outputs>${audio}</audio></media></sequence>`;
}
for(const original of [false,true])fs.writeFileSync(out+'/04-premiere/'+(original?'inveja-insercoes-V5.xml':'inveja-piloto.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="5">'+sequence(original)+'</xmeml>');
const metadata=[];for(const s of shots){const p=out+'/02-cenas/'+s.id+'.mp4';const m=JSON.parse(execFileSync(probe,['-v','error','-count_frames','-show_entries','stream=codec_type,width,height,r_frame_rate,nb_read_frames,duration','-of','json',p]));const v=m.streams.find(x=>x.codec_type==='video');if(Number(v.nb_read_frames)!==s.frames||v.width!==1920||v.height!==1080||v.r_frame_rate!=='30/1')throw Error('Cena fora da receita: '+s.id);metadata.push({id:s.id,...v,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}
fs.writeFileSync(out+'/05-registros/verificacao-tecnica.json',JSON.stringify({checked_at:new Date().toISOString(),shots:metadata,frames,seconds:duration,premiere_import_tested:false,auditory_review:false},null,2));
console.log('ENTREGA-MONTADA '+duration+' segundos');
