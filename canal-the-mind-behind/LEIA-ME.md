# code/canal-the-mind-behind — automação do canal

Camada de chamadas às APIs para a IA produzir o episódio de ponta a ponta. Chaves só no `.env` de `code/apis-externas` (nunca no chat, em JSON ou em log). Todo gasto passa por saldo conferido antes e fica registrado em ledger na pasta do episódio.

| Etapa | Script | Serviço | Registro |
|---|---|---|---|
| Imagens | `gerar-imagens.mjs <cenas.json> <pasta> <ancoras\|cenas> [teto]` (EP01) | Runway (API) | `imagens/runway-ledger.json` |
| Imagens e planos em vídeo em lote (EP02+) | `runway-lote.mjs <cenas.json> <pasta> --etapa X [--so a,b] --teto N --tempo 95` — 3 em paralelo, retomável em chamadas curtas, refação com nome novo (b, c) | Runway (API) | `imagens/runway-ledger.json` |
| Narração | `gerar-narracao.mjs <episódio> [--bloco ID] [--refazer] [--simular]` | ElevenLabs (API) | `audio/narracao-ledger.json` |
| Conferência da narração | `python conferir-narracao.py <episódio> [--palavras]` (`--palavras` grava `montagem/transcricao-palavras.json` para a montagem) | local (faster-whisper) | `audio/CONFERENCIA.md` |
| Status da conta ElevenLabs | `node code/apis-externas/src/elevenlabs-status.mjs` | ElevenLabs | — |
| Cartelas, thumbs, Shorts | `code/remotion-redes-sociais` (composições `tmb-*`) | local | — |

Configuração da voz: `voz-config.json` (padrão aprovado em 05/11/2026: estabilidade 0,5, similaridade 0,75, texto sem marcações e tags de emoção só em momentos de ênfase).

## Primeira vez (Luiz)
1. ElevenLabs → **Developers → API Keys → Create** (permissões: Text to Speech, Voices, History, User: leitura). Copiar a chave.
2. Abrir `code\apis-externas\.env` no Bloco de Notas e colar depois de `ELEVENLABS_API_KEY=` (sem espaço, sem aspas). Salvar.
3. Avisar a IA. Ela roda o status (sem mostrar a chave), descobre o modelo usado nos testes e completa o `voz-config.json`.

## Montagem (desde o EP01)
1. `montagem/plano.py` — lê as palavras com tempo da transcrição (faster-whisper) e as âncoras de cada cena → `ep0X-timeline.json` + mix de áudio (narração −16 LUFS por bloco, trilha com ducking, final −14 LUFS / TP −1).
2. Copiar o JSON para `remotion-redes-sociais/src/canal-dark/` e as imagens (jpg, 1920 de largura) para `public/ep0X/`.
3. `node scripts/render-tmb-episodio.mjs` — renderiza o vídeo mudo (sem a textura animada: ~1 h para 10 min) e as thumbs; depois juntar com o mix no ffmpeg.
4. `montagem/shorts.py` — recorta os Shorts por frase de início/fim → `ep0X-shorts.json`; `node scripts/render-tmb-shorts.mjs` renderiza e põe o áudio do trecho.
Os scripts ainda têm caminhos do EP01 fixos; generalizar no EP02.

## Montagem v2 (desde o EP02 — direção visual v2)
Rodar na nuvem/PC com Chrome (o shell remoto não tem). Tudo sai da pasta do episódio.
1. `python conferir-narracao.py <episódio> --palavras` → `audio/CONFERENCIA.md` + `montagem/transcricao-palavras.json`.
2. Escrever `montagem/plano.json` (cena por frase da narração, com `mov`/`foco`/`escala`/`destino`, `corte` seco e `pista`; cartelas `ficha`, `nomes`, `mapa`, `dados`, `citacao` com os dados no próprio plano) e rodar `python montagem/plano_v2.py <episódio>` → `montagem/timeline.json`.
3. Copiar a timeline para `remotion-redes-sociais/src/canal-dark/epNN-timeline.json` e as imagens/vídeos (jpg 1920, mp4) + `grao.png` para `public/epNN/`. Componente `EpisodioV2` (o EP01 continua no `Episodio` v1).
4. `node scripts/render-tmb-ep02.mjs [parte] [partes] [concurrency]` — render em partes (frameRange); juntar com ffmpeg concat.
5. `python montagem/mix_v2.py <episódio> <trilha.mp3> [ambiente.mp3]` → `audio/mix/EPNN-mix-final.flac` (-14 LUFS / TP -1,5) e `audio/mix/trilha-cama.wav`.
6. Faixa PT-BR: `montagem/orcamento_pt_br.py <episódio>` → gerar `--texto NARRACAO-PT-BR.txt --saida pt-br` → `python montagem/faixa_pt_br.py <episódio>` (máx. 3% de aceleração) → `final/pt-br/`.
7. Thumbs: `thumbs/thumbs_ep02.py` (receita 6c) com `TMB_IMAGENS=<pasta dos jpg>`.

## Shorts originais (desde o lote 0, 06/11/2026)
| Etapa | Script |
|---|---|
| Narração | `gerar-narracao.mjs <lote> --texto NARRACAO.txt` (PT: `--texto NARRACAO-PT-BR.txt --saida pt-br`) |
| Conferência | `transcrever_shorts.py <lote>` (faster-whisper small.en; grava `transcricao.json`) |
| Imagens 9:16 | `gerar-imagens-lote.mjs <lote>/imagens/pedidos.json <lote>/imagens enviar` e depois `... baixar` (duas fases curtas; `--refazer-falhas`; ledger `imagens/runway-ledger.json`). Pedidos gerados por `<lote>/imagens/cenas.py` |
| Folha de contato | `contato.py saida.jpg img1 img2 ...` |
| Timeline | `montagem/shorts_originais_montar.py` (dentro da pasta de trabalho com `transcricao.json`, `cenas.json`, `troca.json`) → `remotion-redes-sociais/src/canal-dark/lote00-shorts.json` |
| Mix | `montagem/shorts_originais_mix.py en|pt` (LOTE=<pasta de trabalho>) |
| Render | `remotion-redes-sociais/scripts/render-tmb-shorts-originais.mjs <pasta-mix> <saida>` (composições `tmb-lote00-*`, componente `src/canal-dark/ShortOriginal.tsx`) |
Detalhes e lições: `canais/the-mind-behind/shorts/lote-00/ESTADO.md`.
