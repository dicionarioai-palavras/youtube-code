export type Palavra = {t0: number; t1: number; texto: string};

export type Clip = {
  src: string; // caminho dentro de public/
  duracao: number; // segundos (já com a velocidade aplicada)
  mudo: boolean;
  regiao?: [number, number, number, number]; // tela: região própria deste clipe (senão vale a do corte)
};

export type Sfx = {t: number; src: string; vol: number};
// completo = voz + trilha + efeitos | sem-trilha = voz + efeitos (Instagram/TikTok com música do app) | voz = só a voz (Adobe Podcast)
// sem-voz = trilha + efeitos com os clipes mudos | efeitos = só os efeitos (os dois servem ao remix com a voz do Adobe: scripts/remix-adobe.mjs)
export type Mix = 'completo' | 'sem-trilha' | 'voz' | 'sem-voz' | 'efeitos';

export type CorteProps = {
  id: string;
  marca: 'palavras' | 'luiz' | 'oeconomista';
  layout: 'camera' | 'tela';
  largura: number; // da fonte (proxy)
  altura: number;
  focoX?: number; // camera: 0 = esquerda .. 1 = direita
  regiao?: [number, number, number, number]; // tela: x, y, w, h (0..1) da área a destacar
  pb?: boolean; // preto e branco
  clips: Clip[];
  palavras: Palavra[]; // tempos já no vídeo final
  gancho?: {texto: string; ate: number; tick?: string};
  cta?: {linha: string; engajamento?: string; dur?: number}; // ausente = sem cartela final
  trilha?: {src: string; volume: number; inicio?: number};
  sfx?: Sfx[];
  capa?: string; // imagem 1080x1920 mostrada nos últimos quadros (luiz: sem capa; palavras: logo completo)
  capaDur?: number; // segundos da imagem final (padrão 0,5)
  censura?: [number, number][]; // palavrões: janelas (s, tempo do vídeo final) em que a voz original fica muda
  mix?: Mix;
  duracao: number; // segundos
};
