import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {COR, FONTE} from './tema';
// 07/11/2026: legenda e barra de progresso sem vermelho (palavra da vez em papel cheio, as outras a 55%; barra em papel a 45%).
// Vermelho fica só na pista (gancho, cartões, ponto do CTA), pela regra do guia de identidade.
import {Camera, enquadramentos, Mov} from './componentes/Movimento';
import {Textura} from './componentes/Textura';
import {Icone} from './componentes/Logo';

// Short original vertical (1080x1920) — lote 0 (06/11/2026), direção visual v2.
// Imagem 9:16 em tela cheia com "zoom que revela" (Camera/enquadramentos de componentes/Movimento.tsx),
// gancho no topo desde o quadro 0, cartões da coluna "Tela" do ROTEIROS.md, legenda palavra a palavra,
// CTA no fim e barra de progresso. Mesma identidade dos cortes do EP01 (Short.tsx).
// Área segura: todo texto entre y=230 e y=1440 e fora dos 230 px da direita (botões do YouTube).

export type PalavraO = {w: string; s: number; e: number};
export type CenaO = {src: string; ini: number; fim: number; mov: Mov; foco: {x: number; y: number}; escala: [number, number]; destino?: {x: number; y: number}; corte?: boolean; vinheta?: number};
export type CartaoO = {ini: number; fim: number; linhas: {t: string; cor?: 'papel' | 'vermelho' | 'ambar'}[]};
export type ShortOriginalProps = {id: string; gancho: string; destaque?: string; dur: number; pasta: string; cenas: CenaO[]; cartoes: CartaoO[]; palavras: PalavraO[]; cta: [string, string]};

const SEG = {topo: 230, base: 1440, esq: 60, dir: 1080 - 230};
const LARG = SEG.dir - SEG.esq;
const FUSAO = 6; // frames de fusão quando a troca não é corte seco
const corDe = (c?: string) => (c === 'vermelho' ? COR.vermelho : c === 'ambar' ? COR.ambar : COR.papel);

const blocos = (ps: PalavraO[]) => {
  const out: PalavraO[][] = [];
  let cur: PalavraO[] = [];
  ps.forEach((p) => {
    cur.push(p);
    if (cur.length >= 3 || /[.,?!;:]$/.test(p.w)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
};

const Gancho: React.FC<{texto: string; destaque?: string}> = ({texto, destaque}) => {
  const f = useCurrentFrame();
  // legível desde o quadro 0: só um leve assentamento de escala
  const s = interpolate(f, [0, 14], [1.04, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const partes = texto.split(/(\?|")/);
  return (
    <div style={{position: 'absolute', top: SEG.topo + 20, left: SEG.esq, width: LARG, textAlign: 'center', fontFamily: FONTE.titulo, fontSize: 124, lineHeight: 0.93, color: COR.papel, transform: `scale(${s})`, transformOrigin: '50% 0%', textShadow: '0 6px 30px rgba(0,0,0,0.85)'}}>
      {partes.map((p, i) => {
        if (p === '?') return <span key={i} style={{color: COR.vermelho}}>?</span>;
        if (destaque && p.includes(destaque)) {
          const [a, b] = p.split(destaque);
          return <span key={i}>{a}<span style={{color: COR.vermelho}}>{destaque}</span>{b}</span>;
        }
        return <span key={i}>{p}</span>;
      })}
    </div>
  );
};

// Cartão "revelado": máscara que abre da esquerda e escala 1,1 → 1,0
const Cartao: React.FC<{c: CartaoO; dur: number; prev?: string[]; segue?: boolean}> = ({c, dur, prev = [], segue = false}) => {
  const f = useCurrentFrame();
  const abre = interpolate(f, [0, 9], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  // se o próximo cartão continua este (mesma primeira linha), não some: o próximo assume sem piscar
  const sai = segue ? 1 : interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const novo = (t: string) => !prev.includes(t);
  const s = 1.1 - 0.1 * abre;
  const grande = c.linhas.length === 1 && c.linhas[0].t.length <= 10;
  return (
    <div style={{position: 'absolute', top: 560, left: SEG.esq, width: LARG, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{transform: `scale(${prev.length ? 1 : s})`, transformOrigin: '50% 50%', textAlign: 'center', padding: '18px 34px 10px', background: 'rgba(15,14,13,0.62)', borderTop: `3px solid ${COR.papel}`}}>
        {c.linhas.map((l, i) => (
          <div key={i} style={{fontFamily: FONTE.titulo, fontSize: grande ? 150 : 96, lineHeight: 0.98, color: corDe(l.cor), letterSpacing: 1, clipPath: novo(l.t) ? `inset(0 ${100 - abre * 100}% 0 0)` : undefined, transform: novo(l.t) && prev.length ? `scale(${s})` : undefined}}>{l.t}</div>
        ))}
      </div>
    </div>
  );
};

const Imagem: React.FC<{c: CenaO; dur: number; pasta: string; fundir: boolean}> = ({c, dur, pasta, fundir}) => {
  const f = useCurrentFrame();
  const [de, para] = enquadramentos(c.mov, c.foco, c.escala, c.destino);
  const o = fundir ? interpolate(f, [0, FUSAO], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Camera src={staticFile(`${pasta}/${c.src}.jpg`)} de={de} para={para} dur={dur} respiro={0.15} vinhetaFoco={c.vinheta ?? 0} />
    </AbsoluteFill>
  );
};

export const ShortOriginal: React.FC<ShortOriginalProps> = ({gancho, destaque, cenas, cartoes, palavras, pasta, cta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const bs = blocos(palavras);
  const atualB = bs.findIndex((b, i) => t >= b[0].s - 0.05 && (i === bs.length - 1 || t < bs[i + 1][0].s - 0.05));
  const fimFala = palavras[palavras.length - 1].e + 0.3;
  const ctaT = interpolate(t, [fimFala, fimFala + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: COR.tinta}}>
      {cenas.map((c, i) => {
        const from = Math.round(c.ini * fps);
        const fundir = i > 0 && !c.corte;
        const dur = Math.max(1, Math.round((c.fim - c.ini) * fps)) + (i < cenas.length - 1 && !cenas[i + 1].corte ? FUSAO : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Imagem c={c} dur={dur} pasta={pasta} fundir={fundir} />
          </Sequence>
        );
      })}
      {/* sombra para o texto: topo (gancho/cartões) e base (legenda) */}
      <AbsoluteFill style={{background: 'linear-gradient(rgba(15,14,13,0.88) 0%, rgba(15,14,13,0.55) 22%, rgba(15,14,13,0) 36%, rgba(15,14,13,0) 56%, rgba(15,14,13,0.7) 68%, rgba(15,14,13,0.9) 80%, rgba(15,14,13,0.95) 100%)'}} />
      <Textura forca={0.1} vinheta={0.4} />
      <Gancho texto={gancho} destaque={destaque} />
      {cartoes.map((c, i) => {
        const from = Math.round(c.ini * fps);
        const dur = Math.max(8, Math.round((c.fim - c.ini) * fps));
        const ant = i > 0 && Math.abs(cartoes[i - 1].fim - c.ini) < 0.1 ? cartoes[i - 1].linhas.map((l) => l.t) : [];
        const prox = cartoes[i + 1];
        const segue = !!prox && Math.abs(prox.ini - c.fim) < 0.1 && prox.linhas[0]?.t === c.linhas[0]?.t;
        return (
          <Sequence key={'c' + i} from={from} durationInFrames={dur}>
            <Cartao c={c} dur={dur} prev={ant} segue={segue} />
          </Sequence>
        );
      })}
      {atualB >= 0 && ctaT < 1 && (
        <div style={{position: 'absolute', top: 1190, left: SEG.esq, width: LARG, textAlign: 'center', opacity: 1 - ctaT}}>
          <div style={{display: 'inline-block', padding: '8px 22px 12px', borderRadius: 8, background: 'rgba(15,14,13,0.78)', fontFamily: FONTE.texto, fontWeight: 700, fontSize: 70, lineHeight: 1.15, color: COR.papel, textShadow: '0 4px 18px rgba(0,0,0,0.95)'}}>
          {bs[atualB].map((p, i, arr) => {
            const prox = i < arr.length - 1 ? arr[i + 1].s : p.e + 0.4;
            return <span key={i} style={{color: COR.papel, opacity: t >= p.s - 0.05 && t < prox - 0.05 ? 1 : 0.55}}>{i ? ' ' : ''}{p.w}</span>;
          })}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', top: 1170, left: SEG.esq, width: LARG, textAlign: 'center', opacity: ctaT, transform: `translateY(${(1 - ctaT) * 30}px)`}}>
        <div style={{fontFamily: FONTE.titulo, fontSize: 104, color: COR.papel, letterSpacing: 2}}>
          {cta[0].replace(/\.$/, '')}<span style={{color: COR.vermelho}}>.</span>
        </div>
        <div style={{fontFamily: FONTE.ficha, fontSize: 40, color: COR.ambar, marginTop: 6, letterSpacing: 3}}>{cta[1]}</div>
      </div>
      <div style={{position: 'absolute', top: 1385, left: SEG.esq, width: LARG, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
        <Icone tamanho={44} />
        <div style={{fontFamily: FONTE.ficha, fontSize: 30, color: COR.grafite, letterSpacing: 3}}>THE MIND BEHIND</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: COR.papel, opacity: 0.45}} />
    </AbsoluteFill>
  );
};
