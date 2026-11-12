// Loudnorm em duas passadas (-14 LUFS, pico -1.5 dBTP): mede e depois aplica de forma linear.
// A passada única do ffmpeg fica 2-3 LU abaixo do alvo em vídeos curtos.
import {spawnSync} from 'node:child_process';

const ALVO = 'I=-14:TP=-1.5:LRA=11';

// entradas: argumentos -i do ffmpeg; filtro: filter_complex que deixa o áudio pronto em [pre]
// devolve o trecho de filter_complex que transforma [pre] em [a], já com as medidas da 1ª passada
export function loud2(FFMPEG, entradas, filtro) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-nostats', ...entradas, '-filter_complex',
    `${filtro};[pre]loudnorm=${ALVO}:print_format=json[o]`, '-map', '[o]', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1));
  return `${filtro};[pre]loudnorm=${ALVO}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
    `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000[a]`;
}
