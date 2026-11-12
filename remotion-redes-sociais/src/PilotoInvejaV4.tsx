import React from 'react';
import { AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame } from 'remotion';

const FPS = 30;
const CHARCOAL = '#171b1d';
const PAPER = '#f1eee7';
const WARM = '#c89562';
const MUTED = '#9caaa9';
const BEBAS = '"Bebas", sans-serif';
const INTER = '"Inter", sans-serif';
const INTER500 = '"Inter500", sans-serif';

const at = (seconds: number) => seconds * FPS;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};
const prog = (frame: number, start: number, end: number) =>
  smooth((frame - at(start)) / (at(end) - at(start)));
const fade = (frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number) =>
  Math.min(prog(frame, inStart, inEnd), 1 - prog(frame, outStart, outEnd));

const Fonts: React.FC = () => (
  <style>{`
@font-face{font-family:'Bebas';src:url('${staticFile('fonts/BebasNeue.woff2')}') format('woff2');font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:'Inter';src:url('${staticFile('fonts/Inter-400.woff2')}') format('woff2');font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:'Inter500';src:url('${staticFile('fonts/Inter-500.woff2')}') format('woff2');font-style:normal;font-weight:500;font-display:swap}
`}</style>
);

const Background: React.FC<{ frame: number; dim: number }> = ({ frame, dim }) => {
  const src = staticFile(`piloto-inveja-v4/background/${String(frame + 1).padStart(6, '0')}.jpg`);
  return (
    <>
      <Img
        src={src}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {dim > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(23,27,29,${dim})` }} /> : null}
    </>
  );
};

const Opening: React.FC<{ f: number }> = ({ f }) => {
  const opacity = Math.min(prog(f, 0.64, 1.08), 1 - prog(f, 3.3, 3.8));
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        bottom: 112,
        opacity,
        transform: `translateY(${(1 - prog(f, 0.64, 1.3)) * 10}px)`,
      }}
    >
      <div style={{ width: 64, height: 1, backgroundColor: WARM, opacity: 0.9, marginBottom: 14 }} />
      <div style={{ fontFamily: BEBAS, fontSize: 40, letterSpacing: 8, lineHeight: 1, color: PAPER }}>
        INVEJA
      </div>
    </div>
  );
};

const NumberTwo: React.FC<{ f: number }> = ({ f }) => {
  const opacity = fade(f, 24.71, 25.25, 26.45, 26.95);
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: 140,
        top: 300,
        textAlign: 'right',
        opacity,
        transform: `translateY(${(1 - prog(f, 24.71, 25.6)) * 14}px)`,
      }}
    >
      <div style={{ fontFamily: INTER500, fontSize: 24, letterSpacing: 6, color: WARM, marginBottom: 8 }}>
        QUASE
      </div>
      <div style={{ fontFamily: BEBAS, fontSize: 180, lineHeight: 0.82, color: PAPER, textShadow: '0 4px 28px #000b' }}>2×</div>
    </div>
  );
};

const ThoughtPanel: React.FC<{ f: number }> = ({ f }) => {
  const enter = prog(f, 29.63, 30.35);
  const exit = prog(f, 39.4, 39.69);
  const opacity = enter * (1 - exit);
  if (opacity <= 0) return null;
  const shift = (1 - enter) * 100 + exit * 80;
  const row = (time: number): React.CSSProperties => {
    const p = prog(f, time, time + 0.32);
    return { opacity: p, transform: `translateY(${(1 - p) * 12}px)` };
  };
  return (
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 150,
        width: 720,
        height: 780,
        boxSizing: 'border-box',
        padding: 56,
        backgroundColor: CHARCOAL,
        border: '1px solid rgba(241,238,231,0.18)',
        boxShadow: '0 30px 90px rgba(0,0,0,0.34)',
        opacity,
        transform: `translateX(${shift}px)`,
      }}
    >
      <div style={{ width: 54, height: 2, backgroundColor: WARM, marginBottom: 20 }} />
      <div style={{ fontFamily: INTER500, fontSize: 24, letterSpacing: 4, color: MUTED }}>POR DENTRO</div>
      <div
        style={{
          marginTop: 34,
          height: 360,
          boxSizing: 'border-box',
          padding: '20px 28px',
          border: '1px solid rgba(241,238,231,0.16)',
          backgroundColor: 'rgba(241,238,231,0.035)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'right',
        }}
      >
        <div style={row(32.34)}>
          <span style={{ fontFamily: INTER, fontSize: 28, letterSpacing: 4, color: MUTED }}>IDADE</span>
        </div>
        <div style={row(34.92)}>
          <span style={{ fontFamily: BEBAS, fontSize: 70, lineHeight: 0.92, color: PAPER }}>
            2 ANOS A MENOS
          </span>
        </div>
        <div style={row(36.75)}>
          <span style={{ fontFamily: BEBAS, fontSize: 70, lineHeight: 0.92, color: WARM }}>
            COMEÇOU DEPOIS
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
        {['+', '−', '×', '÷'].map((symbol) => (
          <div
            key={symbol}
            style={{
              flex: 1,
              height: 112,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(241,238,231,0.16)',
              borderTop: `2px solid ${WARM}`,
              backgroundColor: 'rgba(241,238,231,0.03)',
              fontFamily: BEBAS,
              fontSize: 38,
              color: MUTED,
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
};

const Question: React.FC<{ f: number }> = ({ f }) => {
  const opacity = Math.min(prog(f, 41.56, 42.25), 1 - prog(f, 45.75, 46.3));
  if (opacity <= 0) return null;
  const scale = 1 + 0.02 * prog(f, 41.56, 46.3);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 980,
          height: '100%',
          opacity,
          background:
            'linear-gradient(90deg, rgba(23,27,29,0.86) 0%, rgba(23,27,29,0.62) 58%, rgba(23,27,29,0) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 420,
          width: 900,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
        }}
      >
        <div style={{ fontFamily: BEBAS, fontSize: 120, lineHeight: 0.9, color: PAPER }}>NO MESMO</div>
        <div style={{ fontFamily: BEBAS, fontSize: 120, lineHeight: 0.9, color: PAPER }}>LUGAR?</div>
      </div>
    </>
  );
};

const Ticket: React.FC<{ f: number }> = ({ f }) => {
  const opacity = fade(f, 49.69, 50.25, 54.58, 54.93);
  if (opacity <= 0) return null;
  const enter = (1 - prog(f, 49.69, 50.5)) * 12;
  const descend = prog(f, 52.99, 54.4) * 26;
  const equalOpacity = fade(f, 52.99, 53.3, 54.58, 54.93);
  return (
    <>
      <div style={{ position: 'absolute', right: 307, top: 936, width: 56, height: 16, opacity: equalOpacity }}>
        <div style={{ width: 56, height: 3, backgroundColor: WARM }} />
        <div style={{ width: 56, height: 3, backgroundColor: WARM, marginTop: 10 }} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 700,
          width: 430,
          minHeight: 190,
          boxSizing: 'border-box',
          padding: '26px 30px',
          backgroundColor: PAPER,
          color: CHARCOAL,
          opacity,
          transform: `translateY(${enter + descend}px)`,
          boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ width: 54, height: 3, backgroundColor: WARM, marginBottom: 18 }} />
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 26,
            padding: '4px 7px',
            border: '1px solid rgba(23,27,29,0.55)',
            fontFamily: INTER500,
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          DELE
        </div>
        <div style={{ fontFamily: BEBAS, fontSize: 46, lineHeight: 1, letterSpacing: 0.5, marginTop: 8 }}>
          VALE-REFEIÇÃO
        </div>
        <div style={{ width: 56, height: 1, backgroundColor: 'rgba(23,27,29,0.3)', marginTop: 22 }} />
      </div>
    </>
  );
};

const Check: React.FC<{ f: number }> = ({ f }) => {
  const area = Math.min(prog(f, 58.61, 59.0), 1 - prog(f, 62.18, 62.65));
  if (area <= 0) return null;
  const salary = prog(f, 58.61, 59.0);
  const house = prog(f, 60.53, 60.92);
  const rowStyle = (p: number): React.CSSProperties => ({
    opacity: p,
    transform: `translateX(${(1 - p) * 12}px)`,
    fontFamily: INTER500,
    fontSize: 30,
    letterSpacing: 2,
    color: PAPER,
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: 700,
        width: 560,
        minHeight: 240,
        boxSizing: 'border-box',
        padding: '26px 34px',
        backgroundColor: 'rgba(23,27,29,0.76)',
        border: '1px solid rgba(241,238,231,0.15)',
        opacity: area,
      }}
    >
      <div style={{ width: 70, height: 1, backgroundColor: WARM, marginBottom: 16 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 76 }}>
        <span style={{ width: 40, textAlign: 'center', fontFamily: BEBAS, fontSize: 58, lineHeight: 1, color: WARM }}>
          =
        </span>
        <span style={rowStyle(salary)}>SEU SALÁRIO</span>
      </div>
      <div style={{ height: 1, backgroundColor: 'rgba(241,238,231,0.13)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 76 }}>
        <span style={{ width: 40, textAlign: 'center', fontFamily: BEBAS, fontSize: 58, lineHeight: 1, color: WARM }}>
          =
        </span>
        <span style={rowStyle(house)}>SUA CASA</span>
      </div>
    </div>
  );
};

const Ruler: React.FC<{f:number}>=({f})=>{
 const enter=prog(f,70.50,71.45),exit=prog(f,73.02,73.36);
 if(enter<=0||exit>=1)return null;
 return <div style={{position:'absolute',left:500,top:870,width:920,height:64,opacity:1-exit,overflow:'hidden'}}>
   <div style={{width:920*enter,height:64,overflow:'hidden'}}>
    <svg width={920} height={64}>
      <line x1={4} y1={8} x2={916} y2={8} stroke={PAPER} strokeWidth={3}/>
      {Array.from({length:25}).map((_,i)=><line key={i} x1={4+i*38} y1={8} x2={4+i*38} y2={i%4===0?42:27} stroke={PAPER} strokeWidth={2}/>) }
      <line x1={4} y1={8} x2={916} y2={8} stroke={WARM} strokeWidth={1}/>
    </svg>
   </div>
 </div>;
};

const Quote: React.FC<{ f: number }> = ({ f }) => {
  const opacity = Math.min(prog(f, 75.4, 75.95), 1 - prog(f, 78.55, 79.05));
  if (opacity <= 0) return null;
  const first = prog(f, 75.4, 75.95);
  const second = prog(f, 76.7, 77.2);
  const lineStyle = (p: number): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${(1 - p) * 10}px)`,
    fontFamily: BEBAS,
    fontSize: 86,
    lineHeight: 1.03,
    letterSpacing: 0.5,
    color: PAPER,
  });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1200,
          height: '100%',
          opacity,
          background:
            'linear-gradient(90deg, rgba(23,27,29,0.90) 0%, rgba(23,27,29,0.58) 50%, rgba(23,27,29,0) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 130, top: 330, width: 1550, opacity }}>
        <div style={lineStyle(first)}>A NOTÍCIA BOA DELE</div>
        <div style={lineStyle(second)}>ESTRAGOU O MEU ALMOÇO.</div>
      </div>
    </>
  );
};

const QuestionMark: React.FC<{ f: number }> = ({ f }) => {
  const opacity = prog(f, 80.73, 81.15);
  if (opacity <= 0) return null;
  const size = 80 + 8 * prog(f, 80.73, 82.36);
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        bottom: 112,
        fontFamily: BEBAS,
        fontSize: size,
        lineHeight: 1,
        color: WARM,
        opacity,
      }}
    >
      ?
    </div>
  );
};

const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const windowsIn = prog(frame, 62.65, 63.25);
  const windowsOut = prog(frame, 73.1, 73.36);
  const dim = 0.08 * windowsIn * (1 - windowsOut);
  return (
    <AbsoluteFill style={{ backgroundColor: CHARCOAL, overflow: 'hidden' }}>
      <Background frame={frame} dim={dim} />
      {frame/30 >= 11.5 && frame/30 < 11.866667 ? <Img src={staticFile('piloto-inveja-v4/mesa-brasileira.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:prog(frame,11.5,11.866667)}}/>:null}
      <Opening f={frame} />
      <NumberTwo f={frame} />
      <ThoughtPanel f={frame} />
      <Question f={frame} />
      <Ticket f={frame} />
      <Check f={frame} />
      <Ruler f={frame} />
      <Quote f={frame} />
      <QuestionMark f={frame} />
    </AbsoluteFill>
  );
};

const RemotionRoot: React.FC = () => (
  <>
    <Fonts />
    <Composition
      id="InvejaAlmocoV4"
      component={Film}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={2471}
    />
  </>
);

registerRoot(RemotionRoot);
