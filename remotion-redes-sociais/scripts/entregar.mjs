// Monta as entregas de uma peça a partir dos renders de scripts/render-lote.mjs.
// Uso: node scripts/entregar.mjs <pasta-renders> <pasta-da-peça> <id>[:<marca>] [<id>:<marca> ...] [--ffmpeg caminho]
// Por variante (marca):
//   final-<marca>.mp4              vídeo + mix completo, loudnorm -14 LUFS (Shorts; com trilha CC BY serve para todas as redes)
//   final-<marca>-sem-trilha.mp4   vídeo + voz e efeitos (Instagram/TikTok com música do app) — só quando a trilha é da Biblioteca do YouTube
//   capa-<marca>.png + capa-<marca>-e1-colagem/-e2-meio-rosto/-e3-foto-real.png   (public/capas e public/capas/editoriais)
// Por peça (cortes com voz):
//   para-adobe.mp4                 vídeo completo só com a voz (subir no Adobe Podcast: Speech 70, Music 0, Background 0; devolver como adobe.mp4)
//   _mix/                          mixagens sem voz (e o vídeo das marcas extras), usados por scripts/remix-adobe.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {loud2} from './loud.mjs';
import {propsDe} from './pecas-util.mjs';

const args = process.argv.slice(2);
const iF = args.indexOf('--ffmpeg');
const FFMPEG = iF >= 0 ? args.splice(iF, 2)[1] : 'ffmpeg';
const [renders, peca, ...vars] = args;
export const CC_BY = ['silent-film-light', 'batty-slower']; // trilhas Kevin MacLeod (CC BY 4.0): versão única, crédito na legenda
const ff = (a) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...a]);
fs.mkdirSync(peca, {recursive: true});
const manifesto = {variantes: []};

for (const v of vars) {
  const [id, marcaArg] = v.split(':');
  const c = propsDe(path.resolve('.'), id);
  const marca = marcaArg || c.marca;
  const temVoz = (c.palavras ?? []).length > 0;
  const trilha = path.basename(c.trilha?.src ?? '', '.mp3');
  const ccby = CC_BY.includes(trilha);
  const vid = path.join(renders, `${id}.mp4`);
  const w = (mix) => path.join(renders, `${id}.${mix}.wav`);
  const enc = ['-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart'];
  const final = (ent, nome) => ff([...ent, '-filter_complex', loud2(FFMPEG, ent, `[${ent.length / 2 - 1}:a]anull[pre]`), '-map', '0:v', '-map', '[a]', ...enc, '-shortest', path.join(peca, nome)]);
  final(['-i', vid], `final-${marca}.mp4`);
  if (!ccby) final(['-i', vid, '-i', w('sem-trilha')], `final-${marca}-sem-trilha.mp4`);
  // capas: a do molde Bebas (capa-<marca>.png) e as editoriais E1/E2/E3 (capa-<marca>-e1-colagem.png...)
  const nomePeca = path.basename(peca);
  const capaMolde = path.join('public', 'capas', `${nomePeca}__${marca}.png`);
  if (fs.existsSync(capaMolde)) fs.copyFileSync(capaMolde, path.join(peca, `capa-${marca}.png`));
  const ed = path.join('public', 'capas', 'editoriais');
  for (const f of fs.existsSync(ed) ? fs.readdirSync(ed) : [])
    if (f.startsWith(`${nomePeca}__capa-${marca}-`)) fs.copyFileSync(path.join(ed, f), path.join(peca, f.split('__')[1]));
  if (temVoz) {
    fs.mkdirSync(path.join(peca, '_mix'), {recursive: true}); // só nos cortes com voz
    // a 1ª variante gera o para-adobe.mp4 (o remix reaproveita o vídeo dele); as outras marcas guardam o próprio vídeo em _mix
    if (manifesto.variantes.some((x) => x.temVoz)) ff(['-i', vid, '-an', '-c:v', 'copy', path.join(peca, '_mix', `${marca}.video.mp4`)]);
    else ff(['-i', vid, '-i', w('voz'), '-map', '0:v', '-map', '1:a', ...enc, '-shortest', path.join(peca, 'para-adobe.mp4')]);
    fs.copyFileSync(w('sem-voz'), path.join(peca, '_mix', `${marca}.sem-voz.wav`));
    fs.copyFileSync(w('efeitos'), path.join(peca, '_mix', `${marca}.efeitos.wav`));
  }
  manifesto.variantes.push({id, marca, trilha, ccby, temVoz});
  console.log(`OK ${path.basename(peca)} ${marca}${ccby ? ' (CC BY, versão única)' : ''}${temVoz ? ' + para-adobe' : ''}`);
}
if (manifesto.variantes.some((x) => x.temVoz)) fs.writeFileSync(path.join(peca, '_mix', 'manifesto.json'), JSON.stringify(manifesto, null, 1));
