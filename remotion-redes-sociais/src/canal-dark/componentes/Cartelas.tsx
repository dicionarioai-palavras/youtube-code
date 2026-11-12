import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE} from '../tema';

// Kit de cartelas do canal. Cada uma é usada no meio do vídeo longo, por cima da ilustração ou sozinha.

const digitar = (texto: string, frame: number, inicio: number, cps = 28, fps = 30) =>
  texto.slice(0, Math.max(0, Math.floor(((frame - inicio) / fps) * cps)));

// 1) Ficha do caso — abre todo episódio
export const FichaDoCaso: React.FC<{campos: [string, string][]; carimbo?: string}> = ({campos, carimbo = 'CASE FILE'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entra = spring({frame, fps, config: {damping: 18}});
  const carimboS = spring({frame: frame - 8, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          width: 1180,
          padding: '70px 90px',
          background: COR.papel,
          transform: `translateY(${(1 - entra) * 80}px) rotate(-1.2deg)`,
          opacity: entra,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: -42,
            background: COR.papel,
            border: `6px solid ${COR.vermelho}`,
            color: COR.vermelho,
            fontFamily: FONTE.titulo,
            fontSize: 64,
            padding: '6px 22px',
            transform: `rotate(-8deg) scale(${1.6 - carimboS * 0.6})`,
            opacity: carimboS,
          }}
        >
          {carimbo}
        </div>
        {campos.map(([rotulo, valor], i) => {
          const inicio = 14 + i * 22;
          return (
            <div key={rotulo} style={{display: 'flex', gap: 28, marginBottom: 26, fontFamily: FONTE.ficha, fontSize: 40}}>
              <div style={{color: COR.grafite, width: 210}}>{rotulo}</div>
              <div style={{color: COR.tinta, flex: 1}}>
                {digitar(valor, frame, inicio)}
                {frame >= inicio && digitar(valor, frame, inicio).length < valor.length ? '▌' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 2) Número que vira — estudos e estatísticas (sempre com a fonte embaixo)
export const NumeroQueVira: React.FC<{itens: {rotulo: string; valor: number}[]; fonte: string; titulo: string}> = ({
  itens,
  fonte,
  titulo,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, padding: '110px 160px'}}>
      <div style={{fontFamily: FONTE.titulo, fontSize: 84, color: COR.papel, letterSpacing: 2}}>{titulo}</div>
      <div style={{marginTop: 70, display: 'flex', flexDirection: 'column', gap: 44}}>
        {itens.map((it, i) => {
          const p = spring({frame: frame - 12 - i * 18, fps, config: {damping: 22}});
          const ultimo = i === itens.length - 1;
          return (
            <div key={it.rotulo} style={{display: 'flex', alignItems: 'center', gap: 36}}>
              <div style={{width: 430, fontFamily: FONTE.ficha, fontSize: 36, color: COR.grafite}}>{it.rotulo}</div>
              <div style={{flex: 1, height: 64, background: COR.tinta2, position: 'relative'}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${it.valor * p}%`,
                    background: ultimo ? COR.vermelho : COR.papel,
                  }}
                />
              </div>
              <div style={{width: 200, textAlign: 'right', fontFamily: FONTE.titulo, fontSize: 96, color: ultimo ? COR.vermelho : COR.papel}}>
                {Math.round(it.valor * p)}%
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 90, left: 160, fontFamily: FONTE.ficha, fontSize: 30, color: COR.grafite}}>
        SOURCE: {fonte}
      </div>
    </AbsoluteFill>
  );
};

// 3) Linha do tempo — datas do caso
export const LinhaDoTempo: React.FC<{marcos: {data: string; texto: string; pista?: boolean}[]}> = ({marcos}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const linha = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const passo = 1600 / (marcos.length - 1);
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      <div style={{position: 'absolute', left: 160, top: 540, width: 1600 * linha, height: 4, background: COR.grafite}} />
      {marcos.map((m, i) => {
        const s = spring({frame: frame - 10 - i * 14, fps, config: {damping: 16}});
        const cima = i % 2 === 0;
        const cor = m.pista ? COR.vermelho : COR.papel;
        return (
          <div key={m.data} style={{position: 'absolute', left: 160 + i * passo - 160, top: cima ? 300 : 570, width: 320, textAlign: 'center', opacity: s}}>
            {!cima && <div style={{width: 18, height: 18, borderRadius: 9, background: cor, margin: '-39px auto 24px'}} />}
            <div style={{fontFamily: FONTE.titulo, fontSize: 64, color: cor}}>{m.data}</div>
            <div style={{fontFamily: FONTE.texto, fontSize: 34, color: COR.papel, opacity: 0.85, lineHeight: 1.3, marginTop: 8}}>{m.texto}</div>
            {cima && <div style={{width: 18, height: 18, borderRadius: 9, background: cor, margin: '28px auto 0'}} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 4) Capítulo
export const Capitulo: React.FC<{numero: string; titulo: string}> = ({numero, titulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 20}});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.vermelho, letterSpacing: 10, opacity: s}}>PART {numero}</div>
      <div style={{fontFamily: FONTE.titulo, fontSize: 170, color: COR.papel, marginTop: 10, transform: `scale(${0.92 + s * 0.08})`, opacity: s}}>
        {titulo}
      </div>
      <div style={{width: 260 * s, height: 4, background: COR.vermelho, marginTop: 20}} />
    </AbsoluteFill>
  );
};

// 5) Citação — fala real, com quem disse e onde
export const Citacao: React.FC<{texto: string; autor: string}> = ({texto, autor}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', padding: '0 240px'}}>
      <div style={{fontFamily: FONTE.citacao, fontStyle: 'italic', fontSize: 92, color: COR.papel, lineHeight: 1.15, opacity: o}}>
        <span style={{color: COR.vermelho}}>“</span>
        {texto}
        <span style={{color: COR.vermelho}}>”</span>
      </div>
      <div style={{fontFamily: FONTE.ficha, fontSize: 34, color: COR.grafite, marginTop: 40, opacity: o}}>— {autor}</div>
    </AbsoluteFill>
  );
};
