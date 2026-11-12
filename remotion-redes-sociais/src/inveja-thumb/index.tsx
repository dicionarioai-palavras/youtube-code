import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';

// Thumb do vídeo longo Inveja — composição T-A ("o binóculo que olha de volta").
// Estudo: canais/palavras/episodios/ep01-inveja/thumb/inveja-estudo-semiotico-thumb.txt
// 1920x1080 (renderizar com --scale=2 para 3840x2160). Imagens de Luiz (Runway) em public/img.
// Reflexos: refl-prato.png e refl-chave.png são recortes espelhados com distorção de lente (pré-processados).

const C = {osso: '#F3E9D5', terra: '#C46D45', tinta: '#15161A', ocre: '#DB9B5B'};

// Imagem A1 (2752x1536) posicionada com escala K e deslocamento (OX, OY)
const K = 0.8, OX = -70, OY = -8;
const P = (x: number, y: number) => ({x: x * K + OX, y: y * K + OY});
// Vidros das lentes no arquivo original (centro, raio horizontal, raio vertical)
const LENS = [
	{c: P(1265, 690), rx: 108 * K, ry: 168 * K, img: 'img/refl-prato.png', rot: -4},
	{c: P(1942, 725), rx: 128 * K, ry: 188 * K, img: 'img/refl-chave.png', rot: 3},
];

const fonts = `
@font-face{font-family:PalBebas;src:url(${staticFile('fonts/BebasNeue.woff2')}) format('woff2');}
@font-face{font-family:PalInter;src:url(${staticFile('fonts/Inter-500.woff2')}) format('woff2');}
`;

const Lens: React.FC<{l: (typeof LENS)[number]; variant: Variant}> = ({l, variant}) => {
	const w = l.rx * 2, h = l.ry * 2;
	const glow = variant === 'B';
	return (
		<div style={{position: 'absolute', left: l.c.x - l.rx, top: l.c.y - l.ry, width: w, height: h,
			borderRadius: '50%', overflow: 'hidden', transform: `rotate(${l.rot}deg)`}}>
			{/* reflexo do objeto invejado, preso dentro da lente */}
			<Img src={staticFile(l.img)} style={{position: 'absolute', left: -w * 0.08, top: -h * 0.04, width: w * 1.16, height: h * 1.08,
				objectFit: 'cover', opacity: glow ? 0.95 : 0.82, filter: `saturate(${glow ? 1.25 : 1.05}) contrast(1.08) brightness(${glow ? 1.12 : 1})`}} />
			{/* profundidade do vidro: borda escura e leve tom frio */}
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%',
				background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(4,8,14,.55) 78%, rgba(0,0,0,.92) 100%)'}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(40,70,95,.10)', mixBlendMode: 'screen'}} />
			{/* brilhos do vidro */}
			<div style={{position: 'absolute', left: '14%', top: '8%', width: '46%', height: '30%', borderRadius: '50%',
				background: 'radial-gradient(ellipse, rgba(255,255,255,.38), rgba(255,255,255,0) 70%)', transform: 'rotate(-28deg)'}} />
			<div style={{position: 'absolute', right: '12%', bottom: '10%', width: '18%', height: '10%', borderRadius: '50%',
				background: 'radial-gradient(ellipse, rgba(255,240,220,.35), rgba(255,255,255,0) 70%)'}} />
		</div>
	);
};

type Variant = 'A' | 'B';

const Thumb: React.FC<{variant: Variant}> = ({variant}) => (
	<AbsoluteFill style={{background: '#0B0B0D', overflow: 'hidden'}}>
		<style>{fonts}</style>
		{/* foto real: binóculo virado para quem assiste */}
		<Img src={staticFile('img/A1-binoculo.png')} style={{position: 'absolute', left: OX, top: OY, width: 2752 * K, height: 1536 * K,
			filter: 'contrast(1.12) saturate(.92) brightness(.96)'}} />
		{LENS.map((l, i) => <Lens key={i} l={l} variant={variant} />)}
		{/* sombra à esquerda para o texto e vinheta */}
		<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,8,10,.92) 0%, rgba(8,8,10,.78) 30%, rgba(8,8,10,.25) 46%, rgba(8,8,10,0) 58%)'}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 66% 52%, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%)'}} />
		{/* símbolo do Palavras: discreto, canto superior esquerdo */}
		<Img src={staticFile('marca/palavras-icone-osso.svg')} style={{position: 'absolute', left: 72, top: 60, width: 78, height: 78, opacity: .92}} />
		{/* texto: acusação que vira o olhar para o espectador */}
		<div style={{position: 'absolute', left: 84, top: 318, fontFamily: 'PalBebas', lineHeight: .9, letterSpacing: 2}}>
			<div style={{fontSize: 188, color: C.osso, textShadow: '0 6px 30px rgba(0,0,0,.6)'}}>TÁ OLHANDO</div>
			<div style={{position: 'relative', display: 'inline-block', marginTop: 18}}>
				<div style={{position: 'absolute', left: -22, right: -26, top: 10, bottom: 4, background: C.terra, transform: 'rotate(-1.6deg)',
					boxShadow: '0 10px 30px rgba(0,0,0,.45)'}} />
				<div style={{position: 'relative', fontSize: 214, color: C.tinta, paddingLeft: 4}}>O QUÊ?</div>
			</div>
		</div>
	</AbsoluteFill>
);


// ---------- V2: fundo claro e desfocado com a família do vídeo (S15–S18, CAMPEONADO_NA_CABECA espelhada) ----------
// O primo, de lado, olha para quem segura o binóculo: quem é observado devolve o olhar (a volta).
const BG = {w: 2752, h: 1536, k: 0.75, ox: -100, oy: -40};
const K2 = 0.72, OX2 = -60, OY2 = 30;
const P2 = (x: number, y: number) => ({x: x * K2 + OX2, y: y * K2 + OY2});
const LENS2 = [
	{c: P2(1265, 690), rx: 108 * K2, ry: 168 * K2, img: 'img/refl-prato.png', rot: -4},
	{c: P2(1942, 725), rx: 128 * K2, ry: 188 * K2, img: 'img/refl-chave.png', rot: 3},
];
const ThumbV2: React.FC<{fio: boolean; blur: number}> = ({fio, blur}) => (
	<AbsoluteFill style={{background: '#20180F', overflow: 'hidden'}}>
		<style>{fonts}</style>
		<Img src={staticFile('img/CAMPEONADO_NA_CABECA.png')} style={{position: 'absolute', left: BG.ox, top: BG.oy, width: BG.w * BG.k, height: BG.h * BG.k,
			transform: 'scaleX(-1)', filter: `blur(${blur}px) brightness(1.12) saturate(.95) sepia(.08) contrast(.98)`}} />
		{/* leve aquecimento para casar com a luz do binóculo */}
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,214,160,.06), rgba(40,20,8,.12))'}} />
		{/* base escura só onde está o texto (embaixo à esquerda) */}
		<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(12,9,7,.82) 0%, rgba(12,9,7,.45) 26%, rgba(12,9,7,0) 46%)'}} />
		<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(12,9,7,.25) 0%, rgba(12,9,7,0) 40%)'}} />
		{/* binóculo recortado */}
		<Img src={staticFile('img/A1-recorte.png')} style={{position: 'absolute', left: OX2, top: OY2, width: 2752 * K2, height: 1536 * K2,
			filter: 'contrast(1.1) brightness(1.04) drop-shadow(0 30px 60px rgba(0,0,0,.45))'}} />
		{LENS2.map((l, i) => <Lens key={i} l={l} variant="A" />)}
		{fio && (
			<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
				{/* fio terracota: o olhar do primo atravessa até a lente de quem observa — o olhar volta */}
				<path d="M 735 300 C 800 285, 845 320, 852 392" fill="none" stroke={C.terra} strokeWidth={7}
					strokeLinecap="round" strokeDasharray="1 17" />
				<path d="M 837 378 L 853 398 L 868 377" fill="none" stroke={C.terra} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		)}
		<Img src={staticFile('marca/palavras-icone-osso.svg')} style={{position: 'absolute', left: 72, top: 60, width: 78, height: 78, opacity: .95,
			filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.5))'}} />
		<div style={{position: 'absolute', left: 84, top: 600, fontFamily: 'PalBebas', lineHeight: .9, letterSpacing: 2}}>
			<div style={{fontSize: 176, color: C.osso, textShadow: '0 6px 30px rgba(0,0,0,.7)'}}>TÁ OLHANDO</div>
			<div style={{position: 'relative', display: 'inline-block', marginTop: 14}}>
				<div style={{position: 'absolute', left: -22, right: -26, top: 10, bottom: 4, background: C.terra, transform: 'rotate(-1.6deg)',
					boxShadow: '0 10px 30px rgba(0,0,0,.45)'}} />
				<div style={{position: 'relative', fontSize: 200, color: C.tinta, paddingLeft: 4}}>O QUÊ?</div>
			</div>
		</div>
	</AbsoluteFill>
);

const Root: React.FC = () => (
	<>
		<Composition id="inveja-thumb-a" component={Thumb} defaultProps={{variant: 'A' as Variant}} width={1920} height={1080} fps={24} durationInFrames={1} />
		<Composition id="inveja-thumb-a-reflexo-forte" component={Thumb} defaultProps={{variant: 'B' as Variant}} width={1920} height={1080} fps={24} durationInFrames={1} />
		<Composition id="inveja-thumb-a-v2" component={ThumbV2} defaultProps={{fio: false, blur: 9}} width={1920} height={1080} fps={24} durationInFrames={1} />
		<Composition id="inveja-thumb-a-v2-fio" component={ThumbV2} defaultProps={{fio: true, blur: 9}} width={1920} height={1080} fps={24} durationInFrames={1} />
	</>
);
registerRoot(Root);
