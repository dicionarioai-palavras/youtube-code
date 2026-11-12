// Entrada só para renderizar o EP08 fora do projeto inteiro (nuvem). No PC de Luiz a composição fica no Root via Composicoes.tsx.
import React from 'react';
import {registerRoot} from 'remotion';
import {carregarFontes} from './canal-dark/tema';
import {ComposicoesEP08} from './canal-dark/ComposicoesEP08';
carregarFontes();
registerRoot(() => <ComposicoesEP08 />);
