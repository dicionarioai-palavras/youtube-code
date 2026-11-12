// Renderiza todos os cortes de src/cortes.json (ou só os ids passados) para out/<id>.mp4, medindo o tempo.
// Uso: node scripts/render-todos.mjs [id1 id2 ...]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = process.argv.slice(2);
const ler = (f) => (fs.existsSync(f) ? [].concat(JSON.parse(fs.readFileSync(f, 'utf8'))) : []);
const cortes = [...ler(path.join(RAIZ, 'src', 'cortes.json')), ...ler(path.join(RAIZ, 'src', 'montagem.json'))].filter((c) => !ids.length || ids.includes(c.id));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;

const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.join(RAIZ, 'src', 'index.ts')});
console.log(`bundle: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
fs.mkdirSync(path.join(RAIZ, 'out'), {recursive: true});
for (const c of cortes) {
  const t = Date.now();
  const composition = await selectComposition({serveUrl, id: c.id, inputProps: c, browserExecutable});
  let ultimo = -10;
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 20, concurrency: process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null, inputProps: c, browserExecutable,
    outputLocation: path.join(RAIZ, 'out', `${c.id}.mp4`),
    onProgress: ({progress}) => { const p = Math.floor(progress * 100); if (p - ultimo >= 25) { ultimo = p; console.log(`  ${c.id}: ${p}%`); } },
  });
  const s = (Date.now() - t) / 1000;
  console.log(`OK ${c.id}: ${c.duracao}s de vídeo em ${s.toFixed(1)}s (${(s / c.duracao).toFixed(1)}x o tempo real)`);
}
