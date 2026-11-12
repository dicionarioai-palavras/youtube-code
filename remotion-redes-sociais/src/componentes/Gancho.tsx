import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Estilo, FONTE_LEGENDA} from '../estilo';

// Gancho: máquina de escrever num cartão creme com fio terracota (identidade v1.1)
export const porLetraGancho = (texto: string, ate: number) => Math.min(0.055, (ate * 0.5) / texto.length);
export const Gancho: React.FC<{texto: string; ate: number; estilo: Estilo}> = ({texto, ate, estilo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (t > ate) return null;
  const n = Math.min(texto.length, Math.floor(t / porLetraGancho(texto, ate)));
  const cursor = Math.floor(frame / (fps * 0.45)) % 2 === 0;
  const ent = spring({frame, fps, config: {damping: 16}});
  const saida = interpolate(t, [ate - 0.2, ate], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 250, opacity: saida}}>
      <div style={{background: `${estilo.papel}EB`, color: estilo.tinta, fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 88,
        lineHeight: 1.0, padding: '34px 44px 30px', maxWidth: 900, textTransform: 'uppercase', whiteSpace: 'pre-wrap',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)', transform: `translateY(${(1 - ent) * -40}px)`}}>
        {texto.slice(0, n)}
        <span style={{opacity: cursor ? 1 : 0, color: estilo.acento}}>▌</span>
        <span style={{opacity: 0}}>{texto.slice(n)}</span>
        <div style={{height: 4, background: estilo.acento, marginTop: 22, width: `${(n / texto.length) * 100}%`}} />
      </div>
    </AbsoluteFill>
  );
};
