// Canal "The Mind Behind" — identidade visual em código.
// Paleta fixa: tinta, papel, vermelho de evidência. Grafite e âmbar só como apoio.
import {continueRender, delayRender, staticFile} from 'remotion';

export const COR = {
  tinta: '#0F0E0D', // fundo principal
  tinta2: '#1A1816', // superfícies
  papel: '#ECE4D3', // texto principal, personagens
  vermelho: '#C2332B', // a pista: só 1 elemento por quadro
  grafite: '#6B655C', // texto secundário, linhas
  ambar: '#D8A85A', // luz de janela/lâmpada (só ilustração)
};

export const FONTE = {
  titulo: 'TMB Bebas', // títulos, thumbs
  ficha: 'TMB Courier', // datas, lugares, fichas de caso
  texto: 'TMB Inter', // legendas, texto corrido
  citacao: 'TMB Cormorant', // citações
};

const ARQUIVOS: [string, string, string?][] = [
  [FONTE.titulo, 'BebasNeue.woff2'],
  [FONTE.ficha, 'CourierPrime-Bold.ttf'],
  [FONTE.texto, 'Inter-500.woff2'],
  [FONTE.citacao, 'CormorantGaramond-500-italic.woff2', 'italic'],
];

let carregado = false;
export const carregarFontes = () => {
  if (carregado || typeof document === 'undefined') return;
  carregado = true;
  const h = delayRender('fontes TMB');
  Promise.all(
    ARQUIVOS.map(([familia, arquivo, estilo]) =>
      new FontFace(familia, `url(${staticFile(`fonts/${arquivo}`)})`, {style: estilo ?? 'normal'})
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
