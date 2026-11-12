// Renderiza o EP06 (tmb-ep06, montagem v2) em partes, para não perder tudo se algo cair.
// Uso: node scripts/render-tmb-ep06.mjs [parte] [total-de-partes] [concurrency]   (sem parte: todas, em sequência)
// Saída: out/canal-dark/ep06/parte-N.mp4 (mudo). Juntar com ffmpeg concat e depois pôr o mix.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const b = process.env.CHROME || (process.platform === 'win32' ? undefined : '/usr/bin/google-chrome');
const [parteArg, totalArg, concArg] = process.argv.slice(2);
const total = Number(totalArg || 6), conc = Number(concArg || 2);
const serveUrl = await bundle({entryPoint: path.resolve('src/entry-ep06.tsx')});
const c = await selectComposition({serveUrl, id: 'tmb-ep06', browserExecutable: b});
const N = c.durationInFrames, passo = Math.ceil(N / total);
fs.mkdirSync('out/canal-dark/ep06', {recursive: true});
const partes = parteArg ? [Number(parteArg)] : [...Array(total).keys()].map((i) => i + 1);
for (const p of partes) {
  const ini = (p - 1) * passo, fim = Math.min(N, p * passo) - 1;
  let last = -1;
  await renderMedia({composition: c, serveUrl, browserExecutable: b, codec: 'h264', crf: 19, muted: true, concurrency: conc,
    frameRange: [ini, fim], outputLocation: `out/canal-dark/ep06/parte-${p}.mp4`,
    onProgress: ({progress}) => { const q = Math.floor(progress * 20); if (q > last) { last = q; console.log(`parte ${p}`, q * 5 + '%', new Date().toISOString()); } }});
  console.log('FIM parte', p, ini, fim);
}
