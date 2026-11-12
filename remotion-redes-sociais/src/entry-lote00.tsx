// Entrada só para renderizar o lote 0 fora do projeto inteiro (nuvem). No PC de Luiz as composições ficam no Root via Composicoes.tsx.
import React from 'react';
import {registerRoot} from 'remotion';
import {carregarFontes} from './canal-dark/tema';
import {ComposicoesLote00} from './canal-dark/ComposicoesLote00';
carregarFontes();
registerRoot(() => <ComposicoesLote00 />);
