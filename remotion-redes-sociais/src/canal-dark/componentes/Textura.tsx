import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Granulado de papel/filme + vinheta. Fica por cima de tudo, em todo quadro do canal.
export const Textura: React.FC<{forca?: number; vinheta?: number; animado?: boolean}> = ({
  forca = 0.13,
  vinheta = 0.65,
  animado = true,
}) => {
  const frame = useCurrentFrame();
  const seed = animado ? Math.floor(frame / 2) % 8 : 1;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: forca, mixBlendMode: 'overlay'}}>
        <filter id={`grao-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grao-${seed})`} />
      </svg>
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${vinheta}) 100%)`}}
      />
    </AbsoluteFill>
  );
};
