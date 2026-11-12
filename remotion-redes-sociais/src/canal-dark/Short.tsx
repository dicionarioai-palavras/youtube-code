import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE} from './tema';
// 07/11/2026: legenda e barra de progresso sem vermelho (palavra da vez em papel cheio, as outras a 55%; barra em papel a 45%).
// Vermelho fica só na pista (gancho, cartões, ponto do CTA), pela regra do guia de identidade.
import {Icone} from './componentes/Logo';

// Short vertical 1080x1920 recortado do episódio: mesmas imagens, legenda palavra a palavra, gancho fixo no topo.
export type Palavra = {w: string; s: number; e: number};
export type ShortProps = {id: string; gancho: string; dur: number; pasta: string; cenas: {src: string; ini: number; fim: number}[]; palavras: Palavra[]};

const FADE = 10;

const Imagem: React.FC<{src: string; dur: number; idx: number}> = ({src, dur, idx}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const o = idx === 0 ? 1 : interpolate(f, [0, FADE], [0, 1], {extrapolateRight: 'clamp'});
  const z = idx % 2 === 0 ? 1.05 + 0.1 * t : 1.15 - 0.1 * t;
  const dx = (idx % 2 === 0 ? -1 : 1) * 120 * (t - 0.5);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Img src={src} style={{height: '100%', width: 'auto', position: 'absolute', left: '50%', top: 0, transform: `translateX(-50%) translateX(${dx}px) scale(${z})`}} />
    </AbsoluteFill>
  );
};

// agrupa as palavras em blocos curtos (até 3 palavras ou até pontuação)
const blocos = (ps: Palavra[]) => {
  const out: Palavra[][] = [];
  let cur: Palavra[] = [];
  ps.forEach((p) => {
    cur.push(p);
    if (cur.length >= 3 || /[.,?!;:]$/.test(p.w)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
};

export const Short: React.FC<ShortProps> = ({gancho, cenas, palavras, pasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const g = spring({frame, fps, config: {damping: 14}});
  const bs = blocos(palavras);
  const atualB = bs.findIndex((b, i) => t >= b[0].s - 0.05 && (i === bs.length - 1 || t < bs[i + 1][0].s - 0.05));
  const fimFala = palavras[palavras.length - 1].e + 0.3;
  const cta = interpolate(t, [fimFala, fimFala + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const partes = gancho.split(/(\?|")/);
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      <AbsoluteFill style={{top: 470, height: 1000, overflow: 'hidden'}}>
        {cenas.map((c, i) => {
          const from = Math.round(c.ini * fps);
          const dur = Math.max(1, Math.round((c.fim - c.ini) * fps)) + (i < cenas.length - 1 ? FADE : 0);
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <Imagem src={staticFile(`${pasta}/${c.src}.jpg`)} dur={dur} idx={i} />
            </Sequence>
          );
        })}
        <AbsoluteFill style={{background: `linear-gradient(${COR.tinta} 0%, rgba(15,14,13,0) 14%, rgba(15,14,13,0) 80%, ${COR.tinta} 100%)`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, fontFamily: FONTE.titulo, fontSize: 124, lineHeight: 0.92, color: COR.papel, textAlign: 'center', transform: `scale(${0.85 + g * 0.15})`, opacity: g}}>
        {partes.map((p, i) => (p === '?' ? <span key={i} style={{color: COR.vermelho}}>?</span> : <span key={i}>{p}</span>))}
      </div>
      {atualB >= 0 && cta < 1 && (
        <div style={{position: 'absolute', top: 1420, left: 70, right: 70, textAlign: 'center', fontFamily: FONTE.texto, fontWeight: 700, fontSize: 74, lineHeight: 1.15, color: COR.papel, textShadow: '0 4px 18px rgba(0,0,0,0.9)', opacity: 1 - cta}}>
          {bs[atualB].map((p, i, arr) => {
            const prox = i < arr.length - 1 ? arr[i + 1].s : p.e + 0.4;
            return <span key={i} style={{color: COR.papel, opacity: t >= p.s - 0.05 && t < prox - 0.05 ? 1 : 0.55}}>{p.w} </span>;
          })}
        </div>
      )}
      <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 30}px)`}}>
        <div style={{fontFamily: FONTE.titulo, fontSize: 96, color: COR.papel, letterSpacing: 2}}>FULL CASE<span style={{color: COR.vermelho}}>.</span></div>
        <div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.ambar, marginTop: 10, letterSpacing: 3}}>ON THE CHANNEL</div>
      </div>
      <div style={{position: 'absolute', bottom: 170, width: '100%', textAlign: 'center', fontFamily: FONTE.ficha, fontSize: 32, color: COR.grafite, letterSpacing: 3}}>THE MIND BEHIND</div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: COR.papel, opacity: 0.45}} />
      <div style={{position: 'absolute', top: 40, right: 40}}><Icone tamanho={90} /></div>
    </AbsoluteFill>
  );
};
