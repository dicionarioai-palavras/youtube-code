import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useFontes} from './componentes/Fontes';

const Foto: React.FC<{x: number; variante: 'centro' | 'esquerda' | 'limpa'; rotulo: string}> = ({x, variante, rotulo}) => (
  <div style={{position: 'absolute', left: x, top: 56, width: 560, height: 996, overflow: 'hidden', background: '#101010'}}>
    <Img src={staticFile('clips/inveja-luiz-o-olho-volta/capa-frame.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {variante !== 'limpa' ? <div style={{position: 'absolute', left: variante === 'centro' ? 22 : 30, right: 22, top: variante === 'centro' ? 116 : 174,
      textAlign: variante === 'centro' ? 'center' : 'left', fontFamily: 'Barlow Condensed', fontWeight: 800,
      fontSize: variante === 'centro' ? 62 : 68, lineHeight: 0.98, color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.9)', letterSpacing: 0.4}}>
      O OLHO<br />VOLTA?
    </div> : null}
    <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 74, background: 'rgba(0,0,0,0.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontFamily: 'Inter', fontSize: 27}}>{rotulo}</div>
  </div>
);

export const CapaComparativaInvejaLuiz: React.FC = () => {
  useFontes();
  return <AbsoluteFill style={{background: '#191919', color: '#FFFFFF', fontFamily: 'Inter'}}>
    <div style={{position: 'absolute', top: 15, left: 38, fontSize: 26, color: '#E5E5E5'}}>CAPA — PERFIL LUIZ · QUADRO REAL · TESTE 360 × 640</div>
    <Foto x={42} variante="centro" rotulo="A · título central alto" />
    <Foto x={680} variante="esquerda" rotulo="B · título alinhado à esquerda" />
    <Foto x={1318} variante="limpa" rotulo="C · foto sem texto" />
  </AbsoluteFill>;
};