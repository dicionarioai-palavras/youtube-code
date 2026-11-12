// Cliente ElevenLabs do projeto (narração). Nunca imprime a chave nem respostas brutas.
import {getCredential} from './config.mjs';
const BASE = 'https://api.elevenlabs.io';

async function api(route, {method = 'GET', body, query, binary = false, timeout = 120000} = {}) {
  const url = new URL(BASE + route);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, String(v));
  const chave = getCredential('elevenlabs');
  let r;
  try {
    r = await fetch(url, {
      method,
      headers: {'xi-api-key': chave, ...(body ? {'Content-Type': 'application/json'} : {})},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
      redirect: 'error',
    });
  } catch {
    throw Error('Falha de conexão com o ElevenLabs (chave e resposta omitidas).');
  }
  if (!r.ok) {
    let det = '';
    try { const j = await r.json(); det = j?.detail?.status || j?.detail?.code || ''; } catch {}
    const e = Error(`ElevenLabs HTTP ${r.status}${det ? ' (' + det + ')' : ''}`); e.status = r.status; throw e;
  }
  if (binary) return {buffer: Buffer.from(await r.arrayBuffer()), headers: r.headers};
  return r.json();
}

export async function assinatura() {
  const d = await api('/v1/user/subscription');
  return {plano: d.tier, usados: d.character_count, limite: d.character_limit, restantes: d.character_limit - d.character_count,
    renova_em: d.next_character_count_reset_unix ? new Date(d.next_character_count_reset_unix * 1000).toISOString() : null};
}

export async function vozes() {
  const d = await api('/v1/voices');
  return (d.voices || []).map((v) => ({voice_id: v.voice_id, nome: v.name, categoria: v.category}));
}

export async function ultimasGeracoes(n = 5) {
  const d = await api('/v1/history', {query: {page_size: n}});
  return (d.history || []).map((h) => ({quando: new Date(h.date_unix * 1000).toISOString(), voz: h.voice_name, voice_id: h.voice_id,
    modelo: h.model_id, ajustes: h.settings, caracteres: h.character_count_change_to - h.character_count_change_from}));
}

export async function modelos() {
  const d = await api('/v1/models');
  return d.map((m) => ({model_id: m.model_id, nome: m.name, max_caracteres: m.maximum_text_length_per_request ?? null}));
}

// Gera fala. Retorna o MP3 e o id da requisição (para conciliação no histórico do ElevenLabs).
export async function falar({voiceId, texto, modelId, estabilidade, similaridade, estilo = 0, velocidade = null, formato = 'mp3_44100_192'}) {
  const {buffer, headers} = await api(`/v1/text-to-speech/${voiceId}`, {
    method: 'POST', binary: true, query: {output_format: formato},
    body: {text: texto, model_id: modelId, voice_settings: {stability: estabilidade, similarity_boost: similaridade, style: estilo, use_speaker_boost: true, ...(velocidade ? {speed: velocidade} : {})}},
    timeout: 300000,
  });
  return {buffer, requestId: headers.get('request-id') || headers.get('history-item-id') || null, custo: headers.get('character-cost') || null};
}
