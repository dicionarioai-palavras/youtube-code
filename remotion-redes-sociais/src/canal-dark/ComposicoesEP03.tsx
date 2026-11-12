// EP03 — BTK (07/11/2026): composição tmb-ep03 (montagem v2, componente EpisodioV2). Timeline: ep03-timeline.json
// (gerada por canal-the-mind-behind/episodios/ep03-btk-dennis-rader/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep03.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep03 from './ep03-timeline.json';
const EP03 = ep03 as unknown as TimelineV2;
export const ComposicoesEP03: React.FC = () => (
  <Composition id="tmb-ep03" component={EpisodioV2} width={1920} height={1080} fps={EP03.fps}
    durationInFrames={Math.round(EP03.duracao * EP03.fps)} defaultProps={EP03} />
);
