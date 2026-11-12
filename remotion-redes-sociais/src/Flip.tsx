import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Flip "CORTA ISSO AÍ" <-> "EU E ESSA CÂMERA…"
// Corte a cada 2 batidas da trilha (152 BPM): 8 trocas em ~6,3 s (4 compassos).
const BPM = 152;
const BEATS_PER_SLOT = 2;
const SLOT_COUNT = 8;
const TRANSITION_FRAMES = 4;

const IMAGES = ['flip/corta-isso-ai.png', 'flip/eu-e-essa-camera.png'];
const TRACK = 'trilhas/silent-film-light.mp3';

const imageStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const Flip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const slotLength = (60 / BPM) * BEATS_PER_SLOT * fps;
  const starts = React.useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= SLOT_COUNT; i++) {
      out.push(Math.min(durationInFrames, Math.round(i * slotLength)));
    }
    out[SLOT_COUNT] = durationInFrames;
    return out;
  }, [durationInFrames, slotLength]);

  let index = SLOT_COUNT - 1;
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (frame < starts[i + 1]) {
      index = i;
      break;
    }
  }

  const local = frame - starts[index];
  const slotDur = starts[index + 1] - starts[index];
  const dir = index === 0 ? 0 : index % 2 === 0 ? -1 : 1;

  // Entrada rápida (whip): desliza, desfoca e assenta em 6 quadros.
  const p = interpolate(local, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // Zoom lento dentro do slot e "soco" a cada corte.
  const drift = interpolate(local, [0, slotDur], [0, 1], {extrapolateRight: 'clamp'});

  const slide = dir * 150 * (1 - p);
  const scale = 1.07 - 0.055 * p + 0.012 * drift;
  const rotate = dir * 1.6 * (1 - p);
  const blur = (1 - p) * 8;

  const currentStyle: React.CSSProperties = {
    ...imageStyle,
    transform: `translateX(${slide}px) scale(${scale}) rotate(${rotate}deg)`,
    filter: `blur(${blur}px)`,
    opacity: 0.4 + 0.6 * p,
  };

  const previousStyle: React.CSSProperties = {
    ...imageStyle,
    transform: `translateX(${-dir * 150 * p}px) scale(${1 + 0.05 * p}) rotate(${-dir * 1.6 * p}deg)`,
    filter: `blur(${p * 8}px)`,
    opacity: 1 - p,
  };

  const flashing = local < 2;

  return (
    <AbsoluteFill style={{backgroundColor: '#111'}}>
      {/* fundo sem transformação: evita qualquer fresta preta no whip */}
      <Img src={staticFile(IMAGES[index % 2])} style={imageStyle} />

      {index > 0 && local < TRANSITION_FRAMES ? (
        <Img src={staticFile(IMAGES[(index + 1) % 2])} style={previousStyle} />
      ) : null}

      <Img src={staticFile(IMAGES[index % 2])} style={currentStyle} />

      <AbsoluteFill
        style={{
          backgroundColor: '#fff',
          opacity: flashing ? 0.12 * (1 - local / 2) : 0,
          pointerEvents: 'none',
        }}
      />

      <Audio src={staticFile(TRACK)} />
    </AbsoluteFill>
  );
};
