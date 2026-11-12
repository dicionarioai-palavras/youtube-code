import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, registerRoot, staticFile, useCurrentFrame, interpolate} from 'remotion';

// Cortes Palavras de Inveja — rodada 2 (01/11/2026), mesmo desenho da rodada de 31/10/2026 — 1080x1920, 25 fps.
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

// Rodada 2 (01/11/2026) — fonte: videos/inveja-v2/inveja-final-novos-audios.mp4; voz: audios/ajustados/narracao-ajustada.wav.
// Legendas no texto do roteiro oficial (roteiro-youtube/final/inveja-roteiro-youtube.txt), tempos da transcrição local.
export const CORTES: Corte[] = [
	{id: 'mesma-dor-dois-caminhos', manchete: ['A MESMA DOR', 'LEVA AONDE?'], video: 'cortes/r2-c3.mp4', voz: 'cortes/r2-c3-voz.wav', dur: 28.25,
		leg: [[0.17, 1.83, "É aqui que a coisa fica interessante."], [1.88, 3.97, "Porque a inveja não é uma coisa só."], [4.78, 6.25, "Pensa em duas pessoas."], [6.48, 10.36, "A primeira vê um amigo passar num concurso que ela também tentou."], [11.05, 14.40, "Sente o incômodo, e usa esse incômodo como combustível."], [14.46, 16.85, "Na segunda-feira, volta a estudar."], [17.72, 20.00, "A segunda vê o mesmo amigo passar."], [20.63, 21.55, "Sente o mesmo incômodo."], [21.58, 24.31, "Só que começa a procurar defeito no amigo."], [25.01, 26.25, "A dor é a mesma."], [26.33, 27.81, "A direção é oposta."]],
		cta: 'cortes/r2-cta2.mp4', ctaVoz: 'cortes/r2-cta2-voz.wav', ctaDur: 9.67, ctaLeg: [[0.15, 4.92, "Se a inveja ainda ficou na sua cabeça, a investigação continua no blog:"], [5.41, 6.92, "palavras.co/blog"], [6.99, 9.47, "É só pesquisar por \"inveja\"."]]},
	{id: 'to-com-inveja', manchete: ['VOCÊ CHAMOU', 'PELO NOME?'], video: 'cortes/r2-c4.mp4', voz: 'cortes/r2-c4-voz.wav', dur: 17.9,
		leg: [[0.19, 1.75, "\"Tô com inveja.\""], [1.91, 4.29, "Ou será que você nem chama isso de inveja?"], [4.72, 6.90, "Parece que a inveja tá dizendo:"], [7.04, 9.16, "\"Eu não quero que essa pessoa tenha isso.\""], [9.50, 12.90, "Mas às vezes ela quer dizer outra coisa:"], [13.09, 15.32, "\"O que essa pessoa tem me fez olhar pra mim,"], [15.36, 17.17, "e eu não gostei do que vi.\""]],
		cta: 'cortes/r2-cta2.mp4', ctaVoz: 'cortes/r2-cta2-voz.wav', ctaDur: 9.67, ctaLeg: [[0.15, 4.92, "Se a inveja ainda ficou na sua cabeça, a investigação continua no blog:"], [5.41, 6.92, "palavras.co/blog"], [6.99, 9.47, "É só pesquisar por \"inveja\"."]]},
	{id: 'calculadora-do-almoco', manchete: ['O QUE A CONTA', 'ESCONDE?'], video: 'cortes/r2-c5.mp4', voz: 'cortes/r2-c5-voz.wav', dur: 54.1,
		leg: [[0.19, 3.09, "Tem uma coisa meio humilhante na inveja."], [3.60, 6.95, "Ela costuma aparecer com gente que você conhece,"], [7.00, 10.10, "ou com quem você já conviveu de alguma forma."], [10.18, 12.50, "Você tá almoçando com um amigo,"], [12.58, 15.75, "e ele conta que arrumou um emprego novo."], [16.05, 18.95, "Você sorri, pergunta quando ele começa,"], [18.99, 20.45, "ouve os detalhes."], [20.53, 23.90, "Aí, no meio do papo, ele fala o salário."], [23.98, 26.05, "Quase o dobro do seu."], [26.38, 28.60, "Por fora, seu rosto não muda nada."], [28.65, 31.56, "Mas por dentro… liga uma calculadora."], [31.92, 34.10, "Ele tem a sua idade. Não, pera."], [34.49, 35.93, "Ele é dois anos mais novo."], [35.93, 38.80, "E começou a trabalhar depois de você."], [38.85, 40.45, "E aí vem a pergunta:"], [40.49, 45.11, "quanto tempo faz que você tá parado no mesmo lugar?"], [45.92, 49.00, "Nessa hora aparece um desejo bem mesquinho:"], [49.16, 51.97, "tomara que o vale-refeição dele seja ruim."], [52.02, 53.76, "Só pra equilibrar."]],
		cta: 'cortes/r2-cta1c.mp4', ctaVoz: 'cortes/r2-cta1c-voz.wav', ctaDur: 7.37, ctaLeg: [[0.16, 2.05, "Essa investigação começou no Palavras,"], [2.08, 4.25, "o dicionário que, além das definições,"], [4.27, 7.18, "conta a história de cada palavra numa linha do tempo."]]},
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

const Bloco: React.FC<{src: string; som: boolean; leg: Leg[]; m: [string, string]; digitar: boolean; tela?: [number, number, number]; esq?: number}> = ({src, som, leg, m, digitar, tela, esq = -97}) => {
	const t = useCurrentFrame() / FPS;
	const cheia = tela && t >= tela[0] && t < tela[1];
	return (
		<AbsoluteFill style={{background: '#0B0B0D', overflow: 'hidden'}}>
			<OffthreadVideo src={staticFile(src.replace('.mp4', '-fundo.mp4'))} muted style={{position: 'absolute', width: 1080, height: 1920, left: 0, top: 0}} />
			{cheia ? (
				<OffthreadVideo src={staticFile(src)} muted={!som} style={{position: 'absolute', height: 1920, width: 3413, left: 540 - tela![2] * 3413, top: 0}} />
			) : (
				<div style={{position: 'absolute', left: 0, top: 600, width: 1080, height: 717, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
					<OffthreadVideo src={staticFile(src)} muted={!som} style={{position: 'absolute', width: 1274, height: 717, left: esq, top: 0}} />
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
				{/* rodada 2: no CTA 2 o endereço palavras.co/blog fica na borda esquerda; alinhar à esquerda para não cortar */}
				<Bloco src={c.cta} som={som} leg={c.ctaLeg} m={c.manchete} digitar={false} esq={c.cta.includes('cta2') ? 0 : -97} />
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
