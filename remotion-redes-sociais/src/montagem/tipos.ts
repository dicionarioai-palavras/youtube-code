export type ClipM = {
  tipo: 'video' | 'still'; src: string; inicio: number; dur: number;
  layout?: 'camera' | 'tela'; foco?: [number, number]; regiao?: [number, number, number, number];
  onda?: string; carimbo?: string; tremida?: boolean; entra?: boolean; sai?: boolean;
  regiaoAnim?: {de: [number, number, number, number]; para: [number, number, number, number]; segura: number; anima: number};
};
export type PalavraM = {t0: number; t1: number; texto: string; censura?: boolean};
export type Momento =
  | {t: number; tipo: 'zoom'; forca: number}
  | {t: number; tipo: 'transicao'}
  | {t: number; tipo: 'spot'; dur: number; box: [number, number, number, number]; palavra: string}
  | {t: number; tipo: 'sticker'; texto: string; dur: number}
  | {t: number; tipo: 'etimologia'; dur: number; palavra: string; classe: string; origem: string; partes?: [string, string][]; fonte: string};
export type MontagemProps = {
  id: string; marca: string; duracao: number; clips: ClipM[]; palavras: PalavraM[]; momentos: Momento[];
  sfx: {t: number; src: string; vol: number}[]; mutes: {t0: number; t1: number}[];
  gancho: {texto: string; ate: number; tick?: string};
  cta?: {texto: string; engajamento: string}; // ausente = sem cartela (luiz)
  trilha?: {src: string; volume: number; inicio?: number}; loop: string;
  capa?: string; // não usado desde 19/10/2026 (a capa não entra no vídeo)
  mix?: 'completo' | 'sem-trilha' | 'voz' | 'sem-voz' | 'efeitos';
};
