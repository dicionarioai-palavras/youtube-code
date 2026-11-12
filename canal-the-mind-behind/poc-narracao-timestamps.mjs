// POC EP09 (10/11/2026): gera narração por bloco com marcação de tempo (with-timestamps) para ancorar efeitos.
// Uso: node poc-narracao-timestamps.mjs <arquivo.txt> <pasta-saida> [estabilidade]
import fs from 'node:fs'; import path from 'node:path';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
import {vozes} from '../apis-externas/src/elevenlabs.mjs';
loadExternalEnv();
const [arq, saida, est] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(new URL('./voz-config.json', import.meta.url), 'utf8'));
const txt = fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n');
const blocos = [...txt.matchAll(/BLOCO (\S+)\n=====\n([\s\S]*?)\n=====/g)].map((m) => ({id: m[1], texto: m[2].trim()}));
fs.mkdirSync(saida, {recursive: true});
const voz = (await vozes()).find((v) => v.nome === cfg.voz_nome);
for (const b of blocos) {
  const dest = path.join(saida, b.id + '.mp3'); if (fs.existsSync(dest)) { console.log('já existe', b.id); continue; }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz.voice_id}/with-timestamps?output_format=${cfg.formato}`, {
    method: 'POST', headers: {'xi-api-key': getCredential('elevenlabs'), 'Content-Type': 'application/json'},
    body: JSON.stringify({text: b.texto, model_id: cfg.modelo, voice_settings: {stability: Number(est || 0.4), similarity_boost: cfg.similaridade, style: cfg.estilo, use_speaker_boost: true}}),
    signal: AbortSignal.timeout(300000)});
  if (!r.ok) { let d=''; try{d=JSON.stringify((await r.json()).detail).slice(0,200)}catch{}; console.log('ERRO', b.id, r.status, d); process.exit(1); }
  const j = await r.json();
  fs.writeFileSync(dest, Buffer.from(j.audio_base64, 'base64'));
  fs.writeFileSync(path.join(saida, b.id + '.alinhamento.json'), JSON.stringify(j.normalized_alignment || j.alignment));
  console.log('OK', b.id, b.texto.length);
}
