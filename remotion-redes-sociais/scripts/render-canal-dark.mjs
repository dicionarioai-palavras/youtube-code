// Renderiza a identidade do canal dark (The Mind Behind) para out/canal-dark/.
// Uso: node scripts/render-canal-dark.mjs [stills|videos|tudo]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const modo = process.argv[2] || 'tudo';
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const out = 'out/canal-dark';
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const stills = ['tmb-logo-horizontal', 'tmb-logo-vertical', 'tmb-avatar', 'tmb-marca-dagua', 'tmb-banner', 'tmb-thumb-ep01-a', 'tmb-thumb-ep01-b'];
const videos = ['tmb-abertura', 'tmb-demo-estilo', 'tmb-short-modelo'];
if (modo !== 'videos') for (const id of stills) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  await renderStill({composition, serveUrl, browserExecutable, output: `${out}/${id}.png`, imageFormat: 'png'});
  console.log('OK', id);
}
if (modo !== 'stills') for (const id of videos) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  await renderMedia({composition, serveUrl, browserExecutable, codec: 'h264', crf: 20, outputLocation: `${out}/${id}.mp4`});
  console.log('OK', id);
}
