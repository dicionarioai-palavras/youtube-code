// EP07 — Dancing plague (08/11/2026): composição tmb-ep07 (montagem v2, componente EpisodioV2). Timeline: ep07-timeline.json
// (gerada por canal-the-mind-behind/episodios/ep07-norrmalmstorg-stockholm/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep07.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep07 from './ep07-timeline.json';
const EP07 = ep07 as unknown as TimelineV2;
export const ComposicoesEP07: React.FC = () => (
  <Composition id="tmb-ep07" component={EpisodioV2} width={1920} height={1080} fps={EP07.fps}
    durationInFrames={Math.round(EP07.duracao * EP07.fps)} defaultProps={EP07} />
);
