import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {useFontes} from '../componentes/Fontes';
import {Gancho} from '../componentes/Gancho';
import {Legenda} from '../componentes/Legenda';
import {ESTILOS, Estilo} from '../estilo';
import {CartelaFinal} from '../componentes/Marca';
import {porLetraGancho} from '../componentes/Gancho';
import {Carimbo, Etimologia, Granulado, Progresso, Sticker, useTremida} from './Efeitos';
import {ClipM, MontagemProps} from './tipos';

const W = 1080, H = 1920;

// zoom de ênfase: soma dos "socos" de zoom ativos no tempo t
const zoomEm = (t: number, p: MontagemProps, fps: number) => {
  let z = 1;
  for (const m of p.momentos) if (m.tipo === 'zoom') {
    const d = t - m.t;
    if (d < 0 || d > 1.2) continue;
    const ent = spring({frame: Math.round(d * fps), fps, config: {damping: 12, stiffness: 200}});
    const sai = interpolate(d, [0.6, 1.2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    z += (m.forca - 1) * ent * sai;
  }
  return z;
};

const Onda: React.FC<{src: string; cor: string}> = ({src, cor}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const audio = useAudioData(staticFile(src));
  if (!audio) return null;
  const v = visualizeAudio({fps, frame: f, audioData: audio, numberOfSamples: 32});
  return (
    <div style={{position: 'absolute', bottom: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, height: 120}}>
      {v.map((x, i) => <div key={i} style={{width: 14, height: 10 + Math.min(1, x * 6) * 110, background: cor, borderRadius: 7, opacity: 0.85}} />)}
    </div>
  );
};

// Transição zoom + desfoque: o bloco que sai acelera para dentro e borra; o que entra chega borrado e assenta
const Transicionar: React.FC<{c: ClipM; children: React.ReactNode}> = ({c, children}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const n = Math.round(c.dur * fps); const T = 9;
  let k = 0;
  if (c.entra && f < T) k = 1 - f / T;
  if (c.sai && f > n - T) k = Math.max(k, (f - (n - T)) / T);
  const e = Easing.in(Easing.quad)(k);
  return <AbsoluteFill style={{transform: `scale(${1 + 0.35 * e})`, filter: e > 0.01 ? `blur(${22 * e}px) brightness(${1 + 0.5 * e})` : undefined}}>{children}</AbsoluteFill>;
};

const ClipView: React.FC<{c: ClipM; p: MontagemProps; estilo: Estilo}> = (props) => <Transicionar c={props.c}><ClipInterno {...props} /></Transicionar>;

const ClipInterno: React.FC<{c: ClipM; p: MontagemProps; estilo: Estilo}> = ({c, p, estilo}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const t = c.inicio + f / fps;
  const z = zoomEm(t, p, fps);
  const [fx, fy] = c.foco ?? [0.5, 0.5];
  const tremida = useTremida(c.tremida);
  const semVoz = p.mix === 'sem-voz' || p.mix === 'efeitos';
  const volume = (lf: number) => { if (semVoz) return 0; const tt = c.inicio + lf / fps; return p.mutes.some((m) => tt >= m.t0 - 0.03 && tt <= m.t1 + 0.03) ? 0 : 1; };
  if (c.tipo === 'still') {
    return (
      <AbsoluteFill style={{transform: tremida}}>
        <Img src={staticFile(c.src)} style={{width: W, height: H, objectFit: 'cover', filter: 'saturate(0.6) contrast(1.15)', transform: `scale(${interpolate(f, [0, c.dur * fps], [1.08, 1.18])})`}} />
        {c.carimbo ? <Carimbo texto={c.carimbo} estilo={estilo} /> : null}
      </AbsoluteFill>
    );
  }
  if (c.layout === 'tela') {
    let reg = c.regiao ?? [0, 0, 1, 1];
    if (c.regiaoAnim) {
      const {de, para, segura, anima} = c.regiaoAnim;
      const k = interpolate(f / fps, [segura, segura + anima], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
      reg = de.map((v, i) => v + (para[i] - v) * k) as [number, number, number, number];
    }
    // trecho mencionado na fala e visível na tela (OCR): aproxima e desfoca o resto
    const spot = p.momentos.find((m) => m.tipo === 'spot' && t >= m.t && t < m.t + m.dur) as Extract<MontagemProps['momentos'][number], {tipo: 'spot'}> | undefined;
    let ks = 0;
    if (spot) {
      const d = t - spot.t;
      ks = Easing.inOut(Easing.cubic)(Math.min(1, d / 0.35, (spot.dur - d) / 0.35));
      const asp = (reg[2] * 1280) / (reg[3] * 720);
      const [bx, by, bw, bh] = spot.box;
      const w2 = Math.min(reg[2], Math.max(bw / 0.88, 0.2)), h2 = (w2 * 1280) / (asp * 720);
      const alvo = [bx + bw / 2 - w2 / 2, by + bh / 2 - h2 / 2, w2, h2];
      reg = reg.map((v, i) => v + (alvo[i] - v) * ks) as [number, number, number, number];
    }
    const [x, y, w, h] = reg;
    const lw = 1040, esc = (lw / (w * 1280)) * z, ah = h * 720 * (lw / (w * 1280));
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <OffthreadVideo src={staticFile(c.src)} muted style={{width: W, height: H, objectFit: 'cover', filter: 'blur(30px) brightness(0.4)', transform: 'scale(1.2)'}} />
        <div style={{position: 'absolute', left: (W - lw) / 2, top: (H - ah) / 2 - 140, width: lw, height: ah, overflow: 'hidden', borderRadius: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: `3px solid ${estilo.acento}`}}>
          <OffthreadVideo src={staticFile(c.src)} volume={volume} style={{position: 'absolute', maxWidth: 'none', width: 1280 * esc, height: 720 * esc,
            left: -(x + w / 2) * 1280 * esc + lw / 2, top: -(y + h / 2) * 720 * esc + ah / 2,
            filter: ks > 0.01 ? `blur(${7 * ks}px) brightness(${1 - 0.45 * ks})` : undefined}} />
          {spot && ks > 0.01 ? (() => {
            const ox = -(x + w / 2) * 1280 * esc + lw / 2, oy = -(y + h / 2) * 720 * esc + ah / 2;
            const [bx, by, bw, bh] = spot.box;
            const L = ox + bx * 1280 * esc, T = oy + by * 720 * esc, Wb = bw * 1280 * esc, Hb = bh * 720 * esc;
            return (
              <>
                <OffthreadVideo src={staticFile(c.src)} muted style={{position: 'absolute', maxWidth: 'none', width: 1280 * esc, height: 720 * esc, left: ox, top: oy,
                  clipPath: `inset(${T - oy}px ${1280 * esc - (L - ox) - Wb}px ${720 * esc - (T - oy) - Hb}px ${L - ox}px round 12px)`}} />
                <div style={{position: 'absolute', left: L - 6, top: T - 6, width: Wb + 12, height: Hb + 12, borderRadius: 16, border: `4px solid ${estilo.destaque}`,
                  boxShadow: `0 0 40px ${estilo.destaque}`, opacity: ks}} />
              </>
            );
          })() : null}
        </div>
        {c.onda ? <Onda src={c.onda} cor={estilo.acento} /> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(c.src)} volume={volume} style={{width: W, height: H, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}} />
    </AbsoluteFill>
  );
};

// palavrão na legenda: '****' + a pontuação original
const censura = (s: string) => '****' + (s.match(/[.,!?…]+$/u)?.[0] ?? '');

export const Montagem: React.FC<MontagemProps> = (p) => {
  useFontes();
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const estilo = ESTILOS[p.marca] ?? ESTILOS.luiz;
  const fimClips = p.clips.reduce((a, c) => Math.max(a, c.inicio + c.dur), 0);
  const fr = (s: number) => Math.round(s * fps);
  const palavras = p.palavras.map((w) => (w.censura ? {...w, texto: censura(w.texto)} : w));
  const volumeTrilha = (lf: number) => {
    const t = lf / fps; const fala = p.palavras.some((w) => t >= w.t0 - 0.15 && t <= w.t1 + 0.25);
    return (p.trilha?.volume ?? 0.2) * (fala ? 0.22 : 1) * Math.min(1, (durationInFrames - lf) / (fps * 0.8));
  };
  const porLetra = porLetraGancho(p.gancho.texto, p.gancho.ate);
  const mix = p.mix ?? 'completo';
  const tCta = fimClips;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {p.clips.map((c, i) => (
        <Sequence key={i} from={fr(c.inicio)} durationInFrames={fr(c.dur)}><ClipView c={c} p={p} estilo={estilo} /></Sequence>
      ))}
      {p.trilha && (mix === 'completo' || mix === 'sem-voz') ? <Audio src={staticFile(p.trilha.src)} volume={volumeTrilha} startFrom={fr(p.trilha.inicio ?? 0)} /> : null}
      {mix !== 'voz' && p.sfx.map((s, i) => <Sequence key={i} from={Math.max(0, fr(s.t))}><Audio src={staticFile(s.src)} volume={s.vol} /></Sequence>)}
      {mix !== 'voz' && p.gancho.tick ? Array.from(p.gancho.texto).map((ch, i) => (ch.trim() ? <Sequence key={i} from={fr(i * porLetra)} durationInFrames={3}><Audio src={staticFile(p.gancho.tick!)} volume={0.35} /></Sequence> : null)) : null}
      <Sequence durationInFrames={fr(tCta)}><Legenda palavras={palavras} estilo={estilo} base={540} /></Sequence>
      {p.momentos.map((m, i) => {
        if (m.tipo === 'sticker') return <Sequence key={i} from={fr(m.t)} durationInFrames={fr(m.dur)}><Sticker texto={m.texto} estilo={estilo} dur={m.dur} /></Sequence>;
        
        if (m.tipo === 'etimologia') return <Sequence key={i} from={fr(m.t)} durationInFrames={fr(m.dur)}><Etimologia {...m} estilo={estilo} /></Sequence>;
        return null;
      })}
      <Gancho texto={p.gancho.texto} ate={p.gancho.ate} estilo={estilo} />
      {/* fim por marca: Palavras = UMA cartela com o logo até o último quadro; luiz = sem cartela (a composição acaba no fim dos clipes) */}
      {p.cta && durationInFrames > fr(tCta) ? (
        <Sequence from={fr(tCta)}>
          <CartelaFinal estilo={estilo} linha={p.cta.texto} engajamento={p.cta.engajamento} />
        </Sequence>
      ) : null}
      <Progresso cor={estilo.acento} />
      <Granulado />
    </AbsoluteFill>
  );
};
