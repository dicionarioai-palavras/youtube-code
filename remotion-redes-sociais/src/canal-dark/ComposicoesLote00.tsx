import React from 'react';
import {Composition} from 'remotion';
import lote00 from './lote00-shorts.json';
import {ShortOriginal, ShortOriginalProps} from './ShortOriginal';

// Shorts originais do lote 0 (06/11/2026): composições tmb-lote00-O1 … O6. Render: scripts/render-tmb-shorts-originais.mjs
export const ComposicoesLote00: React.FC = () => (
  <>
    {(lote00 as unknown as ShortOriginalProps[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-lote00-${sh.id}`} component={ShortOriginal} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={sh} />
    ))}
  </>
);
