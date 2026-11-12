import React from 'react';
import {Composition} from 'remotion';
import cortes from './ep04-cortes.json';
import {ShortOriginal, ShortOriginalProps} from './ShortOriginal';

// Cortes do EP04 (Shorts S1–S4, 07/11/2026): composições tmb-ep04-S1 … S4, mesmo componente dos Shorts originais (ShortOriginal).
// Dados: ep04-cortes.json (gerado por code/canal-the-mind-behind/montagem/cortes_ep04.py). Render: scripts/render-tmb-ep04-cortes.mjs
export const ComposicoesEP04Cortes: React.FC = () => (
  <>
    {(cortes as unknown as ShortOriginalProps[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-ep04-${sh.id}`} component={ShortOriginal} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={sh} />
    ))}
  </>
);
