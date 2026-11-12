// Utilitários compartilhados: acha as props de um id (cortes.json ou montagem.json) e o fim do conteúdo (s).
import fs from 'node:fs';
import path from 'node:path';
export function propsDe(raiz, id) {
  const cortes = JSON.parse(fs.readFileSync(path.join(raiz, 'src', 'cortes.json'), 'utf8'));
  const c = cortes.find((x) => x.id === id);
  if (c) return c;
  const m = JSON.parse(fs.readFileSync(path.join(raiz, 'src', 'montagem.json'), 'utf8'));
  if (id === m.id || id === `${m.id}-luiz`) return m;
  throw new Error('id não encontrado em cortes.json nem em montagem.json: ' + id);
}
// fim do conteúdo: cortes (clips em sequência, duracao) ou montagem (clips com inicio + dur)
export function fimConteudo(p, fps = 30) {
  if (p.clips[0]?.duracao !== undefined) return p.clips.reduce((a, x) => a + Math.round(x.duracao * fps), 0) / fps;
  return Math.round(p.clips.reduce((a, x) => Math.max(a, x.inicio + x.dur), 0) * fps) / fps;
}
