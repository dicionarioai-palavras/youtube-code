// EP04 — Mary Celeste (07/11/2026): composição tmb-ep04 (montagem v2, componente EpisodioV2). Timeline: ep04-timeline.json
// (gerada por canal-the-mind-behind/episodios/ep04-btk-dennis-rader/montagem/plano.json + plano_v2.py). Render: scripts/render-tmb-ep04.mjs
import React from 'react';
import {Composition} from 'remotion';
import {EpisodioV2, TimelineV2} from './EpisodioV2';
import ep04 from './ep04-timeline.json';
const EP04 = ep04 as unknown as TimelineV2;
export const ComposicoesEP04: React.FC = () => (
  <Composition id="tmb-ep04" component={EpisodioV2} width={1920} height={1080} fps={EP04.fps}
    durationInFrames={Math.round(EP04.duracao * EP04.fps)} defaultProps={EP04} />
);
