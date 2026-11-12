import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE} from './tema';
import {Textura} from './componentes/Textura';
import {Capitulo, Citacao, FichaDoCaso, LinhaDoTempo, NumeroQueVira} from './componentes/Cartelas';
import {Icone, Wordmark} from './componentes/Logo';

// Montagem de um episódio a partir de uma linha do tempo (gerada pelas âncoras da transcrição).
// Só imagem: o áudio (narração + trilha) é mixado depois, com os mesmos tempos.
export type Cena = {tipo: string; ini: number; fim: number; src?: string; texto?: string; autor?: string; numero?: string; titulo?: string};
export type Timeline = {fps: number; duracao: number; cenas: Cena[]; pasta: string; textoNoTopo?: string[]; textoEmbaixo?: string[]};

const FADE = 12; // frames de fusão entre cenas

const Ilustracao: React.FC<{src: string; idx: number; dur: number; origem: string}> = ({src, idx, dur, origem}) => {
  const corte = origem !== '50% 50%' ? 0.1 : 0;
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const aproxima = idx % 2 === 0;
  const z = (aproxima ? 1.08 + 0.1 * t : 1.18 - 0.1 * t) + corte;
  const dx = ((idx % 3) - 1) * 30 * (t - 0.5);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COR.tinta}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateX(${dx}px)`, transformOrigin: origem}} />
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
      {/* áreas livres para os elementos da tela final do YouTube (vídeo + inscrever-se) */}
      <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily: FONTE.ficha, fontSize: 30, color: COR.grafite, letterSpacing: 4}}>
        NEXT CASE ↓
      </div>
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
        <div style={{opacity: n}}><Wordmark altura={150} /></div>
      </div>
    </AbsoluteFill>
  );
};

export const Episodio: React.FC<Timeline> = ({fps, cenas, pasta, textoNoTopo = [], textoEmbaixo = []}) => {
  let img = 0;
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      {cenas.map((c, i) => {
        const from = Math.round(c.ini * fps);
        const dur = Math.max(1, Math.round((c.fim - c.ini) * fps)) + (i < cenas.length - 1 ? FADE : 0);
        let el: React.ReactNode = null;
        if (c.tipo === 'img') {
          const origem = textoNoTopo.includes(c.src!) ? '50% 85%' : textoEmbaixo.includes(c.src!) ? '50% 15%' : '50% 50%';
          el = <Ilustracao src={staticFile(`${pasta}/${c.src}.jpg`)} idx={img++} dur={dur} origem={origem} />;
        } else if (c.tipo === 'ficha') {
          el = <FichaDoCaso campos={[['VICTIM', 'Catherine "Kitty" Genovese, 28'], ['DATE', 'March 13, 1964'], ['PLACE', 'Kew Gardens, Queens, New York'], ['THE STORY', '38 witnesses. Nobody helped.']]} />;
        } else if (c.tipo === 'citacao') {
          el = <Citacao texto={c.texto!} autor={c.autor!} />;
        } else if (c.tipo === 'capitulo') {
          el = <Capitulo numero={c.numero!} titulo={c.titulo!} />;
        } else if (c.tipo === 'numero1') {
          el = <NumeroQueVira titulo="WHO WENT FOR HELP?" itens={[{rotulo: 'Thought they were alone', valor: 85}, {rotulo: '+1 other listener', valor: 62}, {rotulo: '+4 other listeners', valor: 31}]} fonte="Darley & Latané (1968), Journal of Personality and Social Psychology, 8(4)" />;
        } else if (c.tipo === 'numero2') {
          el = <NumeroQueVira titulo="REAL FIGHTS ON CCTV: SOMEONE HELPED" itens={[{rotulo: '219 incidents, 3 cities', valor: 91}]} fonte="Philpot et al. (2020), American Psychologist, 75(1)" />;
        } else if (c.tipo === 'linha') {
          el = <LinhaDoTempo marcos={[{data: '1964', texto: 'Kitty Genovese is murdered in Queens'}, {data: '1964', texto: 'NYT: "37 Who Saw Murder Didn\'t Call the Police"', pista: true}, {data: '1968', texto: 'Darley & Latané test the "bystander effect"'}, {data: '2007', texto: 'Psychologists re-examine the records'}, {data: '2016', texto: 'The Times calls its own story "flawed"'}]} />;
        } else if (c.tipo === 'abertura') {
          el = <AberturaCurta />;
        } else if (c.tipo === 'final') {
          el = <Final />;
        }
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Fusao dur={dur} primeira={i === 0}>{el}</Fusao>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)"}} />
    </AbsoluteFill>
  );
};

const Fusao: React.FC<{dur: number; primeira: boolean; children: React.ReactNode}> = ({primeira, children}) => {
  const f = useCurrentFrame();
  const o = primeira ? 1 : interpolate(f, [0, FADE], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
