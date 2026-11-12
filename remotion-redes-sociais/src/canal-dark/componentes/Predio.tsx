import React from 'react';
import {COR} from '../tema';

// Ilustração-base do episódio 1 e referência de estilo para o Runway:
// fachada à noite, janelas acesas com silhuetas, uma figura vermelha sozinha na rua.
// Vetorial e estilizada: nenhuma pessoa real é retratada.
const h = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const Silhueta: React.FC<{x: number; y: number; esc: number; cor: string}> = ({x, y, esc, cor}) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <ellipse cx={0} cy={-34} rx={11} ry={13} fill={cor} />
    <path d="M-24 0 C-24 -16 -14 -22 0 -22 C14 -22 24 -16 24 0 Z" fill={cor} />
  </g>
);

export const Predio: React.FC<{
  largura?: number;
  altura?: number;
  colunas?: number;
  linhas?: number;
  acesas?: number; // quantas janelas acesas com silhueta
  figura?: boolean;
  deslocX?: number;
}> = ({largura = 1920, altura = 1080, colunas = 9, linhas = 6, acesas = 38, figura = true, deslocX = 0}) => {
  const x0 = largura * 0.36 + deslocX;
  const larg = largura * 0.62;
  const y0 = altura * 0.08;
  const alt = altura * 0.66;
  const cw = larg / colunas;
  const ch = alt / linhas;
  const total = colunas * linhas;
  // escolhe as janelas acesas de forma determinística
  const ordem = Array.from({length: total}, (_, i) => i).sort((a, b) => h(a + 3) - h(b + 3));
  const acesasSet = new Set(ordem.slice(0, Math.min(acesas, total)));
  const ruaY = y0 + alt;
  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
      <defs>
        <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B0B0D" />
          <stop offset="1" stopColor="#1B1A1C" />
        </linearGradient>
        <radialGradient id="poste" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor={COR.ambar} stopOpacity={0.7} />
          <stop offset="1" stopColor={COR.ambar} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={largura} height={altura} fill="url(#ceu)" />
      {/* fachada */}
      <rect x={x0 - 24} y={y0 - 30} width={larg + 48} height={alt + 30} fill="#151413" />
      <rect x={x0 - 24} y={y0 - 30} width={larg + 48} height={10} fill="#22201E" />
      {Array.from({length: total}, (_, i) => {
        const c = i % colunas;
        const l = Math.floor(i / colunas);
        const wx = x0 + c * cw + cw * 0.18;
        const wy = y0 + l * ch + ch * 0.16;
        const ww = cw * 0.64;
        const wh = ch * 0.62;
        const acesa = acesasSet.has(i);
        return (
          <g key={i}>
            <rect x={wx} y={wy} width={ww} height={wh} fill={acesa ? COR.ambar : '#0C0B0B'} opacity={acesa ? 0.62 + h(i) * 0.3 : 1} />
            {acesa && (
              <>
                <Silhueta x={wx + ww * (0.35 + h(i + 9) * 0.3)} y={wy + wh} esc={(wh / 70) * (0.9 + h(i + 1) * 0.2)} cor="#0E0D0C" />
                <rect x={wx} y={wy} width={ww} height={wh} fill="none" stroke="#2A2622" strokeWidth={4} />
              </>
            )}
            <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#151413" strokeWidth={3} opacity={acesa ? 0.5 : 0} />
          </g>
        );
      })}
      {/* calçada e rua */}
      <rect x={0} y={ruaY} width={largura} height={altura - ruaY} fill="#121110" />
      <rect x={0} y={ruaY} width={largura} height={6} fill="#26231F" />
      {figura && (
        <g>
          <ellipse cx={largura * 0.24} cy={ruaY + 10} rx={300} ry={150} fill="url(#poste)" />
          <rect x={largura * 0.24 - 4} y={ruaY - 330} width={8} height={340} fill="#26231F" />
          <rect x={largura * 0.24 - 30} y={ruaY - 338} width={60} height={12} rx={4} fill="#26231F" />
          <g transform={`translate(${largura * 0.24 + 70} ${ruaY + 4}) scale(2.3)`}>
            <ellipse cx={0} cy={-62} rx={10} ry={12} fill={COR.vermelho} />
            <path d="M-17 -46 C-17 -50 -12 -52 0 -52 C12 -52 17 -50 17 -46 L20 -12 L13 -12 L11 0 L3 0 L1 -14 L-1 -14 L-3 0 L-11 0 L-13 -12 L-20 -12 Z" fill={COR.vermelho} />
          </g>
        </g>
      )}
    </svg>
  );
};
