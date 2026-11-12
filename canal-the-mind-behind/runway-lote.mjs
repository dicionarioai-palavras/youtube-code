// The Mind Behind — gera um lote de imagens (text_to_image) e planos em vídeo (image_to_video) no Runway pela API.
// Feito para o EP02 (06/11/2026): vários pedidos em paralelo (o plano da API aceita 3 simultâneos), retomável em
// chamadas curtas (cada execução trabalha até --tempo segundos e para; a seguinte retoma pelos IDs do ledger, sem novo POST).
// Mesmas travas do executor comum (code/apis-externas/src/runway-gerar.mjs): preço conferido no calculador, saldo conferido
// antes de enviar, teto por ledger, receita (hash) imutável por nome, nada de reenviar envio incerto, chave nunca impressa.
// Não usa arquivo de trava (a pasta do Luiz não permite apagar arquivos; a trava antiga travava o lote seguinte).
//
// Uso (na raiz Redes-sociais):
//   node code/canal-the-mind-behind/runway-lote.mjs <cenas.json> <pasta-saida> [--etapa ancoras|cenas|videos] [--so a,b,c]
//        [--teto 900] [--tempo 140] [--simultaneos 3] [--simular]
// Cada item do JSON: {name, etapa, model, expectedCredits, promptText, refs?:[{tag,file}], tipo?:'video', imagem?, duracao?}
// refs/imagem: caminho relativo à pasta de saída (ou ao diretório atual, se não existir lá).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadExternalEnv, getCredential} from '../apis-externas/src/config.mjs';
import {getRunwayBalance} from '../apis-externas/src/runway-saldo.mjs';
import {estimate} from '../apis-externas/src/runway-custos.mjs';

loadExternalEnv();
const args = process.argv.slice(2);
const [cenasArq, saida] = args;
const val = (n, d = null) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
if (!cenasArq || !saida) throw Error('Uso: runway-lote.mjs <cenas.json> <pasta-saida> [--etapa X] [--so a,b] [--teto N] [--tempo s]');
const teto = Number(val('--teto', 150));
const tempo = Number(val('--tempo', 140)) * 1000;
const simult = Number(val('--simultaneos', 3));
const etapa = val('--etapa');
const so = val('--so') ? val('--so').split(',') : null;
const inicio = Date.now();
fs.mkdirSync(saida, {recursive: true});

let lista = JSON.parse(fs.readFileSync(cenasArq, 'utf8'));
if (etapa) lista = lista.filter((c) => c.etapa === etapa);
if (so) lista = lista.filter((c) => so.includes(c.name));

const ledgerPath = path.join(saida, 'runway-ledger.json');
const ler = () => (fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {ceiling: teto, created_at: new Date().toISOString(), jobs: []});
let ledger = ler();
ledger.ceiling = Math.max(ledger.ceiling || 0, teto);
const salvar = () => fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

const arquivo = (f) => (fs.existsSync(path.join(saida, f)) ? path.join(saida, f) : f);
const dataUri = (f) => {
  const p = arquivo(f);
  const mime = p.endsWith('.jpg') || p.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
};

async function api(route, options = {}) {
  let r;
  try {
    r = await fetch('https://api.dev.runwayml.com/v1/' + route, {
      ...options,
      headers: {Authorization: 'Bearer ' + getCredential('runway'), 'X-Runway-Version': '2024-11-06', 'Content-Type': 'application/json'},
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw Error('Conexão Runway interrompida (nenhum POST é repetido automaticamente).');
  }
  if (!r.ok) {
    let det = '';
    try { const j = await r.json(); det = j?.error || ''; } catch {}
    const e = Error('Runway HTTP ' + r.status + (det ? ' ' + String(det).slice(0, 200) : '')); e.status = r.status; throw e;
  }
  return r.json();
}

function receita(c) {
  if (c.tipo === 'video') {
    const body = {model: c.model, promptImage: dataUri(c.imagem), promptText: c.promptText, ratio: c.ratio || '1280:720', duration: c.duracao || 5};
    const custo = estimate({model: c.model, seconds: body.duration}).credits;
    return {endpoint: 'image_to_video', body, custo, ext: '.mp4'};
  }
  const body = {model: c.model, ratio: c.ratio || '1920:1080', promptText: c.promptText};
  if (c.refs) body.referenceImages = c.refs.map((r) => ({tag: r.tag, uri: dataUri(r.file)}));
  const custo = estimate({model: c.model, resolution: '1080p'}).credits;
  return {endpoint: 'text_to_image', body, custo, ext: '.png'};
}

const feitos = (c) => fs.existsSync(path.join(saida, c.name + (c.tipo === 'video' ? '.mp4' : '.png')));
const fila = lista.filter((c) => !feitos(c));
// Tarefa que falhou no Runway (sem custo) pode ser reenviada: o registro antigo fica no ledger como <nome>@falhaN.
for (const c of fila) {
  const j = ledger.jobs.find((x) => x.name === c.name);
  if (j && ['FAILED', 'CANCELLED'].includes(j.state)) {
    let n = 1; while (ledger.jobs.find((x) => x.name === `${c.name}@falha${n}`)) n++;
    j.name = `${c.name}@falha${n}`; j.expected_credits_original = j.expected_credits; j.expected_credits = j.cost?.credits ?? j.expected_credits;
  }
}
const novos = fila.filter((c) => !ledger.jobs.find((j) => j.name === c.name));
const previstos = novos.reduce((s, c) => s + c.expectedCredits, 0);
const reservado = ledger.jobs.reduce((s, j) => s + (j.expected_credits || 0), 0);
console.log(`${fila.length} de ${lista.length} a fazer · ${novos.length} novos (${previstos} créditos) · já no ledger: ${reservado} · teto ${ledger.ceiling}`);
if (args.includes('--simular')) process.exit(0);
if (reservado + previstos > ledger.ceiling) throw Error('Teto de créditos do ledger seria excedido. Nada enviado.');
if (novos.length) {
  const saldo = await getRunwayBalance();
  console.log('saldo antes:', saldo.credit_balance);
  ledger.saldos = ledger.saldos || [];
  ledger.saldos.push({em: new Date().toISOString(), saldo: saldo.credit_balance});
  if (saldo.credit_balance < previstos) throw Error('Saldo insuficiente. Nada enviado.');
  salvar();
}

const ativos = () => ledger.jobs.filter((j) => j.id && ['PENDING', 'RUNNING', 'THROTTLED', 'SUBMITTED'].includes(j.state)).length;

async function enviar(c) {
  const {endpoint, body, custo, ext} = receita(c);
  if (custo !== c.expectedCredits) throw Error(`${c.name}: preço ${custo} diferente do previsto ${c.expectedCredits}`);
  const hash = crypto.createHash('sha256').update(JSON.stringify({endpoint, body})).digest('hex');
  const job = {name: c.name, hash, endpoint, ext, expected_credits: custo, model: c.model, state: 'SUBMITTING', created_at: new Date().toISOString()};
  ledger.jobs.push(job); salvar();
  try {
    const t = await api(endpoint, {method: 'POST', body: JSON.stringify(body)});
    job.id = t.id; job.state = 'PENDING'; salvar();
    console.log('enviado', c.name);
  } catch (e) {
    job.state = 'SUBMISSION_UNCERTAIN'; job.http_status = e.status ?? null; job.erro = e.message; salvar();
    console.log('ERRO no envio', c.name, e.message);
  }
}

async function acompanhar(job) {
  const t = await api('tasks/' + job.id);
  job.state = t.status; job.cost = t.cost ?? null;
  if (t.status === 'SUCCEEDED') {
    const file = path.join(saida, job.name + job.ext);
    if (!fs.existsSync(file)) {
      const r = await fetch(t.output[0], {signal: AbortSignal.timeout(120000)});
      if (!r.ok) throw Error('Download HTTP ' + r.status);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    }
    job.file = path.basename(file);
    job.sha256 = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    job.finished_at = new Date().toISOString();
    console.log('OK', job.name);
  } else if (['FAILED', 'CANCELLED'].includes(t.status)) {
    job.failure = t.failure || t.failureCode || null;
    console.log('FALHOU', job.name, job.failure || '');
  }
  salvar();
}

let pendentes = [...novos];
while (Date.now() - inicio < tempo) {
  while (pendentes.length && ativos() < simult) await enviar(pendentes.shift());
  const abertos = ledger.jobs.filter((j) => j.id && lista.find((c) => c.name === j.name) && !feitos({name: j.name, tipo: j.ext === '.mp4' ? 'video' : ''}) && !['FAILED', 'CANCELLED'].includes(j.state));
  if (!abertos.length && !pendentes.length) break;
  for (const j of abertos) {
    try { await acompanhar(j); } catch (e) { console.log('aviso', j.name, e.message); }
  }
  await new Promise((r) => setTimeout(r, 6000));
}
const falta = lista.filter((c) => !feitos(c)).map((c) => c.name);
console.log(falta.length ? `PARCIAL: faltam ${falta.length}: ${falta.join(', ')}` : 'FIM: lote completo');
