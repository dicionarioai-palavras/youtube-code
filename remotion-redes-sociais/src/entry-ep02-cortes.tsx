// Entrada só para renderizar os cortes do EP02 fora do projeto inteiro (nuvem). No PC de Luiz as composições ficam no Root via Composicoes.tsx.
import React from 'react';
import {registerRoot} from 'remotion';
import {carregarFontes} from './canal-dark/tema';
import {ComposicoesEP02Cortes} from './canal-dark/ComposicoesEP02Cortes';
carregarFontes();
registerRoot(() => <ComposicoesEP02Cortes />);
