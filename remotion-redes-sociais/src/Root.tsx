import React from 'react';
import {Composition} from 'remotion';
import {Corte} from './Corte';
import {CorteProps} from './tipos';
import cortes from './cortes.json';
import {Montagem} from './montagem/Montagem';
import {MontagemProps} from './montagem/tipos';
import montagem from './montagem.json';
import {Flip} from './Flip';
import {PalavrasSting} from './PalavrasSting';
import {InvejaLuizCorte, DURATION_FRAMES} from './InvejaLuizCorte';
import {CapaComparativaInvejaLuiz} from './CapaComparativaInvejaLuiz';
import {CapaInvejaLuiz} from './CapaInvejaLuiz';
import {CanalDarkComposicoes} from './canal-dark/Composicoes';

const M0 = montagem as unknown as MontagemProps;
const FIM_CLIPS = M0.clips.reduce((a, c) => Math.max(a, c.inicio + c.dur), 0);
// Palavras: termina numa única cartela com o logo (2,5 s); sem capa no vídeo
const M: MontagemProps = {...M0, capa: undefined, duracao: FIM_CLIPS + 2.5};
// variante do perfil pessoal: sem cartela e sem capa (acaba no fim do conteúdo)
const M_LUIZ: MontagemProps = {...M0, id: `${M0.id}-luiz`, marca: 'luiz', cta: undefined, capa: undefined, duracao: FIM_CLIPS};

// Uma composição por corte preparado (src/cortes.json é gerado por scripts/preparar.mjs).
// inputProps {mix: 'completo' | 'sem-trilha' | 'voz'} escolhe a mixagem na hora do render.
export const RemotionRoot: React.FC = () => (
  <>
    {(cortes as unknown as CorteProps[]).map((c) => (
      <Composition key={c.id} id={c.id} component={Corte} fps={30} width={1080} height={1920}
        durationInFrames={Math.round(c.duracao * 30)} defaultProps={c} />
    ))}
    {[M, M_LUIZ].map((m) => (
      <Composition key={m.id} id={m.id} component={Montagem} fps={30} width={1080} height={1920}
        durationInFrames={Math.round(m.duracao * 30)} defaultProps={m} />
    ))}
    <Composition id="flip-corta-camera" component={Flip} fps={30} width={1080} height={1920}
      durationInFrames={189} />
    <Composition id="palavras-abertura" component={PalavrasSting} fps={30} width={1080} height={1920}
      durationInFrames={189} />
    <Composition id="inveja-luiz-o-olho-volta" component={InvejaLuizCorte} fps={30} width={1080} height={1920}
      durationInFrames={DURATION_FRAMES} defaultProps={{comMusica: true}} />
    <Composition id="inveja-luiz-o-olho-volta-ig" component={InvejaLuizCorte} fps={30} width={1080} height={1920}
      durationInFrames={DURATION_FRAMES} defaultProps={{comMusica: false}} />
    <Composition id="capa-inveja-luiz-b" component={CapaInvejaLuiz} fps={1} width={1080} height={1920} durationInFrames={1} />`r`n    <Composition id="capa-inveja-luiz-comparativa" component={CapaComparativaInvejaLuiz} fps={1} width={1920} height={1080}
      durationInFrames={1} />
    {/* Canal dark (The Mind Behind) — composições tmb-* */}
    <CanalDarkComposicoes />
  </>
);
