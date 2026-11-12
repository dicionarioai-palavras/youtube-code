import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, registerRoot, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Cortes Palavras de Inveja (31/10/2026) — 1080x1920, 25 fps.
// Trecho do vídeo final + CTA existente do próprio vídeo + cartela única do Palavras.
// variante "shorts": áudio original da montagem (voz + trilha da Biblioteca do YouTube);
// variante "ig": só a voz (narração v5 alinhada), para receber música no app.
const FPS = 25;
const C = {osso: '#F3E9D5', terra: '#C46D45', tinta: '#15161A'};
const fonts = `@font-face{font-family:PalBebas;src:url(${staticFile('fonts/BebasNeue.woff2')}) format('woff2');}
@font-face{font-family:PalInter;src:url(${staticFile('fonts/Inter-500.woff2')}) format('woff2');}`;

type Leg = [number, number, string];
type Corte = {
	id: string; manchete: [string, string]; video: string; voz: string; dur: number; leg: Leg[];
	cta: string; ctaVoz: string; ctaDur: number; ctaLeg: Leg[];
	tela?: [number, number, number]; // [início, fim, foco x] trecho em tela cheia vertical (aparição de Luiz)
};
const PERGUNTA = 'Qual comparação já voltou para você?';
const CARTELA = 2.5;

export const CORTES: Corte[] = [
	{id: 'invidere-videre', manchete: ['POR QUE O', 'OLHO VOLTA?'], video: 'cortes/c1.mp4', voz: 'cortes/c1-voz.wav', dur: 58.04,
		tela: [53.54, 55.9, 0.47],
		leg: [[0.1, 3.39, 'A inveja começou com o olho apontando para fora.'], [3.93, 5.47, 'Só que o olho voltou.'], [6.0, 8.48, 'Ele pode voltar com uma vontade pequena.'],
			[8.97, 10.71, '"Eu quero correr de novo.'], [11.05, 12.33, 'Dane-se meu joelho."'], [12.61, 14.53, 'Pode voltar com uma frase difícil.'],
			[15.24, 17.74, '"Eu achei que já ia estar mais longe."'], [18.38, 21.16, 'E pode voltar sem resposta nenhuma.'], [21.66, 22.64, 'Só com vergonha.'],
			[23.2, 25.22, 'Seu amigo continua sendo seu amigo.'], [25.61, 27.33, 'A notícia continua sendo boa.'], [27.47, 29.23, 'Você ainda quer que ele se dê bem.'],
			[29.83, 33.29, 'Você só não queria se sentir perdendo enquanto isso.'], [33.85, 34.67, 'Lembra do começo?'], [35.03, 35.61, 'Invidere.'],
			[35.95, 38.05, 'Olhar com hostilidade.'], [38.49, 42.11, 'A gente sempre achou que esse olhar torto ia pra quem tava na frente.'],
			[42.43, 46.21, 'Pro salário do amigo, pro Corolla do primo, pra meia maratona da amiga.'], [46.51, 48.19, 'Mas olha onde ele foi parar.'],
			[48.45, 50.11, 'Talvez a inveja seja isso:'], [50.43, 53.41, 'um olhar hostil que sai procurando o outro…'], [53.89, 55.93, 'e acaba encontrando você.'],
			[56.48, 57.02, 'Videre.'], [57.56, 58.0, 'Ver.']],
		cta: 'cortes/cta1.mp4', ctaVoz: 'cortes/cta1-voz.wav', ctaDur: 9.11,
		ctaLeg: [[0.1, 2.02, 'Essa investigação começou no Palavras,'], [2.02, 4.4, 'o dicionário que, além das definições,'], [4.4, 7.12, 'conta a história de cada palavra numa linha do tempo.'], [7.45, 9.05, 'Foi lá que eu encontrei o videre.']]},
	{id: 'o-olho-volta', manchete: ['ATÉ ONDE ESSE', 'OLHAR VAI?'], video: 'cortes/c2.mp4', voz: 'cortes/c2-voz.wav', dur: 36.14,
		leg: [[0.1, 4.08, 'Até aqui, parecia que a inveja falava de quem tá na frente.'], [4.56, 6.2, 'Só que o olho volta.'], [7.06, 9.6, 'Volta pra meia maratona que a sua amiga postou.'],
			[10.08, 13.86, 'Volta pro arquivo que você abriu e fechou três vezes essa semana.'], [14.46, 16.8, 'Volta pro salário que você ouviu no almoço.'],
			[17.49, 22.57, 'Se escrever nunca foi importante pra você, o livro de um conhecido passa batido.'], [22.99, 29.75, 'Mas se tem um arquivo seu parado há seis anos, o livro dele traz o seu junto.'],
			[30.26, 36.0, 'Ou seja: aquilo que te dá inveja pode mostrar o que ganhou valor na sua própria régua.']],
		cta: 'cortes/cta2.mp4', ctaVoz: 'cortes/cta2-voz.wav', ctaDur: 9.62,
		ctaLeg: [[0.1, 4.92, 'Se a inveja ainda ficou na sua cabeça, a investigação continua no blog:'], [5.36, 6.94, 'palavras.co/blog'], [6.94, 9.5, 'É só pesquisar por "inveja".']]},
];

const Legenda: React.FC<{leg: Leg[]}> = ({leg}) => {
	const t = useCurrentFrame() / FPS;
	const cur = leg.find(([a, b]) => t >= a && t < b + 0.12);
	if (!cur) return null;
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 1360, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: 'PalInter', fontSize: 54, lineHeight: 1.28, color: '#fff', textAlign: 'center', background: 'rgba(12,12,14,.72)', padding: '14px 26px', borderRadius: 14}}>{cur[2]}</div>
		</div>
	);
};

const Cabecalho: React.FC<{m: [string, string]; digitar: boolean}> = ({m, digitar}) => {
	const f = useCurrentFrame();
	const total = (m[0] + m[1]).length;
	const n = digitar ? Math.floor(interpolate(f, [4, 2.3 * FPS], [0, total], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})) : total;
	const l1 = m[0].slice(0, Math.min(n, m[0].length));
	const l2 = m[1].slice(0, Math.max(0, n - m[0].length));
	const box = (txt: string, bg: string) => txt ? <span style={{background: bg, color: C.tinta, padding: '0 20px'}}>{txt}</span> : null;
	return (
		<div style={{position: 'absolute', left: 70, top: 230}}>
			<div style={{fontFamily: 'PalInter', fontSize: 30, letterSpacing: 9, color: '#E9B48F', marginBottom: 16}}>INVEJA · PALAVRAS</div>
			<div style={{fontFamily: 'PalBebas', fontSize: 132, lineHeight: 1.05}}>{box(l1, C.osso)}<br />{box(l2, C.terra)}</div>
		</div>
	);
};

const Bloco: React.FC<{src: string; som: boolean; leg: Leg[]; m: [string, string]; digitar: boolean; tela?: [number, number, number]}> = ({src, som, leg, m, digitar, tela}) => {
	const t = useCurrentFrame() / FPS;
	const cheia = tela && t >= tela[0] && t < tela[1];
	return (
		<AbsoluteFill style={{background: '#0B0B0D', overflow: 'hidden'}}>
			<OffthreadVideo src={staticFile(src.replace('.mp4', '-fundo.mp4'))} muted style={{position: 'absolute', width: 1080, height: 1920, left: 0, top: 0}} />
			{cheia ? (
				<OffthreadVideo src={staticFile(src)} muted={!som} style={{position: 'absolute', height: 1920, width: 3413, left: 540 - tela![2] * 3413, top: 0}} />
			) : (
				<div style={{position: 'absolute', left: 0, top: 600, width: 1080, height: 717, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
					<OffthreadVideo src={staticFile(src)} muted={!som} style={{position: 'absolute', width: 1274, height: 717, left: -97, top: 0}} />
				</div>
			)}
			{/* evita áudio duplo: quando em tela cheia, o vídeo pequeno some e o grande leva o som */}
			{!cheia && <Cabecalho m={m} digitar={digitar} />}
			<Legenda leg={leg} />
		</AbsoluteFill>
	);
};

const Cartela: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'})}}>
			<Img src={staticFile('marca/palavras-final.png')} style={{width: 1080, height: 1920}} />
			<div style={{position: 'absolute', left: 50, right: 50, top: 1230, textAlign: 'center', fontFamily: 'PalBebas', fontSize: 70, color: C.tinta, lineHeight: 1.05}}>{PERGUNTA}</div>
		</AbsoluteFill>
	);
};

const CorteComp: React.FC<{i: number; variante: 'shorts' | 'ig'}> = ({i, variante}) => {
	const c = CORTES[i];
	const som = variante === 'shorts';
	const d1 = Math.round(c.dur * FPS), d2 = Math.round(c.ctaDur * FPS);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<style>{fonts}</style>
			<Sequence durationInFrames={d1}>
				<Bloco src={c.video} som={som} leg={c.leg} m={c.manchete} digitar tela={c.tela} />
				{!som && <Audio src={staticFile(c.voz)} />}
			</Sequence>
			<Sequence from={d1} durationInFrames={d2}>
				<Bloco src={c.cta} som={som} leg={c.ctaLeg} m={c.manchete} digitar={false} />
				{!som && <Audio src={staticFile(c.ctaVoz)} />}
			</Sequence>
			<Sequence from={d1 + d2} durationInFrames={Math.round(CARTELA * FPS)}><Cartela /></Sequence>
		</AbsoluteFill>
	);
};

const Root: React.FC = () => (
	<>
		{CORTES.map((c, i) => (['shorts', 'ig'] as const).map((v) => (
			<Composition key={c.id + v} id={`${c.id}-${v}`} component={CorteComp} defaultProps={{i, variante: v}} width={1080} height={1920} fps={FPS}
				durationInFrames={Math.round(c.dur * FPS) + Math.round(c.ctaDur * FPS) + Math.round(CARTELA * FPS)} />
		)))}
	</>
);
registerRoot(Root);
