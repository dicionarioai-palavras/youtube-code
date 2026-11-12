import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {Clip, CorteProps} from '../tipos';

const W = 1080;
const H = 1920;

// Layout "camera": preenche o 9:16 recortando a fonte; focoX escolhe o lado.
const Camera: React.FC<{clip: Clip; focoX: number; mudo: boolean; volume?: (f: number) => number}> = ({clip, focoX, mudo, volume}) => (
  <OffthreadVideo
    src={staticFile(clip.src)}
    muted={mudo}
    volume={volume}
    style={{width: W, height: H, objectFit: 'cover', objectPosition: `${focoX * 100}% 50%`}}
  />
);

// Layout "tela": fundo desfocado + a região importante da gravação de tela ampliada, como um "cartão".
const Tela: React.FC<{clip: Clip; p: CorteProps; volume?: (f: number) => number}> = ({clip, p, volume}) => {
  const [x, y, w, h] = clip.regiao ?? p.regiao ?? [0, 0, 1, 1];
  const larguraCartao = 1040;
  const escala = larguraCartao / (w * p.largura);
  const alturaCartao = h * p.altura * escala;
  const src = staticFile(clip.src);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <OffthreadVideo
        src={src}
        muted
        style={{width: W, height: H, objectFit: 'cover', filter: 'blur(28px) brightness(0.45)', transform: 'scale(1.15)'}}
      />
      <div
        style={{
          position: 'absolute', left: (W - larguraCartao) / 2, top: (H - alturaCartao) / 2 - 60,
          width: larguraCartao, height: alturaCartao, overflow: 'hidden', borderRadius: 28,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <OffthreadVideo
          src={src}
          muted={mudoClip(clip, p)}
          volume={volume}
          style={{
            position: 'absolute', width: p.largura * escala, height: p.altura * escala,
            left: -x * p.largura * escala, top: -y * p.altura * escala, maxWidth: 'none',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// palavrão: corta o som original dentro das janelas de censura (tempo do vídeo final = inicio do clipe + quadro local)
const volumeCensura = (p: CorteProps, inicio: number, fps: number) => (f: number) => {
  const t = inicio + f / fps;
  return (p.censura ?? []).some(([a, b]) => t >= a && t <= b) ? 0 : 1;
};

// nas mixagens sem voz (sem-voz, efeitos) o som original dos clipes fica mudo
const mudoClip = (clip: Clip, p: CorteProps) => clip.mudo || p.mix === 'sem-voz' || p.mix === 'efeitos';

export const Fundo: React.FC<{clip: Clip; p: CorteProps; inicio?: number}> = ({clip, p, inicio = 0}) => {
  const {fps} = useVideoConfig();
  const volume = p.censura?.length ? volumeCensura(p, inicio, fps) : undefined;
  return (
  <AbsoluteFill style={{filter: p.pb ? 'grayscale(1) contrast(1.08)' : undefined}}>
    {p.layout === 'tela' ? <Tela clip={clip} p={p} volume={volume} /> : <Camera clip={clip} focoX={p.focoX ?? 0.5} mudo={mudoClip(clip, p)} volume={volume} />}
  </AbsoluteFill>
);
};
