// Acerta o fim de cada vídeo pela marca e grava os arquivos de postagem com o destino no nome.
//   luiz     -> termina no fim do conteúdo (sem cartela, sem capa), fade de 0,8 s na música
//   palavras -> conteúdo + UMA cartela final com o logo oficial (out/cartelas/<id>.mp4, de scripts/render-cartelas.mjs)
// Uso: node scripts/fim-por-marca.mjs <pasta-da-peça> <id>:<marca>[:so-shorts] [...] [--ffmpeg caminho]
// Entrada: final-<marca>.mp4 e final-<marca>-sem-trilha.mp4 (de entregar.mjs ou remix-adobe.mjs). Saída (nomes = destino):
//   <marca>--postar-no-shorts--com-trilha.mp4
//   <marca>--postar-no-instagram-ou-tiktok--sem-trilha--escolher-musica-no-app.mp4
//   <marca>--postar-no-shorts-instagram-e-tiktok--trilha-cc-by--credito-na-legenda.mp4   (trilha CC BY: arquivo único)
// Os final-*.mp4 de entrada são apagados no fim (são intermediários).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {propsDe, fimConteudo} from './pecas-util.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const iF = args.indexOf('--ffmpeg');
const FFMPEG = iF >= 0 ? args.splice(iF, 2)[1] : 'ffmpeg';
const [peca, ...vars] = args;
const CC_BY = ['silent-film-light', 'batty-slower'];
const FFPROBE = FFMPEG.replace(/ffmpeg(\.exe)?$/i, (m, e) => 'ffprobe' + (e || ''));
const duracao = (f) => Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const ff = (a) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...a]);
const VENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart'];
const NOME = {
  com: (m) => `${m}--postar-no-shorts--com-trilha.mp4`,
  sem: (m) => `${m}--postar-no-instagram-ou-tiktok--sem-trilha--escolher-musica-no-app.mp4`,
  ccby: (m) => `${m}--postar-no-shorts-instagram-e-tiktok--trilha-cc-by--credito-na-legenda.mp4`,
};
const usados = [];
for (const v of vars) {
  const [id, marca, opcao] = v.split(':');
  const c = propsDe(RAIZ, id);
  const T = fimConteudo(c); // fim do conteúdo
  const ccby = CC_BY.includes(path.basename(c.trilha?.src ?? '', '.mp3'));
  const saidas = ccby ? [['', NOME.ccby(marca)]] : [['', NOME.com(marca)], ...(opcao === 'so-shorts' ? [] : [['-sem-trilha', NOME.sem(marca)]])];
  for (const [suf, nome] of saidas) {
    const src = path.join(peca, `final-${marca}${suf}.mp4`);
    usados.push(src);
    const out = path.join(peca, nome);
    // vídeo já renderizado com o fim certo (composição nova): só renomeia
    const esperado = marca === 'luiz' ? T : T + 2.5;
    if (Math.abs(duracao(src) - esperado) < 0.12) { fs.copyFileSync(src, out); console.log(`OK ${path.basename(peca)}: ${nome} (já estava com o fim certo)`); continue; }
    if (marca === 'luiz') {
      ff(['-i', src, '-t', T.toFixed(3), '-filter_complex', `[0:a]atrim=0:${T.toFixed(3)},afade=t=out:st=${(T - 0.8).toFixed(3)}:d=0.8[a]`,
        '-map', '0:v', '-map', '[a]', ...VENC, out]);
    } else {
      const cart = path.join(RAIZ, 'out', 'cartelas', `${id}.mp4`);
      const fim = T + 2.5;
      ff(['-i', src, '-i', cart, '-filter_complex',
        `[0:v]trim=0:${T.toFixed(3)},setpts=PTS-STARTPTS[v0];[1:v]setpts=PTS-STARTPTS,format=yuv420p[v1];[v0][v1]concat=n=2:v=1:a=0[v];` +
        `[0:a]atrim=0:${fim.toFixed(3)},afade=t=out:st=${(fim - 0.8).toFixed(3)}:d=0.8[a]`,
        '-map', '[v]', '-map', '[a]', ...VENC, out]);
    }
    console.log(`OK ${path.basename(peca)}: ${nome}`);
  }
}
for (const f of new Set(usados)) if (fs.existsSync(f)) fs.unlinkSync(f);
// sobras de versões que não têm destino (ex.: final-palavras-sem-trilha da anáfora, que só vai para Shorts)
for (const f of fs.readdirSync(peca)) if (/^final-.*\.mp4$/.test(f)) { fs.unlinkSync(path.join(peca, f)); console.log(`removido ${f} (sem destino)`); }
