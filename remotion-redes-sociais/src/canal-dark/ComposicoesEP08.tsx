// EP08 — Central Park Five (08/11/2026): composição tmb-ep08 (montagem v2, componente EpisodioV2). Timeline: ep08-timeline.json
// (gerada por canal-the-mind-behind/episodios/ep08-norrmalmstorg-stockholm/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep08.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep08 from './ep08-timeline.json';
const EP08 = ep08 as unknown as TimelineV2;
export const ComposicoesEP08: React.FC = () => (
  <Composition id="tmb-ep08" component={EpisodioV2} width={1920} height={1080} fps={EP08.fps}
    durationInFrames={Math.round(EP08.duracao * EP08.fps)} defaultProps={EP08} />
);
