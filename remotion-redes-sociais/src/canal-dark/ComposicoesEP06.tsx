// EP06 — Gary Ridgway (08/11/2026): composição tmb-ep06 (montagem v2, componente EpisodioV2). Timeline: ep06-timeline.json
// (gerada por canais/the-mind-behind/episodios/ep06-norrmalmstorg-stockholm/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep06.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep06 from './ep06-timeline.json';
const EP06 = ep06 as unknown as TimelineV2;
export const ComposicoesEP06: React.FC = () => (
  <Composition id="tmb-ep06" component={EpisodioV2} width={1920} height={1080} fps={EP06.fps}
    durationInFrames={Math.round(EP06.duracao * EP06.fps)} defaultProps={EP06} />
);
