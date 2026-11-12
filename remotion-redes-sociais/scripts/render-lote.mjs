// Renderiza um lote de cortes de uma vez (um único bundle): vídeo completo + as mixagens de áudio.
// Uso: node scripts/render-lote.mjs <pasta-saida> <id> [id...]
// Gera, por corte: <id>.mp4 (mix completo) e <id>.<mix>.wav para voz, sem-voz e efeitos; sem-trilha = voz + efeitos (ffmpeg)
// (sem voz original -> completo, efeitos e sem-trilha = efeitos). Depois: scripts/entregar.mjs monta as versões finais.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const [saida, ...ids] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const concurrency = process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null;
fs.mkdirSync(saida, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

for (const id of ids) {
  const base = await selectComposition({serveUrl, id, browserExecutable});
  const temVoz = (base.props.palavras ?? []).length > 0;
  const mixes = temVoz ? ['voz', 'sem-voz', 'efeitos'] : ['efeitos'];
  for (const mix of ['completo', ...mixes]) {
    const out = path.join(saida, mix === 'completo' ? `${id}.mp4` : `${id}.${mix}.wav`);
    if (fs.existsSync(out)) { console.log(`pula ${out}`); continue; }
    const inputProps = {...base.props, mix};
    const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
    const t0 = Date.now();
    await renderMedia({
      composition, serveUrl, inputProps, browserExecutable, concurrency, offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024, outputLocation: out.replace(/(\.\w+)$/, '.tmp$1'),
      ...(mix === 'completo' ? {codec: 'h264', crf: 21, audioBitrate: '192k', x264Preset: 'medium'} : {codec: 'wav'}),
    });
    fs.renameSync(out.replace(/(\.\w+)$/, '.tmp$1'), out);
    console.log(`OK ${id} [${mix}] ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  // sem-trilha = voz + efeitos (a mixagem é linear: sai igual ao render e economiza um render inteiro)
  const st = path.join(saida, `${id}.sem-trilha.wav`);
  if (!fs.existsSync(st)) {
    const e = path.join(saida, `${id}.efeitos.wav`);
    if (temVoz) execFileSync(process.env.FFMPEG || 'ffmpeg', ['-v', 'error', '-y', '-i', path.join(saida, `${id}.voz.wav`), '-i', e,
      '-filter_complex', 'amix=inputs=2:normalize=0:duration=longest', st]);
    else fs.copyFileSync(e, st);
  }
}
console.log('LOTE-FIM');
