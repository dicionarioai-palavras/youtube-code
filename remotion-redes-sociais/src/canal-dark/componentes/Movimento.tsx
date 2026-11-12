import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// Direção visual v2 (06/11/2026) — "zoom que revela".
// Câmera virtual que vai de um enquadramento A para um B dentro da mesma imagem.
// x, y = ponto da imagem (0–1) que fica no centro do quadro; s = escala (1 = imagem inteira).
// O enquadramento é limitado para nunca mostrar a borda da imagem.
// Atalhos: mov "revela" (fechado no foco → aberto), "descobre" (aberto → fechado no foco),
// "desliza" (de -> para na mesma escala), "parado" (leve respiração no foco).
// Guia: canais/the-mind-behind/guias/11-DIRECAO-VISUAL-V2.md

export type Quadro = {x: number; y: number; s: number};
export type Mov = 'revela' | 'descobre' | 'desliza' | 'parado';

export const enquadramentos = (
  mov: Mov,
  foco: {x: number; y: number} = {x: 0.5, y: 0.5},
  escala: [number, number] = [1.0, 1.5],
  destino?: {x: number; y: number},
): [Quadro, Quadro] => {
  const [a, b] = escala;
  const fechado = Math.max(a, b);
  const aberto = Math.min(a, b);
  switch (mov) {
    case 'revela':
      return [{...foco, s: fechado}, {x: 0.5, y: 0.5, s: aberto}];
    case 'descobre':
      return [{x: 0.5, y: 0.5, s: aberto}, {...foco, s: fechado}];
    case 'desliza':
      return [{...foco, s: fechado}, {...(destino ?? {x: 1 - foco.x, y: foco.y}), s: fechado}];
    default:
      return [{...foco, s: aberto + 0.02}, {...foco, s: aberto + 0.06}];
  }
};

const limita = (q: Quadro): Quadro => {
  const s = Math.max(1, q.s);
  const meia = 0.5 / s; // metade da janela visível, em fração da imagem
  return {s, x: Math.min(1 - meia, Math.max(meia, q.x)), y: Math.min(1 - meia, Math.max(meia, q.y))};
};

export const Camera: React.FC<{
  src: string;
  de: Quadro;
  para: Quadro;
  dur: number; // frames
  respiro?: number; // fração final da cena em que a câmera fica parada (0–0.4)
  vinhetaFoco?: number; // 0–1: escurece as bordas no fim do movimento (realce da pista)
}> = ({src, de, para, dur, respiro = 0.18, vinhetaFoco = 0}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fimMov = Math.max(1, Math.round(dur * (1 - respiro)));
  const t = interpolate(f, [0, fimMov], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.25, 1)});
  const A = limita(de);
  const B = limita(para);
  const s = A.s + (B.s - A.s) * t;
  const q = limita({s, x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t});
  const tx = (0.5 - q.x) * width * q.s;
  const ty = (0.5 - q.y) * height * q.s;
  const v = vinhetaFoco * t;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#0E0E10'}}>
      <Img
        src={src}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${tx}px, ${ty}px) scale(${q.s})`, transformOrigin: '50% 50%'}}
      />
      {v > 0 ? (
        <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${60 - 25 * v}%, rgba(0,0,0,${0.75 * v}) 100%)`}} />
      ) : null}
    </AbsoluteFill>
  );
};
