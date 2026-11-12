import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, staticFile, useVideoConfig} from 'remotion';
import {useFontes} from './componentes/Fontes';
import {Fundo} from './componentes/Fundo';
import {Gancho, porLetraGancho} from './componentes/Gancho';
import {Legenda} from './componentes/Legenda';
import {CapaFinal, CartelaFinal} from './componentes/Marca';
import {Granulado, Progresso} from './montagem/Efeitos';
import {ESTILOS} from './estilo';
import {CorteProps} from './tipos';

export const CAPA_SEG = 0.5;

export const Corte: React.FC<CorteProps> = (p) => {
  useFontes();
  const {fps, durationInFrames} = useVideoConfig();
  const estilo = ESTILOS[p.marca] ?? ESTILOS.luiz;
  const mix = p.mix ?? 'completo';
  const fr = (s: number) => Math.round(s * fps);
  const ctaSeg = p.cta ? p.cta.dur ?? 2.5 : 0;
  const capaF = p.capa ? fr(p.capaDur ?? CAPA_SEG) : 0;
  const fimConteudo = durationInFrames - capaF - fr(ctaSeg);
  // trilha: abaixa sozinha enquanto há fala (ducking)
  const volumeTrilha = (f: number) => {
    const t = f / fps;
    const falando = p.palavras.some((w) => t >= w.t0 - 0.15 && t <= w.t1 + 0.25);
    const fimFade = Math.min(1, (durationInFrames - f) / (fps * 1.2));
    return (p.trilha?.volume ?? 0.2) * (falando ? 0.2 : 1) * Math.max(0, fimFade);
  };
  const porLetra = p.gancho ? porLetraGancho(p.gancho.texto, p.gancho.ate) : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Series>
        {p.clips.map((c, i) => (
          <Series.Sequence key={i} durationInFrames={Math.round(c.duracao * fps)}>
            <Fundo clip={c} p={p} inicio={p.clips.slice(0, i).reduce((a, x) => a + Math.round(x.duracao * fps) / fps, 0)} />
          </Series.Sequence>
        ))}
      </Series>
      {p.trilha && (mix === 'completo' || mix === 'sem-voz') ? <Audio src={staticFile(p.trilha.src)} volume={volumeTrilha} startFrom={fr(p.trilha.inicio ?? 0)} loop /> : null}
      {mix !== 'voz' ? (p.sfx ?? []).map((s, i) => <Sequence key={i} from={Math.max(0, fr(s.t))}><Audio src={staticFile(s.src)} volume={s.vol} /></Sequence>) : null}
      {mix !== 'voz' && p.gancho?.tick ? Array.from(p.gancho.texto).map((ch, i) => (ch.trim() ? <Sequence key={`k${i}`} from={fr(i * porLetra)} durationInFrames={4}><Audio src={staticFile(p.gancho!.tick!)} volume={0.35} /></Sequence> : null)) : null}
      <Sequence durationInFrames={fimConteudo}>
        <Legenda palavras={p.palavras} estilo={estilo} base={p.layout === 'tela' ? 470 : 560} />
      </Sequence>
      {p.gancho ? <Gancho texto={p.gancho.texto} ate={p.gancho.ate} estilo={estilo} /> : null}
      <Progresso cor={estilo.acento} />
      <Granulado forca={0.06} />
      {p.cta ? (
        <Sequence from={fimConteudo} durationInFrames={fr(ctaSeg)}>
          <CartelaFinal estilo={estilo} linha={p.cta.linha} engajamento={p.cta.engajamento} />
        </Sequence>
      ) : null}
      {p.capa ? <Sequence from={durationInFrames - capaF}><CapaFinal src={p.capa} /></Sequence> : null}
    </AbsoluteFill>
  );
};
