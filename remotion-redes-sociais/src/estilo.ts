// Identidade visual por marca. Fonte: identidade-visual\palavras\04-sistema-visual\base-existente\PALAVRAS-TOKENS-E-MOVIMENTO-v1.1.md
// (perfil "luiz": provisório, na mesma linha do Palavras, até ter identidade própria)
export const FONTES = {
  display: {familia: 'Bebas Neue', arquivo: 'fonts/BebasNeue.woff2', peso: '400'},
  titulo: {familia: 'Barlow Condensed', arquivo: 'fonts/BarlowCondensed-800.woff2', peso: '800'},
  texto: {familia: 'Inter', arquivo: 'fonts/Inter-400.woff2', peso: '400'},
  textoMedio: {familia: 'Inter', arquivo: 'fonts/Inter-500.woff2', peso: '500'},
};
export const FONTE_LEGENDA = FONTES.titulo.familia;
export const FONTE_DISPLAY = FONTES.display.familia;
export const FONTE_TEXTO = FONTES.texto.familia;

export const COR = {
  creme: '#FBE9C2', grafite: '#1A1B20', noite: '#1A1D24', osso: '#F7F0E3',
  terracota: '#C46D45', terracotaFunda: '#B4491B', ocre: '#DB9B5B', ocreClaro: '#EABD79',
  azulCinza: '#8F9DA3', ferrugem: '#742A18', grafiteQuente: '#323032',
  verde: '#4ADE80', verdeSite: '#16A34A', verdeEditorial: '#2F6B45',
};

export type Estilo = {
  destaque: string; // palavra ativa da legenda
  texto: string; // legenda
  contorno: string;
  papel: string; // cartões (gancho, verbete)
  tinta: string;
  acento: string; // fio, linhas, barra de progresso
  acentoForte: string; // carimbo, destaque no verbete
  ctaFundo: string;
  ctaTexto: string;
  ctaMarca: string; // palavra grande da cartela final (quando não há logo)
  ctaLogo?: string; // logo oficial na cartela final, em public/ (Palavras: símbolo + nome)
  fragmentos: string[];
};

const palavras: Estilo = {
  destaque: COR.verde, texto: COR.creme, contorno: COR.grafite,
  papel: COR.creme, tinta: COR.grafite, acento: COR.terracota, acentoForte: COR.terracotaFunda,
  ctaFundo: COR.creme, ctaTexto: COR.grafite, ctaMarca: 'PALAVRAS', ctaLogo: 'marca/palavras-logo-grafite.svg',
  fragmentos: [COR.terracota, COR.ocre, COR.ocreClaro, COR.azulCinza, COR.terracotaFunda],
};

export const ESTILOS: Record<string, Estilo> = {
  palavras,
  // provisório: mesma linha, cartela em ocre e assinatura "LUIZ"
  luiz: {...palavras, ctaFundo: COR.ocre, ctaMarca: 'LUIZ', ctaLogo: undefined,
    fragmentos: [COR.grafite, COR.terracotaFunda, COR.creme, COR.ferrugem, COR.osso]},
  oeconomista: {...palavras, ctaMarca: 'OECONOMISTA', ctaLogo: undefined},
};
