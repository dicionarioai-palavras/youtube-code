import React from 'react';
import {Composition} from 'remotion';
import cortes from './ep02-cortes.json';
import {ShortOriginal, ShortOriginalProps} from './ShortOriginal';

// Cortes do EP02 (Shorts S1–S4, 07/11/2026): composições tmb-ep02-S1 … S4, mesmo componente dos Shorts originais (ShortOriginal).
// Dados: ep02-cortes.json (gerado por code/canal-the-mind-behind/montagem/cortes_ep02_montar.py). Render: scripts/render-tmb-ep02-cortes.mjs
export const ComposicoesEP02Cortes: React.FC = () => (
  <>
    {(cortes as unknown as ShortOriginalProps[]).map((sh) => (
      <Composition key={sh.id} id={`tmb-ep02-${sh.id}`} component={ShortOriginal} width={1080} height={1920} fps={30}
        durationInFrames={Math.round(sh.dur * 30)} defaultProps={sh} />
    ))}
  </>
);
