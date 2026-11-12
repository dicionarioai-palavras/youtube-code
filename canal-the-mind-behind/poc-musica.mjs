// POC EP09: trilha pelo ElevenLabs Music. Uso: node poc-musica.mjs <saida.mp3> <segundos> "<prompt>"
import fs from 'node:fs';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
loadExternalEnv();
const [out, seg, prompt] = process.argv.slice(2);
const r = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', {method: 'POST',
  headers: {'xi-api-key': getCredential('elevenlabs'), 'Content-Type': 'application/json'},
  body: JSON.stringify({prompt, music_length_ms: Number(seg) * 1000, force_instrumental: true}), signal: AbortSignal.timeout(170000)});
if (!r.ok) { let d=''; try{d=JSON.stringify((await r.json()).detail).slice(0,300)}catch{}; console.log('ERRO', r.status, d); process.exit(1); }
fs.writeFileSync(out, Buffer.from(await r.arrayBuffer())); console.log('OK', out, r.headers.get('character-cost'));
