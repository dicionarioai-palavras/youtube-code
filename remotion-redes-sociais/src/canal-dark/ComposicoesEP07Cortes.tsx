import React from 'react';
import {Composition} from 'remotion';
import cortes from './ep07-cortes.json';
import {ShortOriginal, ShortOriginalProps} from './ShortOriginal';

// Cortes do EP07 (Shorts S1–S4, 08/11/2026): composições tmb-ep07-S1 … S4, mesmo componente dos Shorts originais (ShortOriginal).
// Dados: ep07-cortes.json (gerado por code/canal-the-mind-behind/montagem/cortes_ep07.py). Render: scripts/render-tmb-ep07-cortes.mjs
export const ComposicoesEP07Cortes: React.FC = () => (
  <>
    {(cortes as unknown as ShortOriginalProps[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-ep07-${sh.id}`} component={ShortOriginal} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={sh} />
    ))}
  </>
);
