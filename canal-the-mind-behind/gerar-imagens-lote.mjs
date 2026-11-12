// The Mind Behind — imagens de um lote (ou episódio) no Runway, em duas fases que cabem em chamadas curtas.
// Feito para o lote 0 de Shorts originais (06/11/2026); serve para qualquer pasta. Não mexe no gerar-imagens.mjs do EP01.
//   enviar: envia ao Runway os pedidos que ainda não estão no ledger (saldo conferido antes; sem repetir POST)
//   baixar: consulta os pedidos pendentes e baixa os prontos para <pasta>/<grupo>/<nome>.png
// Uso (na raiz Redes-sociais):
//   node code/canal-the-mind-behind/gerar-imagens-lote.mjs <pedidos.json> <pasta-imagens> enviar|baixar [--so O1,O2] [--max 12] [--teto 2000]
// pedidos.json: [{name, grupo, model: gen4_image|gen4_image_turbo, ratio: "1080:1920", promptText, refs: [{tag, file}]}]
//   --refazer-falhas: pedidos que falharam no Runway (não cobrados) são renomeados no ledger (#falhaN) e enviados de novo
//   ref.file é relativo à <pasta-imagens>; PNG vira JPG em <pasta>/_refs/ (data URI < 5 MB).
// Ledger: <pasta-imagens>/runway-ledger.json (créditos previstos pelo calculador do projeto, custo e saldo).
// Refazer uma imagem = novo name (ex.: o1-03b). Nunca reaproveita tarefa com receita diferente.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
import {getRunwayBalance} from '../apis-externas/src/runway-saldo.mjs';
import {estimate} from '../apis-externas/src/runway-custos.mjs';

loadExternalEnv();
const args = process.argv.slice(2);
const [arqPedidos, pasta, fase] = args;
if (!arqPedidos || !pasta || !['enviar', 'baixar'].includes(fase)) throw Error('Uso: gerar-imagens-lote.mjs <pedidos.json> <pasta> enviar|baixar [--so O1] [--max N] [--teto N]');
const val = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const so = val('--so', '') ? val('--so').split(',') : null;
const max = Number(val('--max', 12));
const teto = Number(val('--teto', 2000));

const pedidos = JSON.parse(fs.readFileSync(arqPedidos, 'utf8')).filter((p) => !so || so.includes(p.grupo));
const ledgerPath = path.join(pasta, 'runway-ledger.json');
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {criado_em: new Date().toISOString(), teto, lotes_de_envio: [], jobs: []};
const salvar = () => fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
const resol = (ratio) => (/1920|1080:1080/.test(ratio) ? '1080p' : '720p');
const creditos = (p) => estimate({model: p.model, resolution: resol(p.ratio)}).credits;

async function api(rota, opcoes = {}) {
  let r;
  try {
    r = await fetch('https://api.dev.runwayml.com/v1/' + rota, {...opcoes, headers: {Authorization: 'Bearer ' + getCredential('runway'), 'X-Runway-Version': '2024-11-06', 'Content-Type': 'application/json'}, signal: AbortSignal.timeout(45000)});
  } catch { throw Error('Conexão Runway interrompida (sem repetição automática).'); }
  if (!r.ok) { let det = ''; try { det = JSON.stringify(await r.json()).slice(0, 300); } catch {} const e = Error('Runway HTTP ' + r.status + ' ' + det); e.status = r.status; throw e; }
  return r.json();
}

function dataUri(file) {
  let f = path.join(pasta, file);
  if (!fs.existsSync(f)) throw Error('Referência ausente: ' + file);
  if (!/\.jpe?g$/i.test(f)) {
    const dir = path.join(pasta, '_refs'); fs.mkdirSync(dir, {recursive: true});
    const j = path.join(dir, path.basename(f).replace(/\.\w+$/, '.jpg'));
    if (!fs.existsSync(j)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-q:v', '3', j]);
    f = j;
  }
  return 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
}

if (fase === 'enviar') {
  if (args.includes('--refazer-falhas')) for (const j of ledger.jobs) if (j.estado === 'FAILED' && !j.name.includes('#')) { let n = 1; while (ledger.jobs.some((x) => x.name === `${j.name}#falha${n}`)) n++; j.name = `${j.name}#falha${n}`; }
  const feitos = new Set(ledger.jobs.map((j) => j.name));
  const fila = pedidos.filter((p) => !feitos.has(p.name)).slice(0, max);
  const custo = fila.reduce((s, p) => s + creditos(p), 0);
  const gasto = ledger.jobs.reduce((s, j) => s + j.creditos_previstos, 0);
  if (gasto + custo > teto) throw Error(`Teto de ${teto} créditos excedido (já ${gasto}, +${custo}).`);
  const saldo = await getRunwayBalance();
  console.log(`Enviar ${fila.length} pedidos · ${custo} créditos previstos · saldo ${saldo.credit_balance}`);
  if (saldo.credit_balance < custo) throw Error('Saldo insuficiente. Nada enviado.');
  if (fila.length) ledger.lotes_de_envio.push({em: new Date().toISOString(), saldo_antes: saldo.credit_balance, pedidos: fila.length, creditos_previstos: custo});
  for (const p of fila) {
    if (p.promptText.length > 1000) { console.log('PULADO (prompt > 1000)', p.name); continue; }
    const body = {model: p.model, ratio: p.ratio, promptText: p.promptText, ...(p.refs?.length ? {referenceImages: p.refs.map((r) => ({tag: r.tag, uri: dataUri(r.file)}))} : {})};
    const hash = crypto.createHash('sha256').update(JSON.stringify({...p, refs: p.refs})).digest('hex');
    const job = {name: p.name, grupo: p.grupo, model: p.model, ratio: p.ratio, creditos_previstos: creditos(p), hash, prompt: p.promptText, refs: (p.refs || []).map((r) => r.file), estado: 'ENVIANDO', criado_em: new Date().toISOString()};
    ledger.jobs.push(job); salvar();
    try { const t = await api('text_to_image', {method: 'POST', body: JSON.stringify(body)}); job.id = t.id; job.estado = 'PENDING'; }
    catch (e) { job.estado = 'ENVIO_INCERTO'; job.erro = e.message; console.log('ERRO', p.name, e.message); }
    salvar(); console.log('enviado', p.name, job.id || '');
  }
} else {
  const pend = ledger.jobs.filter((j) => j.id && !j.arquivo && !['FAILED', 'CANCELLED'].includes(j.estado) && (!so || so.includes(j.grupo)));
  const inicio = Date.now();
  while (pend.some((j) => !j.arquivo && !['FAILED', 'CANCELLED'].includes(j.estado)) && Date.now() - inicio < 130000) {
    for (const j of pend.filter((x) => !x.arquivo && !['FAILED', 'CANCELLED'].includes(x.estado))) {
      try {
        const t = await api('tasks/' + j.id); j.estado = t.status;
        if (t.failure) j.falha = t.failure;
        if (t.status === 'SUCCEEDED') {
          const dir = path.join(pasta, j.grupo); fs.mkdirSync(dir, {recursive: true});
          const f = path.join(dir, j.name + '.png');
          const r = await fetch(t.output[0], {signal: AbortSignal.timeout(60000)});
          if (!r.ok) throw Error('download HTTP ' + r.status);
          fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
          j.arquivo = path.relative(pasta, f).replace(/\\/g, '/'); j.sha256 = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); j.terminado_em = new Date().toISOString();
          console.log('OK', j.name);
        }
      } catch (e) { console.log('aviso', j.name, e.message); }
      salvar();
    }
    if (pend.every((j) => j.arquivo || ['FAILED', 'CANCELLED'].includes(j.estado))) break;
    await new Promise((r) => setTimeout(r, 8000));
  }
  const resumo = {};
  for (const j of ledger.jobs) resumo[j.estado + (j.arquivo ? '' : j.estado === 'SUCCEEDED' ? '(sem arquivo)' : '')] = (resumo[j.estado] || 0) + 1;
  try { const s = await getRunwayBalance(); ledger.saldo_ultima_consulta = {em: new Date().toISOString(), creditos: s.credit_balance}; salvar(); console.log('saldo', s.credit_balance); } catch {}
  console.log('estado', JSON.stringify(resumo), 'falhas:', ledger.jobs.filter((j) => j.estado === 'FAILED').map((j) => j.name + ':' + (j.falha || '')).join(' | '));
}
