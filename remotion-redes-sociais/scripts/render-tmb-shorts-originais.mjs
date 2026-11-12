// Renderiza os Shorts originais (composições tmb-lote00-*) e junta com a mixagem (narração + trilha).
// Uso: node scripts/render-tmb-shorts-originais.mjs <pasta-mix> <pasta-saida> [O1 O2 ...]
//   <pasta-mix>/<id>-en.wav = áudio final do Short (-14 LUFS); <pasta-saida>/<id>.mp4 = vídeo final.
//   Entrada: src/entry-lote00.tsx (só o lote 0). Concorrência 1 (máquina compartilhada).
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {execSync} from 'node:child_process';
const [mix, saida, ...ids] = process.argv.slice(2);
const b = fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined;
const S = JSON.parse(fs.readFileSync('src/canal-dark/lote00-shorts.json', 'utf8')).filter((s) => !ids.length || ids.includes(s.id));
const serveUrl = await bundle({entryPoint: path.resolve('src/entry-lote00.tsx')});
fs.mkdirSync(saida, {recursive: true});
for (const s of S) {
  const c = await selectComposition({serveUrl, id: `tmb-lote00-${s.id}`, browserExecutable: b});
  const mudo = path.join(saida, `${s.id}-mudo.mp4`);
  await renderMedia({composition: c, serveUrl, browserExecutable: b, codec: 'h264', crf: 19, muted: true, concurrency: 1, outputLocation: mudo});
  // junta o áudio e confere a decodificação (no lote 0 a primeira junção saiu corrompida duas vezes; refazer resolveu)
  const final = path.join(saida, s.id + '.mp4');
  for (let tent = 1; tent <= 3; tent++) {
    await new Promise((r) => setTimeout(r, 3000));
    execSync(`ffmpeg -y -v error -i "${mudo}" -i "${path.join(mix, s.id + '-en.wav')}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "${final}"`);
    const erros = execSync(`ffmpeg -v error -i "${final}" -f null - 2>&1 | wc -l`).toString().trim();
    if (erros === '0') break;
    console.log('junção com erro, refazendo', s.id, tent);
  }
  console.log('ok', s.id, new Date().toISOString());
}
