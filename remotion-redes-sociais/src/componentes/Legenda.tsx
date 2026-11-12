import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Estilo, FONTE_LEGENDA} from '../estilo';
import {Palavra} from '../tipos';

// Contorno sólido via várias sombras (funciona em qualquer navegador/renderizador)
const contorno = (cor: string, r: number) => {
  const s: string[] = [];
  for (let a = 0; a < 360; a += 30) s.push(`${(Math.cos((a * Math.PI) / 180) * r).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * r).toFixed(1)}px 0 ${cor}`);
  return [...s, '0 8px 22px rgba(0,0,0,0.45)'].join(', ');
};

// Agrupa as palavras em blocos curtos (até 3), quebrando em pausas e pontuação final.
const blocos = (ps: Palavra[]) => {
  const out: Palavra[][] = [];
  let atual: Palavra[] = [];
  for (const p of ps) {
    const ult = atual[atual.length - 1];
    if (ult && (atual.length >= 3 || p.t0 - ult.t1 > 0.6 || /[.!?…]$/.test(ult.texto))) {
      out.push(atual);
      atual = [];
    }
    atual.push(p);
  }
  if (atual.length) out.push(atual);
  return out;
};

export const Legenda: React.FC<{palavras: Palavra[]; estilo: Estilo; base?: number}> = ({palavras, estilo, base = 560}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const grupos = useMemo(() => blocos(palavras), [palavras]);
  const g = grupos.find((b, i) => t >= b[0].t0 && t < (grupos[i + 1]?.[0].t0 ?? b[b.length - 1].t1 + 0.4) && t <= b[b.length - 1].t1 + 0.4);
  if (!g) return null;
  const entrada = spring({frame: frame - Math.round(g[0].t0 * fps), fps, config: {damping: 14, stiffness: 180}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: base, paddingRight: 70}}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', maxWidth: 858,
          transform: `scale(${interpolate(entrada, [0, 1], [0.85, 1])})`, opacity: entrada,
        }}
      >
        {g.map((p, i) => {
          const ativa = t >= p.t0 && t < (g[i + 1]?.t0 ?? p.t1 + 0.4);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONTE_LEGENDA, fontWeight: 800, fontSize: 82, lineHeight: 1.04, letterSpacing: 1, textTransform: 'uppercase',
                color: ativa ? estilo.destaque : estilo.texto,
                textShadow: contorno(estilo.contorno, 6),
                transform: ativa ? 'scale(1.06)' : 'scale(1)', display: 'inline-block',
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
