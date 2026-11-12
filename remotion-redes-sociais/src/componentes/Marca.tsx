import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Estilo, FONTE_DISPLAY, FONTE_TEXTO} from '../estilo';

// Fragmentos geométricos (polígonos chapados) que "fecham" a base da tela. k: 0..1 (entrada)
const POLIS: [number, string][] = [
  [0, '0,1920 0,1560 340,1700 430,1920'],
  [1, '250,1920 400,1640 760,1760 820,1920'],
  [3, '640,1920 760,1700 940,1920'],
  [2, '820,1920 980,1590 1080,1640 1080,1920'],
  [4, '0,1700 0,1520 180,1610'],
  [2, '900,0 1080,0 1080,240'],
  [0, '760,0 960,0 870,110'],
];
export const Fragmentos: React.FC<{cores: string[]; k: number}> = ({cores, k}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    {POLIS.map(([c, pts], i) => {
      const ki = Math.max(0, Math.min(1, k * 1.6 - i * 0.08));
      const topo = pts.startsWith('900,0') || pts.startsWith('760,0');
      return <polygon key={i} points={pts} fill={cores[c % cores.length]} opacity={0.92 * ki}
        transform={`translate(0 ${(1 - ki) * (topo ? -260 : 260)})`} />;
    })}
  </svg>
);

// Cartela final (só Palavras, desde 19/10/2026): fundo creme, logo oficial (símbolo + nome), linha em Inter, fragmentos fechando a base.
// É a ÚNICA imagem de fim do Palavras. Vídeos do luiz não têm cartela nem capa no fim.
export const CartelaFinal: React.FC<{estilo: Estilo; linha: string; engajamento?: string}> = ({estilo, linha, engajamento}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 18}});
  const t = spring({frame: f - 6, fps, config: {damping: 16}});
  const e = spring({frame: f - 16, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{background: estilo.ctaFundo, opacity: interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'})}}>
      <Fragmentos cores={estilo.fragmentos} k={s} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingBottom: 220}}>
        {estilo.ctaLogo ? (
          <Img src={staticFile(estilo.ctaLogo)} style={{width: 820, transform: `translateY(${(1 - t) * 60}px)`, opacity: t}} />
        ) : (
          <div style={{fontFamily: FONTE_DISPLAY, fontSize: 260, lineHeight: 0.9, color: estilo.ctaTexto, letterSpacing: 4,
            transform: `translateY(${(1 - t) * 60}px)`, opacity: t}}>{estilo.ctaMarca}</div>
        )}
        <div style={{width: 520 * t, height: 4, background: estilo.acentoForte, margin: '26px 0 30px'}} />
        <div style={{fontFamily: FONTE_TEXTO, fontWeight: 500, fontSize: 46, lineHeight: 1.3, color: estilo.ctaTexto, textAlign: 'center',
          maxWidth: 860, opacity: t}}>{linha}</div>
        {engajamento ? (
          <div style={{marginTop: 60, fontFamily: FONTE_TEXTO, fontWeight: 500, fontSize: 36, color: estilo.ctaTexto, opacity: 0.85 * e,
            transform: `translateY(${(1 - e) * 30}px)`, textAlign: 'center', maxWidth: 820, borderTop: `2px solid ${estilo.ctaTexto}33`, paddingTop: 30}}>{engajamento}</div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Capa (imagem pronta) nos últimos quadros: é o quadro a escolher como capa nos Shorts
export const CapaFinal: React.FC<{src: string}> = ({src}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 3], [0, 1], {extrapolateRight: 'clamp'})}}><Img src={staticFile(src)} style={{width: 1080, height: 1920}} /></AbsoluteFill>;
};
