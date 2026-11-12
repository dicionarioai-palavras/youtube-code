// Entrada só para renderizar os cortes do EP08 fora do projeto inteiro (nuvem). No PC de Luiz as composições ficam no Root via Composicoes.tsx.
import React from 'react';
import {registerRoot} from 'remotion';
import {carregarFontes} from './canal-dark/tema';
import {ComposicoesEP08Cortes} from './canal-dark/ComposicoesEP08Cortes';
carregarFontes();
registerRoot(() => <ComposicoesEP08Cortes />);
