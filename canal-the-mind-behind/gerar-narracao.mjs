// The Mind Behind — gera a narração de um episódio pela API do ElevenLabs, bloco a bloco.
// Lê <episodio>/NARRACAO-ELEVENLABS.txt (blocos entre linhas =====), salva <episodio>/audio/<bloco>.mp3
// e registra tudo em <episodio>/audio/narracao-ledger.json. Não gera de novo o que já existe.
//
// Uso (na raiz Redes-sociais):
//   node code/canal-the-mind-behind/gerar-narracao.mjs <pasta-do-episodio> [--bloco 03-parte-2] [--refazer] [--simular]
//   --simular  só conta caracteres e confere o saldo, sem gerar
//   --texto NARRACAO-PT-BR.txt  --saida pt-br   outra versão do texto, gravada em audio/<saida>/ (ex.: faixa em português)
//   --velocidade 0.9  ritmo da fala (0,7 a 1,2; padrão do voz-config.json)
//   --estabilidade 0.4  sobrepõe o voz-config.json (menor = mais emoção; padrão 0,5)
//   --refazer  com --bloco, guarda a versão anterior em audio/versoes-antigas/<bloco>_vN.mp3 e gera de novo
import fs from 'node:fs';
import path from 'node:path';
import {loadExternalEnv} from '../apis-externas/src/config.mjs';
import {assinatura, vozes, falar} from '../apis-externas/src/elevenlabs.mjs';

loadExternalEnv();
const args = process.argv.slice(2);
const pasta = args[0];
if (!pasta) throw Error('Uso: gerar-narracao.mjs <pasta-do-episodio> [--bloco ID] [--refazer] [--simular]');
const opt = (n) => args.includes(n);
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);

const cfg = JSON.parse(fs.readFileSync(new URL('./voz-config.json', import.meta.url), 'utf8'));
if (val('--estabilidade')) cfg.estabilidade = Number(val('--estabilidade')); // --estabilidade 0.4: mais nuance (EP04, pedido de Luiz)
const arqTexto = val('--texto') || 'NARRACAO-ELEVENLABS.txt';
const txt = fs.readFileSync(path.join(pasta, arqTexto), 'utf8').replace(/\r\n/g, '\n').replace(/^﻿/, '');
const blocos = [...txt.matchAll(/BLOCO (\S+)[^\n]*\n=====\n([\s\S]*?)\n=====/g)].map((m) => ({id: m[1], texto: m[2].trim()}));
if (!blocos.length) throw Error('Nenhum bloco encontrado em ' + arqTexto);

const dirAudio = path.join(pasta, 'audio', val('--saida') || '');
fs.mkdirSync(dirAudio, {recursive: true});
fs.mkdirSync(dirAudio, {recursive: true});
const ledgerPath = path.join(dirAudio, 'narracao-ledger.json');
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {criado_em: new Date().toISOString(), geracoes: []};
const salvar = () => fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

const so = val('--bloco');
let fila = blocos.filter((b) => !so || b.id === so);
if (so && !fila.length) throw Error('Bloco não encontrado: ' + so);
if (!opt('--refazer')) fila = fila.filter((b) => !fs.existsSync(path.join(dirAudio, b.id + '.mp3')));

const maxChars = cfg.max_caracteres_por_bloco;
for (const b of fila) if (b.texto.length > maxChars) throw Error(`Bloco ${b.id} tem ${b.texto.length} caracteres (máx. ${maxChars}). Dividir o bloco no TXT.`);

const total = fila.reduce((s, b) => s + b.texto.length, 0);
const conta = await assinatura();
console.log(`Blocos a gerar: ${fila.length} · ${total} caracteres · restantes no plano: ${conta.restantes} (${conta.plano})`);
if (total > conta.restantes) throw Error('Caracteres insuficientes no plano. Nada foi gerado.');
if (opt('--simular') || !fila.length) process.exit(0);

const voz = (await vozes()).find((v) => v.nome === cfg.voz_nome);
if (!voz) throw Error(`Voz "${cfg.voz_nome}" não encontrada na conta.`);

for (const b of fila) {
  const destino = path.join(dirAudio, b.id + '.mp3');
  if (fs.existsSync(destino)) {
    const dirAntigas = path.join(dirAudio, 'versoes-antigas'); fs.mkdirSync(dirAntigas, {recursive: true});
    let n = 1; while (fs.existsSync(path.join(dirAntigas, `${b.id}_v${n}.mp3`))) n++;
    fs.renameSync(destino, path.join(dirAntigas, `${b.id}_v${n}.mp3`));
  }
  const inicio = Date.now();
  try {
    const r = await falar({voiceId: voz.voice_id, texto: b.texto, modelId: cfg.modelo, estabilidade: cfg.estabilidade, similaridade: cfg.similaridade, estilo: cfg.estilo, velocidade: Number(val('--velocidade')) || cfg.velocidade || null, formato: cfg.formato});
    fs.writeFileSync(destino, r.buffer);
    ledger.geracoes.push({bloco: b.id, arquivo: path.basename(destino), caracteres: b.texto.length, modelo: cfg.modelo, estabilidade: cfg.estabilidade, similaridade: cfg.similaridade, velocidade: Number(val('--velocidade')) || cfg.velocidade || null, request_id: r.requestId, segundos: Math.round((Date.now() - inicio) / 1000), em: new Date().toISOString()});
    salvar();
    console.log('OK', b.id, `${b.texto.length} caracteres`);
  } catch (e) {
    ledger.geracoes.push({bloco: b.id, erro: e.message, em: new Date().toISOString()}); salvar();
    console.log('ERRO', b.id, e.message);
    if (e.status === 401 || e.status === 402 || e.status === 429) break;
  }
}
console.log('FIM');
