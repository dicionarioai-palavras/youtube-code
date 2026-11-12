import React from 'react';
import {COR, FONTE} from '../tema';

// Ícone: perfil de cabeça (papel) com a impressão digital no lugar da mente (vermelho).
// "progresso" (0..1) desenha as linhas da digital — usado na abertura animada.
export const CABECA =
  'M64 196 L64 160 C44 148 34 124 36 96 C39 56 70 26 110 26 C150 26 176 54 178 90 L178 98 L194 124 C196 128 194 131 190 132 L180 134 L180 148 C180 160 172 166 160 165 L146 164 L146 196 Z';

const ANEIS = Array.from({length: 11}, (_, i) => i);

export const Icone: React.FC<{tamanho?: number; progresso?: number; corCabeca?: string; corDigital?: string}> = ({
  tamanho = 400,
  progresso = 1,
  corCabeca = COR.papel,
  corDigital = COR.vermelho,
}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 230 230">
    <defs>
      <clipPath id="tmb-cabeca">
        <path d={CABECA} />
      </clipPath>
    </defs>
    <path d={CABECA} fill={corCabeca} />
    <g clipPath="url(#tmb-cabeca)">
      <g transform="rotate(-12 106 92)">
      {ANEIS.map((i) => {
        const rx = 9 + i * 7.2;
        const ry = 7 + i * 6.1;
        const perim = Math.PI * (rx + ry);
        const p = Math.min(1, Math.max(0, progresso * 1.6 - i * 0.06));
        // falhas irregulares nas linhas, como numa digital real
        const falha = 6 + ((i * 37) % 23);
        return (
          <ellipse
            key={i}
            cx={106}
            cy={92}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={corDigital}
            strokeWidth={3.6}
            strokeLinecap="round"
            strokeDasharray={`${perim * p - falha} ${falha + perim * (1 - p)}`}
            strokeDashoffset={(i * 29) % perim}
          />
        );
      })}
      </g>
    </g>
  </svg>
);

export const Wordmark: React.FC<{altura?: number; cor?: string; destaque?: string; tagline?: boolean}> = ({
  altura = 160,
  cor = COR.papel,
  destaque = COR.vermelho,
  tagline = false,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
    <div style={{fontFamily: FONTE.titulo, fontSize: altura, lineHeight: 0.86, letterSpacing: altura * 0.02, color: cor}}>
      THE MIND <span style={{color: destaque}}>BEHIND</span>
    </div>
    {tagline && (
      <div
        style={{
          fontFamily: FONTE.ficha,
          fontSize: altura * 0.17,
          color: COR.grafite,
          letterSpacing: altura * 0.012,
          marginTop: altura * 0.12,
          textTransform: 'uppercase',
        }}
      >
        Real cases. The human mind behind them.
      </div>
    )}
  </div>
);

export const LogoHorizontal: React.FC<{altura?: number; tagline?: boolean}> = ({altura = 160, tagline}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: altura * 0.25}}>
    <Icone tamanho={altura * 1.55} />
    <Wordmark altura={altura} tagline={tagline} />
  </div>
);
