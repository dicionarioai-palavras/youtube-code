// The Mind Behind — gera as ilustrações de um episódio no Runway pela API, com teto de créditos.
// Usa o executor comum (code/apis-externas/src/runway-gerar.mjs): saldo conferido, ledger por pasta, sem repetir POST.
// Uso (na raiz Redes-sociais):
//   node code/canal-the-mind-behind/gerar-imagens.mjs <cenas.json> <pasta-saida> <ancoras|cenas> [teto]
// A etapa "cenas" usa a imagem de referência (ex.: a1-fachada.png) que precisa estar na pasta de saída.
import fs from 'node:fs';
import path from 'node:path';
import {runwayJob} from '../apis-externas/src/runway-gerar.mjs';

const [cenasArq, saida, etapa, tetoArg] = process.argv.slice(2);
if (!cenasArq || !saida || !etapa) throw Error('Uso: gerar-imagens.mjs <cenas.json> <pasta-saida> <ancoras|cenas> [teto]');
const teto = Number(tetoArg || 150);
const lista = JSON.parse(fs.readFileSync(cenasArq, 'utf8')).filter((c) => c.etapa === etapa);
fs.mkdirSync(saida, {recursive: true});
const dataUri = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(saida, f)).toString('base64');

const fila = lista.filter((c) => !fs.existsSync(path.join(saida, c.name + '.png')));
console.log(`${etapa}: ${fila.length} de ${lista.length} a gerar (${fila.reduce((s, c) => s + c.expectedCredits, 0)} créditos previstos, teto ${teto})`);

async function gerar(c) {
  const body = {model: c.model, ratio: '1920:1080', promptText: c.promptText};
  if (c.refs) body.referenceImages = c.refs.map((r) => ({tag: r.tag, uri: dataUri(r.file)}));
  try {
    const r = await runwayJob({dir: saida, name: c.name, endpoint: 'text_to_image', body, expectedCredits: c.expectedCredits, ceiling: teto});
    console.log('OK', c.name, path.basename(r.file));
  } catch (e) {
    console.log('ERRO', c.name, e.message);
  }
}
// Uma por vez: o executor comum usa uma trava por pasta.
for (const c of fila) await gerar(c);
console.log('FIM', etapa);
