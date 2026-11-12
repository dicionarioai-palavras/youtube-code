import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

// Abertura de canal "PALAVRAS": campo creme -> corte para o campo noite,
// com o arco laranja desenhando, o P subindo e o círculo fechando o logo.
// 189 quadros a 30 fps = 6,3 s (4 compassos da trilha a 152 BPM).
const CUT = 95;
const STAGE = 1254;
const SCALE = 0.78;
const LOGO_CY = 830;
const ARCO = '#D96B2C';

export const PalavrasSting: React.FC = () => {
  const frame = useCurrentFrame();
  const night = frame >= CUT;
  const local = night ? frame - CUT : frame;

  const zoom = night
    ? 1.02 + 0.05 * (local / (189 - CUT))
    : 1.02 + 0.06 * (frame / CUT);

  // arco se desenha de cima para baixo no primeiro compasso
  const arc = interpolate(frame, [4, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // P sobe no compasso 2
  const glyph = interpolate(frame, [47, 66], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // "soco" no corte e círculo entrando
  const punch = night
    ? interpolate(local, [0, 10], [1.06, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  const circle = night
    ? interpolate(local, [0, 10], [0.9, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0.9;

  // ponto do arco entra primeiro
  const dot = interpolate(frame, [0, 7], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // respiração final
  const breath = interpolate(frame, [147, 189], [1, 1.018], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: night ? '#1A1D24' : '#FBE9C2', overflow: 'hidden'}}>
      <Img
        src={staticFile(night ? 'palavras/campo-noite.png' : 'palavras/campo-creme.png')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom})`,
        }}
      />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            position: 'relative',
            width: STAGE,
            height: STAGE,
            transform: `scale(${SCALE * punch * breath})`,
            transformOrigin: 'center center',
            marginTop: LOGO_CY - 960, // centro do logo um pouco acima do centro do quadro
          }}
        >
          {/* arco laranja: desenha de cima para baixo, com o ponto primeiro.
              Fica atrás do círculo: no corte, a ponta do arco entra para trás da peça. */}
          <svg
            viewBox="0 0 1254 1254"
            style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}
          >
            <path
              d="M 889.7 154.7 A 519 519 0 0 1 1102.2 434.7"
              fill="none"
              stroke={ARCO}
              strokeWidth={11}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - arc}
            />
            <circle
              cx={889.7}
              cy={154.7}
              r={12}
              fill={ARCO}
              style={{transformOrigin: '889.7px 154.7px', transform: `scale(${dot})`}}
            />
          </svg>

          {/* círculo branco do logo */}
          <div
            style={{
              position: 'absolute',
              left: '9.6%',
              top: '8%',
              width: '80.6%',
              height: '80.6%',
              borderRadius: '50%',
              background:
                'radial-gradient(120% 120% at 34% 26%, #FFFFFF 0%, #FAF9F6 52%, #ECE9E2 100%)',
              boxShadow:
                '0 38px 80px rgba(0,0,0,0.22), 0 10px 26px rgba(0,0,0,0.14), inset 0 2px 6px rgba(255,255,255,0.9)',
              opacity: night ? 1 : 0,
              transform: `scale(${circle})`,
            }}
          />

          {/* P */}
          <Img
            src={staticFile('palavras/glifo-grafite.png')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: glyph,
              transform: `translateY(${40 * (1 - glyph)}px) scale(${0.96 + 0.04 * glyph})`,
              filter: `blur(${6 * (1 - glyph)}px)`,
            }}
          />
        </div>
      </AbsoluteFill>

      <Audio src={staticFile('trilhas/silent-film-light.mp3')} />
    </AbsoluteFill>
  );
};
