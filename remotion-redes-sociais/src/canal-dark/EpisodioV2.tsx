import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {COR, FONTE, carregarFontes} from './tema';
import {Camera, Mov, enquadramentos} from './componentes/Movimento';
import {CapituloV2, CitacaoV2, Dados, FichaV2, Mapa, Nomes} from './componentes/CartelasV2';
import {Icone, Wordmark} from './componentes/Logo';

// Montagem v2 de um episódio (direção visual v2, 06/11/2026), a partir de <episodio>/montagem/timeline.json
// (gerado por code/canal-the-mind-behind/montagem/plano_v2.py). O EP01 continua no componente Episodio (v1).
// Por cena: movimento planejado (mov/foco/escala/destino), corte seco nas frases de impacto (corte: true),
// realce da pista (pista: true → vinheta que fecha no fim do movimento), cartelas dirigidas pela timeline,
// grão de papel/filme por cima de tudo. Só imagem: o áudio é mixado depois, com os mesmos tempos.

carregarFontes();

export type CenaV2 = {
  tipo: string; ini: number; fim: number; src?: string; mov?: Mov; foco?: [number, number]; escala?: [number, number] | number;
  destino?: [number, number]; corte?: boolean; pista?: boolean; texto?: string; autor?: string; estilo?: string; numero?: string; titulo?: string;
  campos?: [string, string][]; carimbo?: string; nomes?: [string, string][]; fundo?: string; rotulo?: string; pontos?: string[]; distancia?: string; nota?: string;
  itens?: [string, string][]; fonte?: string;
};
export type TimelineV2 = {fps: number; duracao: number; pasta: string; cenas: CenaV2[]};

const FADE = 12;

const Ilustracao: React.FC<{c: CenaV2; pasta: string; dur: number}> = ({c, pasta, dur}) => {
  const foco = {x: c.foco?.[0] ?? 0.5, y: c.foco?.[1] ?? 0.5};
  const esc = (Array.isArray(c.escala) ? c.escala : [1, 1.3]) as [number, number];
  const destino = c.destino ? {x: c.destino[0], y: c.destino[1]} : undefined;
  const [de, para] = enquadramentos(c.mov ?? 'descobre', foco, esc, destino);
  return <Camera src={staticFile(`${pasta}/${c.src}.jpg`)} de={de} para={para} dur={dur} respiro={0.15} vinhetaFoco={c.pista ? 0.75 : 0} />;
};

const Video: React.FC<{c: CenaV2; pasta: string; dur: number; fps: number}> = ({c, pasta, dur, fps}) => {
  const f = useCurrentFrame();
  const seg = dur / fps;
  const taxa = Math.max(0.55, Math.min(1, 4.9 / seg));
  const base = typeof c.escala === 'number' ? c.escala : 1.0;
  const s = base * interpolate(f, [0, dur], [1.0, 1.06], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const fx = c.foco?.[0] ?? 0.5;
  const fy = c.foco?.[1] ?? 0.5;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COR.tinta}}>
      <OffthreadVideo src={staticFile(`${pasta}/${c.src}.mp4`)} muted playbackRate={taxa}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}} />
    </AbsoluteFill>
  );
};

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, opacity: o}}>
      <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
        <Icone tamanho={120} />
        <Wordmark altura={80} />
      </div>
      <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily: FONTE.ficha, fontSize: 30, color: COR.grafite, letterSpacing: 4}}>NEXT CASE ↓</div>
    </AbsoluteFill>
  );
};

const AberturaCurta: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 45], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const n = interpolate(f, [35, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
        <Icone tamanho={300} progresso={p} />
        <div style={{opacity: n, clipPath: `inset(0 ${100 - n * 100}% 0 0)`}}><Wordmark altura={150} /></div>
      </div>
    </AbsoluteFill>
  );
};

// Grão barato: uma imagem de ruído fixa, deslocada a cada 2 quadros (a textura SVG animada deixava o render lento).
const Grao: React.FC<{pasta: string}> = ({pasta}) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2) % 6;
  const dx = [0, -37, -71, -13, -53, -29][k];
  const dy = [0, -41, -17, -63, -7, -55][k];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <Img src={staticFile(`${pasta}/grao.png`)} style={{position: 'absolute', left: dx, top: dy, width: 2020, height: 1180, opacity: 0.09, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

const Fusao: React.FC<{entra: boolean; children: React.ReactNode}> = ({entra, children}) => {
  const f = useCurrentFrame();
  const o = entra ? interpolate(f, [0, FADE], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const EpisodioV2: React.FC<TimelineV2> = ({fps, cenas, pasta}) => (
  <AbsoluteFill style={{backgroundColor: COR.tinta}}>
    {cenas.map((c, i) => {
      const from = Math.round(c.ini * fps);
      const base = Math.max(1, Math.round(c.fim * fps) - from);
      const prox = cenas[i + 1];
      const sobra = prox && !prox.corte ? FADE : 0; // a próxima entra em fusão por cima desta
      const dur = base + sobra;
      let el: React.ReactNode = null;
      if (c.tipo === 'img') el = <Ilustracao c={c} pasta={pasta} dur={base} />;
      else if (c.tipo === 'video') el = <Video c={c} pasta={pasta} dur={dur} fps={fps} />;
      else if (c.tipo === 'ficha') el = <FichaV2 campos={c.campos!} carimbo={c.carimbo} />;
      else if (c.tipo === 'nomes') el = <Nomes nomes={c.nomes!} fundo={c.fundo} pasta={pasta} durFrames={base} rotulo={c.rotulo} />;
      else if (c.tipo === 'mapa') el = <Mapa pontos={c.pontos!} distancia={c.distancia!} nota={c.nota} />;
      else if (c.tipo === 'dados') el = <Dados titulo={c.titulo!} itens={c.itens!} fonte={c.fonte!} durFrames={base} />;
      else if (c.tipo === 'citacao') el = <CitacaoV2 texto={c.texto!} autor={c.autor!} estilo={c.estilo} durFrames={base} />;
      else if (c.tipo === 'capitulo') el = <CapituloV2 numero={c.numero!} titulo={c.titulo!} digita={(c as any).digita} rotulo={(c as any).rotulo} />;
      else if (c.tipo === 'abertura') el = <AberturaCurta />;
      else if (c.tipo === 'final') el = <Final />;
      return (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Fusao entra={i > 0 && !c.corte}>{el}</Fusao>
        </Sequence>
      );
    })}
    <Grao pasta={pasta} />
  </AbsoluteFill>
);
