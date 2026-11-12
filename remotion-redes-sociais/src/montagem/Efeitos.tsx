import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {Estilo, FONTE_DISPLAY, FONTE_LEGENDA, FONTE_TEXTO} from '../estilo';

// Barra de progresso no topo (retenção)
export const Progresso: React.FC<{cor: string}> = ({cor}) => {
  const f = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
  return <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: cor, boxShadow: `0 0 18px ${cor}`}} />;
};

// Granulado de filme (SVG turbulência, semente muda a cada quadro)
export const Granulado: React.FC<{forca?: number}> = ({forca = 0.07}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: forca, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 50} /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

// Carimbo sobre o quadro congelado
export const Carimbo: React.FC<{texto: string; estilo: Estilo}> = ({texto, estilo}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 220}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${interpolate(s, [0, 1], [3, 1])}) rotate(-12deg)`, opacity: s, border: `12px solid ${estilo.acentoForte}`, color: estilo.acentoForte,
        fontFamily: FONTE_DISPLAY, fontSize: 210, lineHeight: 1, padding: '18px 44px 6px', borderRadius: 10, background: `${estilo.papel}D9`, letterSpacing: 6}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// Sticker que entra girando (palavra-chave)
export const Sticker: React.FC<{texto: string; estilo: Estilo; dur: number}> = ({texto, estilo, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 10}});
  const sai = interpolate(f, [dur * fps - 8, dur * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 420}}>
      <div style={{transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-30, 6])}deg)`, opacity: sai, background: estilo.papel, color: estilo.tinta, borderBottom: `8px solid ${estilo.acento}`,
        fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 84, padding: '16px 36px 10px', boxShadow: '0 12px 30px rgba(0,0,0,0.45)'}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// Flash de transição entre blocos
export const Transicao: React.FC<{cor: string}> = ({cor}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 9], [-1200, 1200], {extrapolateRight: 'clamp'});
  return <AbsoluteFill><div style={{position: 'absolute', top: 0, bottom: 0, left: x, width: 520, background: cor, transform: 'skewX(-18deg)', opacity: 0.9}} /></AbsoluteFill>;
};

// Cartão do verbete (texto literal do palavras.co): palavra digitada, fio desenhado, definição, partes opcionais
export const Etimologia: React.FC<{palavra: string; classe: string; origem: string; partes?: [string, string][]; fonte: string; estilo: Estilo; dur: number}> =
({palavra, classe, origem, partes = [], fonte, estilo, dur}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const ent = spring({frame: f, fps, config: {damping: 14}});
  const sai = interpolate(f, [dur * fps - 10, dur * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const letras = Math.min(palavra.length, Math.floor(f / 3));
  const caminho = 'M 0 6 L 760 6';
  const ev = evolvePath(interpolate(f, [10, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), caminho);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 250, opacity: sai}}>
      <div style={{transform: `translateY(${(1 - ent) * -60}px)`, opacity: ent, width: 930, background: estilo.papel, color: estilo.tinta,
        padding: '44px 52px 40px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden'}}>
        <svg width={930} height={140} style={{position: 'absolute', right: -40, bottom: -10}} viewBox="0 0 930 140">
          <polygon points="700,140 820,30 930,90 930,140" fill={estilo.fragmentos[0]} opacity={0.9 * ent} />
          <polygon points="820,140 900,60 930,140" fill={estilo.fragmentos[3 % estilo.fragmentos.length]} opacity={0.85 * ent} />
        </svg>
        <div style={{fontFamily: FONTE_TEXTO, fontWeight: 500, fontSize: 30, color: estilo.acentoForte, letterSpacing: 1}}>{classe}</div>
        <div style={{fontFamily: FONTE_DISPLAY, fontSize: 170, lineHeight: 0.95, marginTop: 6}}>{palavra.slice(0, letras)}<span style={{opacity: 0}}>{palavra.slice(letras)}</span></div>
        <svg width="760" height="12"><path d={caminho} stroke={estilo.acento} strokeWidth={4} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} /></svg>
        <div style={{fontFamily: FONTE_TEXTO, fontSize: 40, lineHeight: 1.35, marginTop: 22, maxWidth: 780, opacity: spring({frame: f - 26, fps})}}>{origem}</div>
        {partes.length ? (
          <div style={{display: 'flex', gap: 40, marginTop: 24}}>
            {partes.map(([p, sig], i) => { const s2 = spring({frame: f - 36 - i * 8, fps}); return (
              <div key={i} style={{opacity: s2, transform: `translateY(${(1 - s2) * 20}px)`}}>
                <div style={{fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 48, color: estilo.acentoForte}}>{p}</div>
                <div style={{fontFamily: FONTE_TEXTO, fontSize: 30, opacity: 0.8}}>“{sig}”</div>
              </div>); })}
          </div>
        ) : null}
        <div style={{fontFamily: FONTE_TEXTO, fontWeight: 500, fontSize: 24, marginTop: 26, opacity: 0.55}}>{fonte}</div>
      </div>
    </AbsoluteFill>
  );
};

// Tremida (para o quadro congelado)
export const useTremida = (ativo?: boolean) => {
  const f = useCurrentFrame();
  if (!ativo) return '';
  const k = Math.max(0, 1 - f / 14) * 18;
  return `translate(${(random(`x${f}`) - 0.5) * k}px, ${(random(`y${f}`) - 0.5) * k}px)`;
};
