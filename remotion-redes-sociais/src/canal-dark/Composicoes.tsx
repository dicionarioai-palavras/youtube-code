import React from 'react';
import {AbsoluteFill, Composition, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE, carregarFontes} from './tema';
import {Icone, LogoHorizontal, Wordmark} from './componentes/Logo';
import {Textura} from './componentes/Textura';
import {Predio} from './componentes/Predio';
import {Capitulo, Citacao, FichaDoCaso, LinhaDoTempo, NumeroQueVira} from './componentes/Cartelas';
import {Img, staticFile} from 'remotion';
import {Episodio, Timeline} from './Episodio';
import ep01 from './ep01-timeline.json';
import ep01Shorts from './ep01-shorts.json';
import {Short, ShortProps} from './Short';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep02 from './ep02-timeline.json';
const EP02 = ep02 as unknown as TimelineV2; // EP02: montagem v2 (direção visual v2)
import {ComposicoesLote00} from './ComposicoesLote00';
import {ComposicoesEP02Cortes} from './ComposicoesEP02Cortes';
import {ComposicoesEP03} from './ComposicoesEP03';
import {ComposicoesEP03Cortes} from './ComposicoesEP03Cortes';
import {ComposicoesEP04} from './ComposicoesEP04';
import {ComposicoesEP04Cortes} from './ComposicoesEP04Cortes';
import {ComposicoesEP05} from './ComposicoesEP05';
import {ComposicoesEP05Cortes} from './ComposicoesEP05Cortes';
import {ComposicoesEP06} from './ComposicoesEP06';
import {ComposicoesEP06Cortes} from './ComposicoesEP06Cortes';
import {ComposicoesEP07} from './ComposicoesEP07';
import {ComposicoesEP07Cortes} from './ComposicoesEP07Cortes';

const EP01: Timeline = {...(ep01 as unknown as Timeline), pasta: 'ep01', textoNoTopo: ['a2b-bar'], textoEmbaixo: ['c31c-grito', 'c37-telefone', 'c03-livro']};

carregarFontes();

// ---------- Marca ----------
const LogoQuadro: React.FC<{fundo?: string}> = ({fundo = COR.tinta}) => (
  <AbsoluteFill style={{backgroundColor: fundo, justifyContent: 'center', alignItems: 'center'}}>
    <LogoHorizontal altura={190} tagline />
  </AbsoluteFill>
);

const LogoVertical: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center', gap: 40}}>
    <Icone tamanho={760} />
    <Wordmark altura={170} />
  </AbsoluteFill>
);

const Avatar: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center'}}>
    <div style={{marginLeft: -20, marginTop: 30}}>
      <Icone tamanho={660} />
    </div>
    <Textura forca={0.08} vinheta={0.35} animado={false} />
  </AbsoluteFill>
);

const MarcaDagua: React.FC = () => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
    <Icone tamanho={150} />
  </AbsoluteFill>
);

// Banner 2560x1440: tudo importante dentro da área segura central de 1546x423
const Banner: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COR.tinta}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.35}}>
      <Predio largura={2560} altura={1440} colunas={14} linhas={7} acesas={50} figura={false} deslocX={-500} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(15,14,13,0.92) 30%, rgba(15,14,13,0.55) 70%, rgba(15,14,13,0.92))'}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
        <Icone tamanho={330} />
        <div>
          <Wordmark altura={170} />
          <div style={{fontFamily: FONTE.ficha, fontSize: 34, color: COR.papel, marginTop: 22, letterSpacing: 3}}>
            REAL CASES · THE HUMAN MIND BEHIND THEM
          </div>
          <div style={{fontFamily: FONTE.ficha, fontSize: 30, color: COR.vermelho, marginTop: 12, letterSpacing: 3}}>
            NEW CASE EVERY TUESDAY
          </div>
        </div>
      </div>
    </AbsoluteFill>
    <Textura forca={0.1} animado={false} />
  </AbsoluteFill>
);

// ---------- Thumbnail ----------
// Receita: 1 ilustração forte + até 3 palavras + 1 elemento vermelho. Sem sangue, sem rosto real.
export type ThumbProps = {linha1: string; linha2?: string; destaque?: string; acesas?: number; imagem?: string};

const Thumb: React.FC<ThumbProps> = ({linha1, linha2, destaque, acesas = 38, imagem}) => (
  <AbsoluteFill style={{backgroundColor: COR.tinta}}>
    {imagem ? (
      <Img src={staticFile(imagem)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12) translateX(140px)', transformOrigin: '60% 45%'}} />
    ) : (
      <Predio acesas={acesas} deslocX={60} />
    )}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 60% at 22% 30%, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0) 100%)'}} />
    {imagem && <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 38%, rgba(10,10,10,0) 58%)'}} />}
    <div style={{position: 'absolute', left: 80, top: 150, width: 820}}>
      <div style={{fontFamily: FONTE.titulo, fontSize: 250, lineHeight: 0.84, color: COR.papel}}>
        {linha1}
        {!linha2 && destaque && <span style={{color: COR.vermelho}}>{destaque}</span>}
      </div>
      {linha2 && (
        <div style={{fontFamily: FONTE.titulo, fontSize: 250, lineHeight: 0.84, color: COR.papel}}>
          {linha2}
          {destaque && <span style={{color: COR.vermelho}}>{destaque}</span>}
        </div>
      )}
    </div>
    <div style={{position: 'absolute', right: 36, top: 30, opacity: 0.9}}>
      <Icone tamanho={110} />
    </div>
    <Textura forca={0.12} vinheta={0.3} animado={false} />
  </AbsoluteFill>
);

// ---------- Abertura (3 s): digital se desenha, nome entra ----------
const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [0, 45], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const nome = spring({frame: frame - 38, fps, config: {damping: 18}});
  const sai = interpolate(frame, [78, 90], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, justifyContent: 'center', alignItems: 'center', opacity: sai}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
        <Icone tamanho={300} progresso={p} />
        <div style={{opacity: nome, transform: `translateX(${(1 - nome) * -40}px)`}}>
          <Wordmark altura={150} />
        </div>
      </div>
      <Textura />
    </AbsoluteFill>
  );
};

// ---------- Cena ilustrada com movimento (substitui a imagem do Runway na demo) ----------
const CenaPredio: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], [1, 1.12]);
  const x = interpolate(frame, [0, dur], [0, -60]);
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z}) translateX(${x}px)`}}>
        <Predio />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, bottom: 110, fontFamily: FONTE.ficha, fontSize: 36, color: COR.papel}}>
        KEW GARDENS, QUEENS — MARCH 13, 1964
      </div>
      <Textura />
    </AbsoluteFill>
  );
};

// ---------- Demo do estilo (≈ 26 s) ----------
const T = {abertura: 90, ficha: 165, cena: 150, capitulo: 75, linha: 180, numero: 150, citacao: 120};
export const DUR_DEMO = Object.values(T).reduce((a, b) => a + b, 0);

const DemoEstilo: React.FC = () => {
  let t = 0;
  const seq = (dur: number, el: React.ReactNode) => {
    const s = (
      <Sequence key={t} from={t} durationInFrames={dur}>
        {el}
        <Textura />
      </Sequence>
    );
    t += dur;
    return s;
  };
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      {seq(T.abertura, <Abertura />)}
      {seq(
        T.ficha,
        <FichaDoCaso
          campos={[
            ['VICTIM', 'Catherine "Kitty" Genovese, 28'],
            ['DATE', 'March 13, 1964'],
            ['PLACE', 'Kew Gardens, Queens, New York'],
            ['THE STORY', '38 witnesses. Nobody helped.'],
          ]}
        />,
      )}
      {seq(T.cena, <CenaPredio dur={T.cena} />)}
      {seq(T.capitulo, <Capitulo numero="II" titulo="THE NUMBER" />)}
      {seq(
        T.linha,
        <LinhaDoTempo
          marcos={[
            {data: '1964', texto: 'Kitty Genovese is murdered in Queens'},
            {data: '1964', texto: 'NYT: "37 Who Saw Murder Didn\'t Call the Police"', pista: true},
            {data: '1968', texto: 'Darley & Latané test the "bystander effect"'},
            {data: '2007', texto: 'Psychologists find no evidence of 38 witnesses'},
            {data: '2016', texto: 'The Times calls its own story "flawed"'},
          ]}
        />,
      )}
      {seq(
        T.numero,
        <NumeroQueVira
          titulo="WHO REPORTED THE SEIZURE?"
          itens={[
            {rotulo: 'Thought they were alone', valor: 85},
            {rotulo: '+1 other listener', valor: 62},
            {rotulo: '+4 other listeners', valor: 31},
          ]}
          fonte="Darley & Latané (1968), Journal of Personality and Social Psychology, 8(4)"
        />,
      )}
      {seq(T.citacao, <Citacao texto="Help is on the way." autor="Sophia Farrar, neighbor, holding Kitty in the stairwell (as recounted in The Witness, 2015)" />)}
    </AbsoluteFill>
  );
};

// ---------- Short (1080x1920) ----------
const PALAVRAS_SHORT = 'In 1964, a newspaper said 38 people watched a murder and did nothing. It was wrong.'.split(' ');
const ShortModelo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const porPalavra = 12;
  const atual = Math.min(PALAVRAS_SHORT.length - 1, Math.floor(frame / porPalavra));
  const janela = PALAVRAS_SHORT.slice(Math.max(0, atual - 3), atual + 1);
  const gancho = spring({frame, fps, config: {damping: 14}});
  const z = interpolate(frame, [0, durationInFrames], [1.18, 1.3]);
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      <AbsoluteFill style={{top: 420, height: 1080, overflow: 'hidden'}}>
        <div style={{transform: `scale(${z}) translateX(-260px)`, transformOrigin: '60% 50%'}}>
          <Predio />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 70,
          right: 70,
          fontFamily: FONTE.titulo,
          fontSize: 130,
          lineHeight: 0.9,
          color: COR.papel,
          textAlign: 'center',
          transform: `scale(${0.85 + gancho * 0.15})`,
          opacity: gancho,
        }}
      >
        38 WITNESSES<span style={{color: COR.vermelho}}>?</span>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 330,
          left: 80,
          right: 80,
          textAlign: 'center',
          fontFamily: FONTE.texto,
          fontSize: 66,
          lineHeight: 1.2,
          color: COR.papel,
          textShadow: '0 4px 18px rgba(0,0,0,0.9)',
        }}
      >
        {janela.map((p, i) => (
          <span key={i} style={{color: i === janela.length - 1 ? COR.vermelho : COR.papel}}>
            {p}{' '}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', fontFamily: FONTE.ficha, fontSize: 34, color: COR.grafite}}>
        FULL CASE ON THE CHANNEL
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: COR.vermelho}} />
      <div style={{position: 'absolute', top: 40, right: 40}}>
        <Icone tamanho={90} />
      </div>
      <Textura />
    </AbsoluteFill>
  );
};

// ---------- Registro ----------
export const CanalDarkComposicoes: React.FC = () => (
  <>
    <Composition id="tmb-logo-horizontal" component={LogoQuadro} width={2400} height={900} fps={1} durationInFrames={1} />
    <Composition id="tmb-logo-vertical" component={LogoVertical} width={1600} height={1600} fps={1} durationInFrames={1} />
    <Composition id="tmb-avatar" component={Avatar} width={800} height={800} fps={1} durationInFrames={1} />
    <Composition id="tmb-marca-dagua" component={MarcaDagua} width={150} height={150} fps={1} durationInFrames={1} />
    <Composition id="tmb-banner" component={Banner} width={2560} height={1440} fps={1} durationInFrames={1} />
    <Composition
      id="tmb-thumb-ep01-a"
      component={Thumb}
      width={1920}
      height={1080}
      fps={1}
      durationInFrames={1}
      defaultProps={{linha1: '38', linha2: 'WITNESSES', destaque: '?'} as ThumbProps}
    />
    <Composition
      id="tmb-thumb-ep01-b"
      component={Thumb}
      width={1920}
      height={1080}
      fps={1}
      durationInFrames={1}
      defaultProps={{linha1: 'NOBODY', linha2: 'HELPED', destaque: '?'} as ThumbProps}
    />
    <Composition id="tmb-thumb-ep01-final-a" component={Thumb} width={1920} height={1080} fps={1} durationInFrames={1}
      defaultProps={{linha1: '38', linha2: 'WITNESSES', destaque: '?', imagem: 'ep01/a1-fachada.jpg'} as ThumbProps} />
    <Composition id="tmb-thumb-ep01-final-b" component={Thumb} width={1920} height={1080} fps={1} durationInFrames={1}
      defaultProps={{linha1: 'NOBODY', linha2: 'HELPED', destaque: '?', imagem: 'ep01/a1-fachada.jpg'} as ThumbProps} />
    <Composition id="tmb-ep01" component={Episodio} width={1920} height={1080} fps={EP01.fps}
      durationInFrames={Math.round(EP01.duracao * EP01.fps)} defaultProps={EP01} />
    <Composition id="tmb-ep02" component={EpisodioV2} width={1920} height={1080} fps={EP02.fps}
      durationInFrames={Math.round(EP02.duracao * EP02.fps)} defaultProps={EP02} />
    <Composition id="tmb-abertura" component={Abertura} width={1920} height={1080} fps={30} durationInFrames={90} />
    <Composition id="tmb-demo-estilo" component={DemoEstilo} width={1920} height={1080} fps={30} durationInFrames={DUR_DEMO} />
    {(ep01Shorts as Omit<ShortProps, 'pasta'>[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-ep01-${sh.id}`} component={Short} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={{...sh, pasta: 'ep01'} as ShortProps} />
    ))}
    {/* Shorts originais do lote 0 (06/11/2026): tmb-lote00-O1 … O6 */}
    <ComposicoesLote00 />
    {/* Cortes do EP02 (07/11/2026): tmb-ep02-S1 … S4 */}
    <ComposicoesEP02Cortes />
    {/* EP03 BTK (07/11/2026) */}
    <ComposicoesEP03 />
    <ComposicoesEP03Cortes />
    {/* EP04 Mary Celeste (07/11/2026) */}
    <ComposicoesEP04 />
    <ComposicoesEP04Cortes />
    <ComposicoesEP05 />
    <ComposicoesEP05Cortes />
    <ComposicoesEP06 />
    <ComposicoesEP06Cortes />
    <ComposicoesEP07 />
    <ComposicoesEP07Cortes />
    <Composition id="tmb-short-modelo" component={ShortModelo} width={1080} height={1920} fps={30} durationInFrames={PALAVRAS_SHORT.length * 12 + 45} />
  </>
);
