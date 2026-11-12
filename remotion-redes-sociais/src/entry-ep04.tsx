// Entrada só para renderizar o EP04 fora do projeto inteiro (nuvem). No PC de Luiz a composição fica no Root via Composicoes.tsx.
import React from 'react';
import {registerRoot} from 'remotion';
import {carregarFontes} from './canal-dark/tema';
import {ComposicoesEP04} from './canal-dark/ComposicoesEP04';
carregarFontes();
registerRoot(() => <ComposicoesEP04 />);
