import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const d=path.join(root,'palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v3');
const fp=JSON.parse(fs.readFileSync(path.join(d,'render-fingerprint.json')));const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(sha(path.join(root,'code/remotion-redes-sociais/src/PilotoInvejaV3.tsx'))!==fp.source||sha(path.join(d,'receita-base.json'))!==fp.recipe)throw Error('Direção/fonte mudou: revisar a rodada antes de remontar.');
for(const f of ['feed-continuo-sem-audio.mp4','camera-real-remotion.mp4'])if(!fs.existsSync(path.join(d,'entrega/02-cenas',f)))throw Error('Plano local ausente; recuperar/renderizar, não chamar API automaticamente.');
execFileSync(process.execPath,[path.join(root,'code/video-longo/montar-entrega-v3.mjs'),'--audio-only'],{stdio:'inherit'});
console.log('Retomada local sem importação de executor API.');
