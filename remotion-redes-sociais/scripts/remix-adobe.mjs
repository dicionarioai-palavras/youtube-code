// Remix depois do Adobe Podcast: troca a voz original pela voz tratada (adobe.mp4) e refaz os final-*.mp4.
// Uso: node scripts/remix-adobe.mjs <pasta-da-peça> [<pasta-da-peça> ...] [--ffmpeg caminho]
// Precisa, na pasta da peça: adobe.mp4 (devolvido pelo Luiz) e _mix/ (gerado por scripts/entregar.mjs).
// Por variante: final-<marca>.mp4 = vídeo + (voz do Adobe + trilha + efeitos), loudnorm -14 LUFS
//               final-<marca>-sem-trilha.mp4 = vídeo + (voz do Adobe + efeitos)   [só trilha da Biblioteca do YouTube]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {loud2} from './loud.mjs';

const args = process.argv.slice(2);
const iF = args.indexOf('--ffmpeg');
const FFMPEG = iF >= 0 ? args.splice(iF, 2)[1] : 'ffmpeg';
const ff = (a) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...a]);
const MIX = '[1:a]aresample=48000,aformat=channel_layouts=stereo[v];[2:a]aresample=48000,aformat=channel_layouts=stereo[f];' +
  '[v][f]amix=inputs=2:normalize=0:duration=longest[pre]';

for (const peca of args) {
  const adobe = path.join(peca, 'adobe.mp4');
  if (!fs.existsSync(adobe)) { console.log(`falta adobe.mp4 em ${peca}`); continue; }
  const {variantes} = JSON.parse(fs.readFileSync(path.join(peca, '_mix', 'manifesto.json'), 'utf8'));
  for (const v of variantes.filter((x) => x.temVoz)) {
    // vídeo: o da própria marca em _mix (marcas extras) ou o do para-adobe.mp4 (1ª variante; o vídeo é o mesmo do final)
    const proprio = path.join(peca, '_mix', `${v.marca}.video.mp4`);
    const video = fs.existsSync(proprio) ? proprio : path.join(peca, 'para-adobe.mp4');
    const saidas = [['sem-voz', `final-${v.marca}.mp4`]];
    if (!v.ccby) saidas.push(['efeitos', `final-${v.marca}-sem-trilha.mp4`]);
    for (const [mix, nome] of saidas) {
      const ent = ['-i', video, '-i', adobe, '-i', path.join(peca, '_mix', `${v.marca}.${mix}.wav`)];
      ff([...ent, '-filter_complex', loud2(FFMPEG, ent, MIX),
        '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
        '-movflags', '+faststart', path.join(peca, nome)]);
      console.log(`OK ${path.basename(peca)}: ${nome} (voz do Adobe)`);
    }
  }
}
