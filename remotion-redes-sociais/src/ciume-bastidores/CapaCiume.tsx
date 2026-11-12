// Capas das peças de bastidor do Ciúme. Luiz: modelos L-EDI (gancho Barlow 800, sem caixa), L-TEA (luz e sombra, sem texto), L-COT (quadro real, sem texto).
// Palavras: molde Bebas com faixa creme + logo; E3 foto real com logo.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useFontes} from '../componentes/Fontes';
import {COR, ESTILOS} from '../estilo';

export type CapaProps = {img: string; modelo: 'l-edi' | 'l-tea' | 'l-cot' | 'p-molde' | 'p-e3'; texto?: string; apoio?: string};
const P = ESTILOS.palavras;

export const CapaCiume: React.FC<CapaProps> = ({img, modelo, texto, apoio}) => {
  useFontes();
  const tea = modelo === 'l-tea';
  return <AbsoluteFill style={{background: '#0B0B0D'}}>
    <Img src={staticFile(img)} style={{width: 1080, height: 1920, objectFit: 'cover',
      filter: tea ? 'grayscale(0.3) contrast(1.3) brightness(1.0)' : 'saturate(0.9) contrast(1.05)'}} />
    {tea ? <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 40% at 50% 34%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.88) 100%)'}} /> : null}
    {modelo === 'l-edi' && texto ? <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.25) 26%, rgba(0,0,0,0) 40%)'}} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
        <div style={{fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 150, lineHeight: 0.95, color: '#FFFFFF', textAlign: 'center',
          textTransform: 'uppercase', letterSpacing: 1, textShadow: '0 6px 30px rgba(0,0,0,0.7)', maxWidth: 940}}>{texto}</div>
        <div style={{width: 160, height: 8, background: '#D2452B', marginTop: 26}} />
      </AbsoluteFill>
    </> : null}
    {modelo === 'p-molde' && texto ? <>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 320}}>
        <div style={{background: P.papel, padding: '34px 46px 18px', maxWidth: 960, textAlign: 'center', transform: 'rotate(-1.5deg)'}}>
          <div style={{fontFamily: 'Bebas Neue', fontSize: 190, lineHeight: 0.9, color: P.tinta, letterSpacing: 3}}>{texto}</div>
          {apoio ? <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 44, color: P.tinta, marginTop: 14, marginBottom: 8}}>
            <span style={{background: `linear-gradient(transparent 55%, ${COR.ocreClaro} 55%)`}}>{apoio}</span></div> : null}
        </div>
      </AbsoluteFill>
    </> : null}
    {modelo === 'p-e3' && texto ? <>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(26,27,32,0.85) 0%, rgba(26,27,32,0) 38%)'}} />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 70px 330px'}}>
        <div style={{fontFamily: 'Bebas Neue', fontSize: 170, lineHeight: 0.9, color: P.papel, letterSpacing: 3}}>{texto}</div>
        {apoio ? <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 42, color: P.papel, marginTop: 12}}>{apoio}</div> : null}
      </AbsoluteFill>
    </> : null}
    {modelo.startsWith('p-') ? <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120}}>
      <div style={{background: P.papel, padding: '18px 34px', borderRadius: 4}}><Img src={staticFile('marca/palavras-logo-grafite.svg')} style={{width: 380}} /></div>
    </AbsoluteFill> : null}
  </AbsoluteFill>;
};
