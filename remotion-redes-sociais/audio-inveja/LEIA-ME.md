# Inveja S15–S25 — código-fonte do Remotion e scripts de áudio

Registrado em 31/10/2026. Renders locais, sem API/créditos.

- `src/inveja-s15-s18/index.tsx`, `src/inveja-s19-s20/index.tsx`, `src/inveja-s21-s25/index.tsx`: composições (1920×1080, 24 fps, sem áudio). IDs: inveja-s12 (arquivo S15–S18), inveja-s19, inveja-s21.
- `audio-inveja/`: `audio-lib.py` (sintetizador de efeitos: click, tick, pop, tap, whoosh, impact, roomtone) e `make-s15.py`, `make-s19.py`, `make-s21.py` (mixagem de música e efeitos por bloco, WAV 48 kHz).
- Dependências fora desta pasta: imagens e vídeos em `midias-compartilhadas` e em `palavras/youtube/peças/inveja/videos/imagens`; fontes Bebas Neue e Inter-500; músicas e efeitos em `audios/` (Biblioteca do YouTube; ver `audios/CATALOGO-E-LICENCAS.md`). Os caminhos dos scripts apontam para `/mnt/user-data/uploads/Redes-sociais/...` (ambiente da sessão) e precisam ser ajustados para rodar na máquina local.
- Os recursos redimensionados (public/img e public/vid) não foram guardados aqui; são regeneráveis a partir das fontes originais.
- Take de Luiz usado no S24: `midias-compartilhadas/luiz/youtube/inveja/video-bruto/20261031_001730.mp4` (4K, trecho de 1,7 s a 4,9 s do arquivo, conformado para 1080p/24 fps).
