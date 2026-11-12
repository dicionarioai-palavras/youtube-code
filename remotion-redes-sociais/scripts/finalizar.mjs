// Render das versões finais (vídeo + mixagens) e prévias em quadro.
// Uso:
//   node scripts/finalizar.mjs quadros <id> <frame,frame,...> <pasta>      -> JPEGs de conferência
//   node scripts/finalizar.mjs video <id> <saida.mp4> [mix]                 -> vídeo (mix: completo | sem-trilha | voz)
//   node scripts/finalizar.mjs audio <id> <saida.wav> <mix>                 -> só o áudio da mixagem
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [modo, id, a1, a2] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const concurrency = process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const base = await selectComposition({serveUrl, id, browserExecutable});

if (modo === 'quadros') {
  for (const f of a1.split(',').map(Number)) {
    await renderStill({composition: base, serveUrl, frame: f, output: path.join(a2, `${id}_${f}.jpg`), imageFormat: 'jpeg', scale: 0.4, inputProps: base.props, browserExecutable});
  }
} else {
  const mix = (modo === 'video' ? a2 : a2) || 'completo';
  const inputProps = {...base.props, mix};
  const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
  const t0 = Date.now();
  await renderMedia({
    composition, serveUrl, inputProps, browserExecutable, concurrency, outputLocation: a1,
    ...(modo === 'audio' ? {codec: 'wav'} : {codec: 'h264', crf: 21, audioBitrate: '192k', x264Preset: 'medium'}),
  });
  console.log(`${id} [${modo}/${mix}] ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${a1}`);
}
