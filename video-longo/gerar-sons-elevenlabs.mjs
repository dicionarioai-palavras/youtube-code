// Gera músicas (Eleven Music) e efeitos (Sound Effects) listados num JSON. Não refaz o que já existe.
// Uso: node gerar-sons-elevenlabs.mjs <pedidos.json> <pasta-saida>
// pedidos: [{id, tipo:"musica"|"efeito", prompt, segundos, loop?, plano?}]  (plano = composition_plan do Eleven Music: uma faixa em seções)
import fs from 'node:fs'; import path from 'node:path';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
loadExternalEnv();
const [arq, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const pedidos = JSON.parse(fs.readFileSync(arq, 'utf8'));
const um = async (p) => {
  const dest = path.join(out, p.id + '.mp3'); if (fs.existsSync(dest)) return console.log('já existe', p.id);
  const musica = p.tipo === 'musica';
  const url = musica ? 'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192' : 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192';
  const body = musica ? (p.plano ? {composition_plan: p.plano} : {prompt: p.prompt, music_length_ms: p.segundos * 1000, force_instrumental: true})
                      : {text: p.prompt, duration_seconds: p.segundos, prompt_influence: 0.5, ...(p.loop ? {loop: true, model_id: 'eleven_text_to_sound_v2'} : {})};
  for (let t = 1; t <= 2; t++) {
    try {
      const r = await fetch(url, {method: 'POST', headers: {'xi-api-key': getCredential('elevenlabs'), 'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: AbortSignal.timeout(300000)});
      if (!r.ok) { let d=''; try{d=JSON.stringify((await r.json()).detail).slice(0,200)}catch{}; console.log('ERRO', p.id, r.status, d); return; }
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); return console.log('OK', p.id);
    } catch (e) { console.log('falha', p.id, t, e.message); }
  }
};
const fila = [...pedidos]; await Promise.all(Array.from({length: 2}, async () => { while (fila.length) await um(fila.shift()); }));
console.log('FIM');
