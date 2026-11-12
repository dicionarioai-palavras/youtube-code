// Bastidores do vídeo Ciúme (06/11/2026): 3 peças tiradas da sessão de narração.
// Luiz: sem cartela e sem capa no fim (acaba no conteúdo, música em fade). Palavras: uma única cartela com o logo.
// Áudio: voz única tratada no Adobe Podcast (adobe.wav, normalizada a −14 LUFS) + trilha com ducking.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFontes} from '../componentes/Fontes';
import {CartelaFinal} from '../componentes/Marca';
import {ESTILOS} from '../estilo';
import dados from './dados.json';

type Palavra = {t0: number; t1: number; texto: string};
type Clip = {src: string; ini: number; dur: number; rotulo: string};
type Peca = {clips: Clip[]; palavras: Palavra[]; duracao: number};
const DADOS = dados as unknown as Record<string, Peca>;

export type BastidorProps = {
  peca: string;
  marca: 'luiz' | 'palavras';
  gancho: string;
  voz: string;
  trilha?: {src: string; volume: number; inicio?: number};
  mix?: 'completo' | 'sem-trilha' | 'voz';
  contadorPraQue?: boolean;
  persiana?: boolean; // luz de persiana na última tomada (eco da S27)
  selo?: {em: number; texto: string}; // carimbo final
  cartela?: {linha: string; engajamento?: string};
};

export const CARTELA_S = 2.5;
export const duracaoBastidor = (p: BastidorProps) => DADOS[p.peca].duracao + (p.marca === 'palavras' && p.cartela ? CARTELA_S : 0.5);

const QUENTE = '#F3D8A0';
const ESCURO = 'rgba(8,9,12,0.62)';

const grupos = (ps: Palavra[]) => {
  const out: Palavra[][] = [];
  let atual: Palavra[] = [];
  for (const p of ps) {
    const ult = atual[atual.length - 1];
    if (ult && (atual.length >= 3 || p.t0 - ult.t1 > 0.5 || /[.!?…,]$/.test(ult.texto))) { out.push(atual); atual = []; }
    atual.push(p);
  }
  if (atual.length) out.push(atual);
  return out;
};

const Video: React.FC<{c: Clip; ultimo: boolean; persiana?: boolean}> = ({c, ultimo, persiana}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const soco = interpolate(f, [0, 5], [1.07, 1], {extrapolateRight: 'clamp'});
  const lento = ultimo && persiana ? interpolate(f, [0, c.dur * fps], [1, 1.07]) : 1;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <OffthreadVideo src={staticFile(c.src)} muted
      style={{width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${soco * lento})`, transformOrigin: '50% 35%',
        filter: 'saturate(0.86) contrast(1.05) brightness(0.98) sepia(0.06)'}} />
  </AbsoluteFill>;
};

// Faixas de luz e sombra, como uma persiana na janela: entram devagar na última tomada.
const Persiana: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const op = interpolate(f, [0, fps * 2, dur * fps - 10, dur * fps], [0, 0.34, 0.34, 0], {extrapolateRight: 'clamp'});
  const desl = interpolate(f, [0, dur * fps], [0, 90]);
  return <AbsoluteFill style={{opacity: op, mixBlendMode: 'multiply', pointerEvents: 'none',
    background: `repeating-linear-gradient(-14deg, rgba(0,0,0,0) ${desl}px, rgba(0,0,0,0) ${desl + 46}px, rgba(10,8,6,0.95) ${desl + 64}px, rgba(0,0,0,0) ${desl + 92}px)`}} />;
};

const Gancho: React.FC<{texto: string; marca: string}> = ({texto, marca}) => {
  const f = useCurrentFrame();
  const n = Math.min(texto.length, Math.floor(f / 1.15));
  const op = interpolate(f, [0, 3, 78, 90], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  if (f > 90) return null;
  const pal = marca === 'palavras';
  return <AbsoluteFill style={{alignItems: 'center', paddingTop: 230, opacity: op}}>
    <div style={{maxWidth: 940, textAlign: 'center', padding: pal ? '18px 30px 10px' : 0,
      background: pal ? ESTILOS.palavras.papel : 'transparent', borderRadius: pal ? 6 : 0,
      fontFamily: pal ? 'Bebas Neue' : 'Barlow Condensed', fontWeight: pal ? 400 : 800, fontSize: pal ? 104 : 94, lineHeight: 1.0,
      color: pal ? ESTILOS.palavras.tinta : '#FFFFFF', letterSpacing: pal ? 2 : 1, textTransform: 'uppercase',
      textShadow: pal ? 'none' : '0 4px 22px rgba(0,0,0,0.9)'}}>
      {texto.slice(0, n)}<span style={{opacity: n < texto.length ? 1 : 0}}>|</span>
    </div>
  </AbsoluteFill>;
};

const Chip: React.FC<{texto: string; marca: string; grande?: boolean}> = ({texto, marca, grande}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  const pal = marca === 'palavras';
  return <AbsoluteFill style={{alignItems: 'flex-start', paddingTop: 470, paddingLeft: 70}}>
    <div style={{transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -8 - 2}deg)`, opacity: s, transformOrigin: 'left center',
      padding: grande ? '6px 26px 2px' : '8px 22px 4px', borderRadius: 6,
      background: pal ? ESTILOS.palavras.acento : ESCURO, border: pal ? 'none' : `3px solid ${QUENTE}`,
      fontFamily: pal ? 'Bebas Neue' : 'Barlow Condensed', fontWeight: pal ? 400 : 800, fontSize: grande ? 120 : 64, lineHeight: 1,
      color: pal ? ESTILOS.palavras.papel : QUENTE, letterSpacing: 2, textTransform: 'uppercase'}}>{texto}</div>
  </AbsoluteFill>;
};

const Legendas: React.FC<{ps: Palavra[]; marca: string; ate: number}> = ({ps, marca, ate}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const blocos = useMemo(() => grupos(ps), [ps]);
  if (t > ate) return null;
  const bloco = blocos.find((b, i) => t >= b[0].t0 - 0.05 && t < Math.min(blocos[i + 1]?.[0].t0 ?? 1e9, b[b.length - 1].t1 + 0.4));
  if (!bloco) return null;
  const pal = marca === 'palavras';
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300, paddingLeft: 64, paddingRight: 64}}>
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 18px', maxWidth: 920,
      padding: '12px 24px', background: 'rgba(8,9,12,0.45)', borderRadius: 12}}>
      {bloco.map((p, i) => {
        const ativa = t >= p.t0 - 0.03 && t < p.t1 + 0.05;
        return <span key={i} style={{fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 78, lineHeight: 1.05,
          color: ativa ? (pal ? ESTILOS.palavras.destaque : QUENTE) : (pal ? ESTILOS.palavras.texto : '#FFFFFF'),
          textShadow: '0 3px 14px rgba(0,0,0,0.75)', textTransform: 'uppercase'}}>{p.texto}</span>;
      })}
    </div>
  </AbsoluteFill>;
};

export const BastidorCiume: React.FC<BastidorProps> = (p) => {
  useFontes();
  const {fps, durationInFrames} = useVideoConfig();
  const d = DADOS[p.peca];
  const fr = (s: number) => Math.round(s * fps);
  const mix = p.mix ?? 'completo';
  const words = d.palavras;

  // rótulos: tomadas (por clipe) ou contador de "pra quê?"
  const chips: {de: number; ate: number; texto: string; grande?: boolean}[] = [];
  if (p.contadorPraQue) {
    const pq = words.filter((w) => /^pra$/i.test(w.texto));
    pq.forEach((w, i) => chips.push({de: w.t0, ate: (pq[i + 1]?.t0 ?? w.t1 + 1.2), texto: `#${i + 1}`, grande: true}));
  } else {
    d.clips.forEach((c) => { if (c.rotulo) chips.push({de: c.ini, ate: c.ini + c.dur, texto: c.rotulo}); });
  }

  const musica = (f: number) => {
    if (!p.trilha) return 0;
    const t = f / fps;
    const falando = words.some((w) => t >= w.t0 - 0.12 && t <= w.t1 + 0.2);
    const fimSom = (p.marca === 'palavras' && p.cartela) ? durationInFrames : fr(d.duracao + 0.5);
    const fade = Math.min(1, Math.max(0, (fimSom - f) / (fps * 0.8)));
    const entra = Math.min(1, f / (fps * 0.4));
    return p.trilha.volume * (falando ? 0.32 : 1) * fade * entra;
  };

  const ult = d.clips.length - 1;
  return <AbsoluteFill style={{backgroundColor: '#0E0F12'}}>
    {d.clips.map((c, i) => (
      <Sequence key={i} from={fr(c.ini)} durationInFrames={fr(c.dur) + (i === ult ? fr(0.6) : 1)}>
        <Video c={c} ultimo={i === ult} persiana={p.persiana} />
        {i === ult && p.persiana ? <Persiana dur={c.dur} /> : null}
      </Sequence>
    ))}
    {chips.map((c, i) => (
      <Sequence key={'c' + i} from={fr(c.de)} durationInFrames={Math.max(1, fr(c.ate - c.de))}>
        <Chip texto={c.texto} marca={p.marca} grande={c.grande} />
        <Audio src={staticFile('audio/sfx/clique.wav')} volume={0.35} />
      </Sequence>
    ))}
    {p.selo ? <Sequence from={fr(p.selo.em)} durationInFrames={fr(d.duracao + 0.6 - p.selo.em)}>
      <Chip texto={p.selo.texto} marca={p.marca} />
    </Sequence> : null}
    <Legendas ps={words} marca={p.marca} ate={d.duracao + 0.3} />
    <Gancho texto={p.gancho} marca={p.marca} />
    {Array.from({length: 7}).map((_, i) => (
      <Sequence key={'k' + i} from={Math.round(i * 4.6)} durationInFrames={6}>
        <Audio src={staticFile('audio/sfx/tecla.wav')} volume={0.22} />
      </Sequence>
    ))}
    <Audio src={staticFile(p.voz)} />
    {p.trilha && mix === 'completo' ? <Audio src={staticFile(p.trilha.src)} startFrom={fr(p.trilha.inicio ?? 0)} volume={musica} /> : null}
    {p.marca === 'palavras' && p.cartela ? (
      <Sequence from={fr(d.duracao)}>
        <CartelaFinal estilo={ESTILOS.palavras} linha={p.cartela.linha} engajamento={p.cartela.engajamento} />
      </Sequence>
    ) : null}
  </AbsoluteFill>;
};
