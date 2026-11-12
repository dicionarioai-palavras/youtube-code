// Renderiza só a cartela final (Palavras) de cada corte, sem áudio: out/cartelas/<id>.mp4
// Serve para trocar o fim de um vídeo já pronto sem refazer o vídeo inteiro (ver scripts/fim-por-marca.mjs).
// Uso: node scripts/render-cartelas.mjs <id> [id...]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fimConteudo} from './pecas-util.mjs';
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
fs.mkdirSync('out/cartelas', {recursive: true});
for (const id of process.argv.slice(2)) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  const p = composition.props;
  if (!p.cta) { console.log(`${id}: sem cartela (luiz)`); continue; }
  const fps = composition.fps;
  const inicio = Math.round(fimConteudo(p, fps) * fps);
  await renderMedia({composition, serveUrl, browserExecutable, codec: 'h264', crf: 18, muted: true,
    frameRange: [inicio, composition.durationInFrames - 1], outputLocation: `out/cartelas/${id}.mp4`});
  console.log(`OK ${id}: cartela ${(composition.durationInFrames - inicio) / fps}s`);
}
