import React from 'react';
import {Composition} from 'remotion';
import cortes from './ep08-cortes.json';
import {ShortOriginal, ShortOriginalProps} from './ShortOriginal';

// Cortes do EP08 (Shorts S1–S4, 08/11/2026): composições tmb-ep08-S1 … S4, mesmo componente dos Shorts originais (ShortOriginal).
// Dados: ep08-cortes.json (gerado por code/canal-the-mind-behind/montagem/cortes_ep08.py). Render: scripts/render-tmb-ep08-cortes.mjs
export const ComposicoesEP08Cortes: React.FC = () => (
  <>
    {(cortes as unknown as ShortOriginalProps[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-ep08-${sh.id}`} component={ShortOriginal} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={sh} />
    ))}
  </>
);
