import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE} from '../tema';

// Cartelas da direção visual v2 (06/11/2026): mesmo vocabulário do "zoom que revela".
// O elemento principal é revelado (máscara que abre + escala 1,1 → 1,0), nunca só fade. Tudo dirigido pela timeline.
// Guia: canal-the-mind-behind/11-DIRECAO-VISUAL-V2.md, seção 4.

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const abre = (f: number, ini: number, dur = 18) => interpolate(f, [ini, ini + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Revela um bloco: máscara da esquerda para a direita + leve escala.
export const Revela: React.FC<{ini?: number; dur?: number; direcao?: 'x' | 'y'; children: React.ReactNode; style?: React.CSSProperties}> = ({ini = 0, dur = 18, direcao = 'x', children, style}) => {
  const f = useCurrentFrame();
  const p = abre(f, ini, dur);
  const clip = direcao === 'x' ? `inset(0 ${100 - p * 100}% 0 0)` : `inset(${100 - p * 100}% 0 0 0)`;
  return <div style={{clipPath: clip, transform: `scale(${1.1 - 0.1 * p})`, transformOrigin: direcao === 'x' ? '0% 50%' : '50% 100%', ...style}}>{children}</div>;
};

// Capítulo. digita=true (EP08 em diante, troca de bloco "botão de gravar"): o título se datilografa letra a letra,
// com cursor; o som de cada letra vem do mix (máquina de escrever), sincronizado pelo mesmo passo (DIGITA_PASSO quadros/letra).
export const DIGITA_PASSO = 2;
export const CapituloV2: React.FC<{numero: string; titulo: string; digita?: boolean; rotulo?: string}> = ({numero, titulo, digita, rotulo}) => {
  const f = useCurrentFrame();
  const linha = abre(f, 14, 20);
  const grande = titulo.length > 18 ? 140 : 170;
  if (digita) {
    const n = Math.max(0, Math.min(titulo.length, Math.floor((f - 8) / DIGITA_PASSO)));
    const cursor = Math.floor(f / 8) % 2 === 0;
    return (
      <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 70, right: 90, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONTE.ficha, fontSize: 34, color: COR.papel, letterSpacing: 6, opacity: 0.85}}>
          <div style={{width: 22, height: 22, borderRadius: 11, background: COR.vermelho, opacity: cursor ? 1 : 0.25}} />REC
        </div>
        <div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.grafite, letterSpacing: 10, textAlign: 'center'}}>{rotulo ?? `PART ${numero}`}</div>
        <div style={{fontFamily: FONTE.titulo, fontSize: grande, color: COR.papel, marginTop: 10, textAlign: 'center', whiteSpace: 'pre'}}>
          {titulo.slice(0, n)}<span style={{opacity: cursor && n < titulo.length + 6 ? 1 : 0}}>_</span>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
      <Revela ini={0} dur={12}><div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.vermelho, letterSpacing: 10, textAlign: 'center'}}>PART {numero}</div></Revela>
      <Revela ini={4} dur={20}><div style={{fontFamily: FONTE.titulo, fontSize: grande, color: COR.papel, marginTop: 10, textAlign: 'center'}}>{titulo}</div></Revela>
      <div style={{width: 260 * linha, height: 4, background: COR.vermelho, marginTop: 20}} />
    </AbsoluteFill>
  );
};

// Ficha do caso
export const FichaV2: React.FC<{campos: [string, string][]; carimbo?: string}> = ({campos, carimbo = 'CASE FILE'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const papel = abre(f, 0, 16);
  const carimboS = spring({frame: f - 16 - campos.length * 16, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'relative', transform: `rotate(-1deg) scale(${1.06 - 0.06 * papel})`}}>
      <div style={{width: 1300, padding: '70px 90px', background: COR.papel, clipPath: `inset(0 0 ${100 - papel * 100}% 0)`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
        {campos.map(([rotulo, valor], i) => (
          <Revela key={rotulo} ini={14 + i * 16} dur={16}>
            <div style={{display: 'flex', gap: 28, marginBottom: 26, fontFamily: FONTE.ficha, fontSize: 40}}>
              <div style={{color: COR.grafite, width: 330}}>{rotulo}</div>
              <div style={{color: COR.tinta, flex: 1}}>{valor}</div>
            </div>
          </Revela>
        ))}
      </div>
        <div style={{position: 'absolute', right: 60, top: -46, background: COR.papel, border: `6px solid ${COR.vermelho}`, color: COR.vermelho, fontFamily: FONTE.titulo, fontSize: 64, padding: '6px 22px', transform: `rotate(-8deg) scale(${1.6 - carimboS * 0.6})`, opacity: carimboS}}>
          {carimbo}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Os nove nomes (sem foto, sem rosto), sobre a imagem do grupo escurecida
export const Nomes: React.FC<{nomes: [string, string][]; fundo?: string; pasta: string; durFrames: number; rotulo?: string}> = ({nomes, fundo, pasta, durFrames, rotulo = 'URAL POLYTECHNIC INSTITUTE · 1959'}) => {
  const f = useCurrentFrame();
  const passo = Math.max(8, Math.floor((durFrames * 0.72) / nomes.length));
  const z = interpolate(f, [0, durFrames], [1.08, 1.0]);
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      {fundo ? <Img src={staticFile(`${pasta}/${fundo}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, transform: `scale(${z})`}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,14,13,0.55), rgba(15,14,13,0.85))'}} />
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center'}}>
        <Revela ini={0} dur={14}><div style={{fontFamily: FONTE.ficha, fontSize: 36, color: COR.grafite, letterSpacing: 8}}>{rotulo}</div></Revela>
      </div>
      <div style={{position: 'absolute', top: 210, left: 140, right: 140, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 70, columnGap: 40}}>
        {nomes.map(([nome, idade], i) => (
          <Revela key={nome} ini={6 + i * passo} dur={14}>
            <div style={{fontFamily: FONTE.titulo, fontSize: nome.length > 20 ? 54 : 64, color: COR.papel, lineHeight: 1}}>{nome.toUpperCase()}</div>
            <div style={{fontFamily: FONTE.ficha, fontSize: 34, color: COR.grafite, marginTop: 10}}>{idade}</div>
          </Revela>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Mapa simplificado: barraca → (distância) → cedro → ravina. A barraca é a pista (vermelho).
export const Mapa: React.FC<{pontos: string[]; distancia: string; nota?: string}> = ({pontos, distancia, nota}) => {
  const f = useCurrentFrame();
  const traco = abre(f, 10, 60);
  const P = [{x: 360, y: 300}, {x: 1260, y: 700}, {x: 1540, y: 800}];
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M 120 180 L 1800 960" stroke={COR.tinta2} strokeWidth={180} />
        <path d={`M ${P[0].x} ${P[0].y} Q 820 420 ${P[1].x} ${P[1].y} L ${P[2].x} ${P[2].y}`} stroke={COR.papel} strokeWidth={5} fill="none" strokeDasharray="14 14" opacity={0.9} />
        <rect x={0} y={0} width={1920} height={1080} fill={COR.tinta} style={{transformOrigin: '0 0', transform: `translateX(${P[0].x + (P[2].x - P[0].x + 60) * traco}px)`}} />
        <circle cx={P[0].x} cy={P[0].y} r={18 * abre(f, 0, 10)} fill={COR.vermelho} />
        <circle cx={P[1].x} cy={P[1].y} r={14 * abre(f, 40, 10)} fill={COR.papel} />
        <circle cx={P[2].x} cy={P[2].y} r={14 * abre(f, 62, 10)} fill={COR.papel} />
      </svg>
      <div style={{position: 'absolute', left: P[0].x - 120, top: P[0].y - 110}}><Revela ini={4}><div style={{fontFamily: FONTE.titulo, fontSize: 72, color: COR.papel}}>{pontos[0]}</div></Revela></div>
      <div style={{position: 'absolute', left: 760, top: 420}}><Revela ini={28}><div style={{fontFamily: FONTE.titulo, fontSize: 96, color: COR.papel}}>{distancia}</div></Revela></div>
      <div style={{position: 'absolute', left: P[1].x - 340, top: P[1].y + 20}}><Revela ini={44}><div style={{fontFamily: FONTE.titulo, fontSize: 64, color: COR.papel}}>{pontos[1]}</div></Revela></div>
      <div style={{position: 'absolute', left: P[2].x + 40, top: P[2].y - 30}}><Revela ini={66}><div style={{fontFamily: FONTE.titulo, fontSize: 64, color: COR.papel}}>{pontos[2]}</div></Revela></div>
      {nota ? <div style={{position: 'absolute', bottom: 70, left: 120, fontFamily: FONTE.ficha, fontSize: 28, color: COR.grafite}}>{nota}</div> : null}
    </AbsoluteFill>
  );
};

// Dados: números grandes revelados um a um, com a fonte sempre na tela
export const Dados: React.FC<{titulo: string; itens: [string, string][]; fonte: string; durFrames: number}> = ({titulo, itens, fonte, durFrames}) => {
  const passo = Math.max(20, Math.floor((durFrames * 0.6) / itens.length));
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, padding: '110px 160px'}}>
      <Revela ini={0} dur={14}><div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.grafite, letterSpacing: 10}}>{titulo}</div></Revela>
      <div style={{marginTop: 70, display: 'flex', flexDirection: 'column', gap: 54}}>
        {itens.map(([valor, rotulo], i) => (
          <Revela key={valor} ini={10 + i * passo} dur={18}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 50}}>
              <div style={{fontFamily: FONTE.titulo, fontSize: 150, color: COR.papel, lineHeight: 0.9, width: 760}}>{valor}</div>
              <div style={{fontFamily: FONTE.ficha, fontSize: 38, color: COR.grafite}}>{rotulo}</div>
            </div>
          </Revela>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 80, left: 160, right: 160, fontFamily: FONTE.ficha, fontSize: 26, color: COR.grafite}}>SOURCES: {fonte}</div>
    </AbsoluteFill>
  );
};

// Citação: frase revelada por máscara; várias falas separadas por "|" entram em sequência
export const CitacaoV2: React.FC<{texto: string; autor: string; estilo?: string; durFrames: number}> = ({texto, autor, estilo, durFrames}) => {
  const partes = texto.split('|');
  const passo = Math.floor((durFrames * 0.5) / partes.length);
  const artigo = estilo === 'artigo';
  const tam = artigo ? 74 : texto.length > 110 ? 70 : texto.length > 60 ? 82 : 100;
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', padding: '0 220px'}}>
      {artigo ? <Revela ini={0} dur={12}><div style={{fontFamily: FONTE.ficha, fontSize: 32, color: COR.grafite, letterSpacing: 6, marginBottom: 30}}>PEER-REVIEWED STUDY</div></Revela> : null}
      {partes.map((p, i) => (
        <Revela key={i} ini={4 + i * passo} dur={22} direcao="y">
          <div style={{fontFamily: FONTE.citacao, fontStyle: 'italic', fontSize: tam, color: COR.papel, lineHeight: 1.15, marginBottom: 24}}>
            {!artigo && <span style={{color: COR.vermelho}}>“</span>}
            {p}
            {!artigo && <span style={{color: COR.vermelho}}>”</span>}
          </div>
        </Revela>
      ))}
      <Revela ini={16} dur={16}><div style={{fontFamily: FONTE.ficha, fontSize: 32, color: COR.grafite, marginTop: 30}}>— {autor}</div></Revela>
    </AbsoluteFill>
  );
};
