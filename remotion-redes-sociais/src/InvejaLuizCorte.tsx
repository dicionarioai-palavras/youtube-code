import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFontes} from './componentes/Fontes';
import palavras from './inveja-luiz-palavras.json';

type Palavra = {t0: number; t1: number; texto: string};
const words = palavras as Palavra[];
const W = 1080;
const H = 1920;
const CORTE_CAMERA = 530;
const duracao = 20;

const grupos = (ps: Palavra[]) => {
  const out: Palavra[][] = [];
  let atual: Palavra[] = [];
  for (const p of ps) {
    const ult = atual[atual.length - 1];
    if (ult && (atual.length >= 3 || p.t0 - ult.t1 > 0.6 || /[.!?…]$/.test(ult.texto))) { out.push(atual); atual = []; }
    atual.push(p);
  }
  if (atual.length) out.push(atual);
  return out;
};

const Cenario: React.FC = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile('clips/inveja-luiz-o-olho-volta/contexto-761-779.mp4')} muted
      style={{width: W, height: H, objectFit: 'cover', filter: 'blur(42px) brightness(0.43)', transform: 'scale(1.16)'}} />
    <div style={{position: 'absolute', left: 0, top: (H - 608) / 2, width: W, height: 608, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('clips/inveja-luiz-o-olho-volta/contexto-761-779.mp4')} muted
        style={{width: W, height: 608, objectFit: 'contain'}} />
    </div>
  </AbsoluteFill>
);

const Aparicao: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 70], [1, 1.02], {extrapolateRight: 'clamp'});
  return <AbsoluteFill><OffthreadVideo src={staticFile('clips/inveja-luiz-o-olho-volta/luiz-videre-ver.mp4')} muted
    style={{width: W, height: H, objectFit: 'cover', transform: 'scale(' + zoom + ')', filter: 'saturate(0.82) contrast(1.04) brightness(0.97)'}} /></AbsoluteFill>;
};

const Legendas: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const blocos = useMemo(() => grupos(words), []);
  const bloco = blocos.find((b, i) => t >= b[0].t0 && t < (blocos[i + 1]?.[0].t0 ?? b[b.length - 1].t1 + 0.35) && t <= b[b.length - 1].t1 + 0.35);
  if (!bloco) return null;
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 245, paddingLeft: 64, paddingRight: 64}}>
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 18px', maxWidth: 900,
      padding: '12px 22px', background: 'rgba(8,9,12,0.45)', borderRadius: 12}}>
      {bloco.map((p, i) => {
        const ativa = t >= p.t0 && t < p.t1;
        return <span key={i} style={{fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 76, lineHeight: 1.05,
          color: ativa ? '#F3D8A0' : '#FFFFFF', textShadow: '0 3px 14px rgba(0,0,0,0.75)', textTransform: 'uppercase'}}>{p.texto}</span>;
      })}
    </div>
  </AbsoluteFill>;
};

const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= 75) return null;
  const opacity = interpolate(frame, [0, 7, 60, 75], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, 9], [-24, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{alignItems: 'center', paddingTop: 250, opacity}}>
    <div style={{fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 92, lineHeight: 1, color: '#FFFFFF',
      letterSpacing: 1.2, textShadow: '0 4px 22px rgba(0,0,0,0.9)', transform: 'translateY(' + y + 'px)'}}>O OLHO VOLTA?</div>
  </AbsoluteFill>;
};

export const InvejaLuizCorte: React.FC<{comMusica?: boolean}> = ({comMusica = true}) => {
  useFontes();
  const {fps} = useVideoConfig();
  const musicVolume = (f: number) => {
    const t = f / fps;
    const falando = words.some((w) => t >= w.t0 - 0.12 && t <= w.t1 + 0.18);
    const fade = Math.min(1, (duracao * fps - f) / (fps * 0.7));
    return 0.11 * (falando ? 0.35 : 1) * Math.max(0, fade);
  };
  return <AbsoluteFill style={{backgroundColor: '#111111'}}>
    <Sequence durationInFrames={CORTE_CAMERA}><Cenario /></Sequence>
    <Sequence from={CORTE_CAMERA}><Aparicao /></Sequence>
    <Audio src={staticFile('clips/inveja-luiz-o-olho-volta/narracao.wav')} />
    {comMusica ? <Audio src={staticFile('audio/trilhas/como-vamos.mp3')} volume={musicVolume} /> : null}
    <Gancho />
    <Legendas />
  </AbsoluteFill>;
};

export const DURATION_FRAMES = 600;
