// EP05 — Norrmalmstorg (07/11/2026): composição tmb-ep05 (montagem v2, componente EpisodioV2). Timeline: ep05-timeline.json
// (gerada por canal-the-mind-behind/episodios/ep05-norrmalmstorg-stockholm/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep05.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep05 from './ep05-timeline.json';
const EP05 = ep05 as unknown as TimelineV2;
export const ComposicoesEP05: React.FC = () => (
  <Composition id="tmb-ep05" component={EpisodioV2} width={1920} height={1080} fps={EP05.fps}
    durationInFrames={Math.round(EP05.duracao * EP05.fps)} defaultProps={EP05} />
);
