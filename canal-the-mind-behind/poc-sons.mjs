// POC EP09: gera camadas de música e efeitos pelo Sound Effects do ElevenLabs. Uso: node poc-sons.mjs <pasta-saida>
import fs from 'node:fs'; import path from 'node:path';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
loadExternalEnv();
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const sons = [
 ['bed-intro', 'dark cinematic true crime underscore, deep low synth drone with slow sparse melancholic piano notes, tense and minimal, no drums', 22, true],
 ['bed-noite', 'ominous night city ambience, distant traffic, faint police siren far away, low dark rumble', 20, true],
 ['bed-tensao', 'slow dark suspense ambient pad with a quiet ticking clock, unsettling, minimal', 22, true],
 ['bed-revelacao', 'dark cinematic low pulsing synth like a slow heartbeat, building suspense, eerie strings', 20, true],
 ['sfx-corrida', 'man running fast on wet pavement at night, urgent footsteps passing', 4, false],
 ['sfx-algema', 'metal handcuff ratcheting click as it locks on a wrist, close up', 2, false],
 ['sfx-porta', 'apartment door closing and a lock turning, quiet hallway', 3, false],
 ['sfx-impacto', 'deep cinematic boom impact hit with long dark reverb tail', 5, false],
 ['sfx-gaveta', 'wooden bedside drawer sliding open in a silent room', 2, false],
 ['sfx-riser', 'dark reverse whoosh riser building into silence', 3, false],
];
for (const [id, text, dur, loop] of sons) {
  const dest = path.join(out, id + '.mp3'); if (fs.existsSync(dest)) continue;
  const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192', {method: 'POST',
    headers: {'xi-api-key': getCredential('elevenlabs'), 'Content-Type': 'application/json'},
    body: JSON.stringify({text, duration_seconds: dur, prompt_influence: 0.5, ...(loop ? {loop: true, model_id: 'eleven_text_to_sound_v2'} : {})}), signal: AbortSignal.timeout(180000)});
  if (!r.ok) { let d=''; try{d=JSON.stringify((await r.json()).detail).slice(0,200)}catch{}; console.log('ERRO', id, r.status, d); continue; }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); console.log('OK', id, r.headers.get('character-cost'));
}
const s = await (await fetch('https://api.elevenlabs.io/v1/user/subscription', {headers: {'xi-api-key': getCredential('elevenlabs')}})).json();
console.log('restantes', s.character_limit - s.character_count);
