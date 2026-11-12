// Prepara um corte aprovado para o Remotion, sem IA:
//  - lê cortes.json (trechos aprovados) e a transcrição do Whisper (.json) da pasta do vídeo
//  - gera os clipes-proxy (H.264, 30 fps, já cortados e com a velocidade aplicada) em public/clips/<id>/
//  - calcula a legenda palavra a palavra no tempo do vídeo final
//  - grava/atualiza a entrada em src/cortes.json
//
// Uso:
//   node scripts/preparar.mjs --video "<pasta do vídeo>" --corte 01-botao-da-foto
//        [--id 01-botao-da-foto-pb] [--marca luiz] [--layout camera|tela] [--regiao 0.3,0.19,0.62,0.55]
//        [--pb] [--mudo] [--gancho "texto" --gancho-ate 3] [--cta "texto"] [--trilha trilhas/x.mp3 --volume 0.2]
//        [--ffmpeg <caminho do ffmpeg>]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes('--' + n);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const pastaVideo = opt('video');
const corteId = opt('corte');
if (!pastaVideo || !corteId) { console.error('uso: --video <pasta> --corte <id>'); process.exit(1); }
const ffmpegPadrao = path.resolve(RAIZ, '../../_esteiras/cortes-redes-sociais/bin/ffmpeg.exe');
const FFMPEG = opt('ffmpeg', fs.existsSync(ffmpegPadrao) ? ffmpegPadrao : 'ffmpeg');
const FFPROBE = FFMPEG.replace(/ffmpeg(\.exe)?$/i, (m, ext) => 'ffprobe' + (ext || ''));

const cortesJson = JSON.parse(fs.readFileSync(path.join(pastaVideo, 'cortes.json'), 'utf8').replace(/^﻿/, ''));
const corte = cortesJson.cortes.find((c) => c.id === corteId);
if (!corte) throw new Error('corte não encontrado: ' + corteId);
const fonte = path.join(pastaVideo, cortesJson.video);
const base = fonte.replace(/\.[^.]+$/, '');
const id = opt('id', corteId);
const seg = (s) => typeof s === 'number' ? s : String(s).split(':').reverse().reduce((a, v, i) => a + parseFloat(v) * 60 ** i, 0);

// ---- palavras do Whisper (tokens -> palavras, tempos em segundos da fonte)
const palavrasFonte = [];
const wj = base + '.json';
if (fs.existsSync(wj)) {
  const d = JSON.parse(fs.readFileSync(wj, 'utf8').replace(/^﻿/, ''));
  for (const s of d.transcription ?? []) {
    const a = s.offsets.from / 1000, b = s.offsets.to / 1000;
    const toks = (s.tokens ?? []).filter((t) => !t.text.startsWith('[_'));
    if (!toks.length) continue;
    const t0 = toks[0].offsets.from, t1 = Math.max(toks[toks.length - 1].offsets.to, t0 + 1);
    const k = (b - a) / ((t1 - t0) / 1000);
    const mapa = (ms) => a + ((ms - t0) / 1000) * k; // tokens podem vir relativos ao segmento
    let atual = null;
    for (const t of toks) {
      if (!atual || t.text.startsWith(' ')) {
        if (atual && atual.texto.trim()) palavrasFonte.push(atual);
        atual = {t0: mapa(t.offsets.from), t1: mapa(t.offsets.to), texto: t.text.trim()};
      } else { atual.t1 = mapa(t.offsets.to); atual.texto += t.text; }
    }
    if (atual && atual.texto.trim()) palavrasFonte.push(atual);
  }
}

// ---- dimensões da fonte (já considerando rotação do celular)
const probe = JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_streams', '-of', 'json', fonte]).toString());
const st = probe.streams[0];
const rot = Math.abs(Number((st.side_data_list ?? []).find((d) => d.rotation !== undefined)?.rotation ?? st.tags?.rotate ?? 0)) % 180 === 90;
const [fw, fh] = rot ? [st.height, st.width] : [st.width, st.height];
const layout = opt('layout', 'camera');
// proxy: no máx. 1920 no lado maior (4K vira 1080p); gravação de tela fica no tamanho original
const escala = Math.min(1, 1920 / Math.max(fw, fh));
const pw = Math.round((fw * escala) / 2) * 2, ph = Math.round((fh * escala) / 2) * 2;

const destino = path.join(RAIZ, 'public', 'clips', id);
fs.rmSync(destino, {recursive: true, force: true});
fs.mkdirSync(destino, {recursive: true});
const atempo = (v) => { const f = []; while (v > 2) { f.push('atempo=2'); v /= 2; } while (v < 0.5) { f.push('atempo=0.5'); v /= 0.5; } f.push('atempo=' + v.toFixed(4)); return f.join(','); };

const clips = [], palavras = [];
let off = 0;
corte.trechos.forEach((t, i) => {
  const a = seg(t.inicio), b = seg(t.fim), vel = Number(t.velocidade || 1);
  const mudo = flag('mudo') || t.audio === 'mudo' || (vel > 1.5 && t.audio !== 'manter');
  const out = path.join(destino, `t${i + 1}.mp4`);
  const a1 = ['-nostdin', '-y', '-v', 'error', '-ss', String(a), '-to', String(b), '-i', fonte,
    '-vf', `setpts=PTS/${vel},scale=${pw}:${ph},fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18'];
  const a2 = mudo ? ['-an'] : ['-af', atempo(vel), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
  const t0 = Date.now();
  execFileSync(FFMPEG, [...a1, ...a2, '-movflags', '+faststart', out]);
  const dur = (b - a) / vel;
  console.log(`  proxy t${i + 1}: ${a}s-${b}s x${vel}${mudo ? ' (mudo)' : ''} -> ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  clips.push({src: `clips/${id}/t${i + 1}.mp4`, duracao: +dur.toFixed(3), mudo});
  if (!mudo) for (const w of palavrasFonte) if (w.t0 >= a - 0.05 && w.t0 < b && w.t1 <= b + 0.3)
    palavras.push({t0: +(off + (Math.max(w.t0, a) - a) / vel).toFixed(3), t1: +(off + (Math.min(w.t1, b) - a) / vel).toFixed(3), texto: w.texto});
  off += dur;
});

const regiao = opt('regiao') ? opt('regiao').split(',').map(Number) : undefined;
const props = {
  id, marca: opt('marca', (corte.destinos?.[0] ?? '').split('-').pop() || 'luiz'),
  layout, largura: pw, altura: ph, focoX: corte.foco_x ?? 0.5, regiao, pb: flag('pb') || corte.visual === 'pb',
  clips, palavras,
  gancho: opt('gancho') ? {texto: opt('gancho'), ate: Number(opt('gancho-ate', 3))} : undefined,
  cta: opt('cta', ''),
  trilha: opt('trilha') ? {src: opt('trilha'), volume: Number(opt('volume', 0.2))} : undefined,
  duracao: +off.toFixed(3),
};
const arq = path.join(RAIZ, 'src', 'cortes.json');
const lista = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, 'utf8')) : [];
fs.writeFileSync(arq, JSON.stringify([...lista.filter((c) => c.id !== id), props], null, 1));
console.log(`OK ${id}: ${props.duracao}s, ${clips.length} clipe(s), ${palavras.length} palavras, layout=${layout}, marca=${props.marca}${props.pb ? ', P&B' : ''}`);
