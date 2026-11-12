// Entrada própria das peças de bastidor do Ciúme (06/11/2026). Render: npx remotion render src/entry-ciume-bastidores.tsx <id>
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {BastidorCiume, BastidorProps, duracaoBastidor} from './ciume-bastidores/BastidorCiume';
import dados from './ciume-bastidores/dados.json';
import {CapaCiume, CapaProps} from './ciume-bastidores/CapaCiume';

const D = dados as Record<string, {palavras: {t0: number; texto: string}[]}>;
const em = (peca: string, ini: string) => D[peca].palavras.find((w) => w.texto.toLowerCase().startsWith(ini))?.t0 ?? 0;
const voz = (peca: string) => `clips/ciume-bastidores/${peca}/voz.wav`;
const CC = {src: 'audio/trilhas/silent-film-light.mp3', volume: 0.16, inicio: 4};

const PECAS: (BastidorProps & {id: string})[] = [
  {id: 'ciume-bast-pra-que--luiz', peca: 'ciume-bast-pra-que', marca: 'luiz', gancho: 'Gravei "pra quê?" 9 vezes. Só uma ficou.',
    voz: voz('ciume-bast-pra-que'), trilha: CC, contadorPraQue: true, selo: {em: em('ciume-bast-pra-que', 'isso'), texto: 'Essa fica.'}},
  {id: 'ciume-bast-pra-que--palavras', peca: 'ciume-bast-pra-que', marca: 'palavras', gancho: 'Gravei "pra quê?" 9 vezes. Só uma ficou.',
    voz: voz('ciume-bast-pra-que'), trilha: CC, contadorPraQue: true, selo: {em: em('ciume-bast-pra-que', 'isso'), texto: 'Essa fica.'},
    cartela: {linha: 'o dicionário que investiga · palavras.co', engajamento: 'E você, passaria a localização?'}},
  {id: 'ciume-bast-volta-pro-comeco--luiz', peca: 'ciume-bast-volta-pro-comeco', marca: 'luiz', gancho: '27 minutos pra gravar 15. Olha o que sobrou.',
    voz: voz('ciume-bast-volta-pro-comeco'), trilha: CC, selo: {em: em('ciume-bast-volta-pro-comeco', 'vinte'), texto: '27 min de gravação'}},
  {id: 'ciume-bast-cara-da-persiana--luiz', peca: 'ciume-bast-cara-da-persiana', marca: 'luiz', gancho: 'Você também já foi o cara da persiana?',
    voz: voz('ciume-bast-cara-da-persiana'), trilha: {src: 'audio/trilhas/cattle.mp3', volume: 0.13}, persiana: true},
];

const C = (k: string) => `clips/ciume-bastidores/capas/${k}.jpg`;
const CAPAS: (CapaProps & {id: string})[] = [
  {id: 'capa--pra-que-nove-vezes--luiz-l-edi', img: C('pra-a'), modelo: 'l-edi', texto: 'Qual das nove?'},
  {id: 'capa--pra-que-nove-vezes--luiz-l-tea', img: C('pra-b'), modelo: 'l-tea'},
  {id: 'capa--pra-que-nove-vezes--luiz-l-cot', img: C('pra-b'), modelo: 'l-cot'},
  {id: 'capa--pra-que-nove-vezes--palavras', img: C('pra-a'), modelo: 'p-molde', texto: 'Qual das nove?', apoio: 'pra quê?'},
  {id: 'capa--pra-que-nove-vezes--palavras-e3-foto-real', img: C('pra-b'), modelo: 'p-e3', texto: 'Qual das nove?', apoio: 'pra quê?'},
  {id: 'capa--volta-pro-comeco-da-frase--luiz-l-edi', img: C('vol-a'), modelo: 'l-edi', texto: 'Errou? Volta.'},
  {id: 'capa--volta-pro-comeco-da-frase--luiz-l-tea', img: C('vol-b'), modelo: 'l-tea'},
  {id: 'capa--volta-pro-comeco-da-frase--luiz-l-cot', img: C('vol-b'), modelo: 'l-cot'},
  {id: 'capa--o-cara-da-persiana--luiz-l-edi', img: C('per-a'), modelo: 'l-edi', texto: 'Eu já fui esse cara'},
  {id: 'capa--o-cara-da-persiana--luiz-l-tea', img: C('per-b'), modelo: 'l-tea'},
  {id: 'capa--o-cara-da-persiana--luiz-l-cot', img: C('per-a'), modelo: 'l-cot'},
];

const Root: React.FC = () => <>
  {CAPAS.map(({id, ...props}) => (
    <Composition key={id} id={id} component={CapaCiume as React.FC<any>} fps={1} width={1080} height={1920} durationInFrames={1} defaultProps={props} />
  ))}
  {PECAS.map(({id, ...props}) => (
    <Composition key={id} id={id} component={BastidorCiume as React.FC<any>} fps={30} width={1080} height={1920}
      durationInFrames={Math.round(duracaoBastidor(props) * 30)} defaultProps={props} />
  ))}
</>;
registerRoot(Root);
