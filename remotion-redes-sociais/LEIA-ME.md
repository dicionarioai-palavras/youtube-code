# Remotion — estúdio de vídeos e imagens para redes sociais (projeto oficial)

> Projeto oficial desde 18/10/2026 (nasceu como POC no mesmo dia). É o motor da etapa de **construção** da esteira `_esteiras\cortes-redes-sociais`: um único projeto para todos os vídeos, marcas e temas.
> Os 3 vídeos da POC continuam em `out\` como referência.

## O que foi testado
| Vídeo de teste | Fonte | O que valida |
|---|---|---|
| `out\01-frase-escolhida.mp4` (11 s) | gravação de tela 720p (`2026-10-10 22-59-24`) | layout **tela**: fundo desfocado + recorte ampliado da área importante (esconde abas e o seu nome), legenda palavra a palavra, gancho máquina de escrever, **CTA** final, **trilha com ducking** (abaixa quando você fala) |
| `out\01-botao-da-foto.mp4` (8 s) | celular 4K HEVC vertical, 120 fps (`20261010_231243`) | layout **câmera**, dois trechos juntos (a pausa foi cortada), legenda, gancho |
| `out\01-botao-da-foto-pb.mp4` (8 s) | a mesma | **preto e branco + sem áudio original + trilha**: o formato pedido para o aquecimento de voz e o canto |

A trilha é um **tom de teste** gerado por código (`public\trilhas\tom-de-teste.mp3`), não música. Só serve para mostrar o volume abaixando durante a fala.

## Resultados
- **Qualidade:** legenda animada, gancho e CTA saem nítidos, com controle total de fonte, cor e posição. A legenda sai da transcrição do Whisper e acertou todas as palavras dos dois vídeos.
- **Tempo de render no ambiente de teste (2 núcleos):** de 8,5x a 11x o tempo do vídeo (8 s levaram cerca de 70 s). No seu notebook (4 núcleos/8 threads) deve ficar perto da metade disso. Um corte de 30 s deve levar de 2 a 4 min, sem tokens.
- **Preparação (proxy):** cortar e converter o trecho 4K HEVC para 1080p levou cerca de 25 s para 8 s de vídeo. A gravação de tela leva 2 s.
- **Ajustes já feitos durante a POC:** o recorte da tela foi aproximado para ficar legível e o contorno da legenda foi trocado por uma técnica que funciona em qualquer renderizador.
- **Pontos a melhorar (normal de POC):** o contorno da legenda pode ficar mais grosso; o tamanho e a posição da legenda e do gancho dependem da identidade visual (tudo está centralizado em `src\estilo.ts`).

## Como rodar no seu PC (Windows)
Pré-requisito: Node 18 ou mais novo (`node -v`).
```powershell
cd C:\Users\Dell\Desktop\Redes-sociais\code\remotion-redes-sociais
npm install          # 1ª vez (baixa o Remotion; na 1ª renderização ele baixa um Chrome próprio)
npm run dev          # abre o Remotion Studio no navegador: preview ao vivo, linha do tempo e props editáveis
npm run render       # renderiza todos os cortes de src\cortes.json para out\ e mostra o tempo de cada um
```
No Studio você pode mudar textos, cores e o gancho em `src\estilo.ts` e em `src\cortes.json` e ver o resultado na hora.

## Como entra um corte novo (sem IA)
O `scripts\preparar.mjs` lê o `cortes.json` aprovado e a transcrição do Whisper da pasta do vídeo, gera os proxies e calcula a legenda:
```powershell
node scripts\preparar.mjs --video "C:\Users\Dell\Desktop\Redes-sociais\canais\palavras\episodios\ep01-inveja\sessoes-brutas\20261010_231243" --corte 01-botao-da-foto --marca luiz --gancho "Bastidor: o erro clássico" --gancho-ate 2.5
```
Opções: `--layout tela --regiao x,y,w,h` (gravação de tela) · `--pb` (preto e branco) · `--mudo` (sem áudio original) · `--cta "texto"` · `--trilha trilhas\musica.mp3 --volume 0.2` · `--id` (para variações do mesmo corte). O ffmpeg usado é o da esteira (`_esteiras\cortes-redes-sociais\bin`).

## Estrutura
```
src\Corte.tsx               composição do corte (clipes em sequência + trilha + camadas)
src\componentes\Fundo.tsx   layouts câmera e tela, filtro P&B
src\componentes\Legenda.tsx legenda palavra a palavra com destaque
src\componentes\Gancho.tsx  texto com efeito máquina de escrever
src\componentes\CTA.tsx     cartela final
src\estilo.ts               identidade visual por marca (PROVISÓRIA)
src\cortes.json             cortes preparados (gerado pelo preparar.mjs)
public\clips\               proxies dos trechos   public\fonts\  Poppins e Courier Prime
scripts\                    preparar.mjs e render-todos.mjs
```

## Conclusão para a esteira
O Remotion substitui com vantagem o rascunho em ffmpeg (`_rascunho-render`) na etapa de construção: o mesmo projeto pode gerar vídeos e imagens (carrossel/thumbnail com `renderStill`), e a identidade visual vira código versionado. Licença gratuita para quem trabalha sozinho (até 3 pessoas).
Falta decidir na ativação: o fluxo do Adobe Podcast (exportar a voz do corte, trocar pelo áudio melhorado) e os modelos finais da identidade visual.

## Laboratório: montagem com todas as hipóteses (18/10/2026)
Vídeo: `out\montagem-bastidores-inveja.mp4` (~54 s), composição `montagem-bastidores-inveja` (`src\montagem\`), dados em `src\montagem.json`.
Receita usada: `scripts\lab\montagem_inveja.py` + `scripts\lab\spots.py` + `scripts\lab\rosto.py` (rodaram no ambiente do Claude; os caminhos são de lá, vão virar o `preparar.mjs` oficial).

| Hipótese | Como foi feito | Resultado |
|---|---|---|
| Abertura no palavras.co | zoom na barra de endereço, depois afasta para o site inteiro | ✅ funciona; o público vê onde é antes de tudo |
| Corte seco automático | silêncios removidos pela transcrição (tempo de cada palavra) | ✅ ritmo bem mais rápido, sem edição manual |
| Gancho máquina de escrever + som de tecla | caractere a caractere, com "tic" sincronizado | ✅ |
| Zoom de ênfase | "soco" de zoom na palavra marcada, centrado no rosto | ✅ |
| Quadro congelado + carimbo "ERRO #1" + tremida + boom | inserido logo após "Burro!" | ✅ forte para bastidor |
| Sticker na palavra-chave | "DESEJO MESQUINHO" entra girando com "pop" | ✅ |
| Censura automática | palavrão: áudio mudo + bipe, legenda "M***A" | ✅ |
| Destaque do trecho mencionado no site | a fala cita uma palavra que aparece na tela → OCR acha a linha → zoom nela + desfoque/escurece o resto + contorno brilhante | ✅ 4 destaques automáticos; precisa de filtro para não pegar menu/cabeçalho (já ignora o topo) |
| Transição site ↔ vídeo | zoom + desfoque (o bloco que sai acelera para dentro, o que entra assenta) + whoosh | ✅ substituiu a faixa diagonal |
| Cartão de etimologia | ao abrir o verbete: palavra digitada, linha desenhada, partes do étimo | ✅ texto PROVISÓRIO; na versão real vem do verbete do palavras.co |
| Onda de voz | barras animadas pelo áudio nos trechos de tela | ⚠️ funciona, mas fraca com voz baixa; ajustar ganho |
| Rastreamento de rosto | OpenCV (Haar) | ⚠️ fraco em perfil; para valer, usar MediaPipe/YuNet |
| Barra de progresso, granulado, CTA + "Comenta:..." e loop | final desfoca o começo e "emenda" | ✅ |
| Trilha com ducking + SFX | sons sintetizados (whoosh, pop, bipe, boom, tic) | ✅ mecânica ok; trocar por trilha e SFX reais |

**Custo de render (ambiente de 2 núcleos):** ~14x o tempo do vídeo (desfoques, granulado e onda pesam). No seu notebook, estimativa de 5 a 7x: ~5 min para 54 s.

## Entregas e remix depois do Adobe Podcast (rodada 2 do tema Inveja, 18/10/2026)
Fluxo de uma peça, do render até o `final-*.mp4` com a voz tratada:

1. **Render do lote** (um bundle só): `node scripts/render-lote.mjs out\r2 <id> [<id> ...]`
   - gera `<id>.mp4` (mix `completo`) e as mixagens `<id>.<mix>.wav`: `sem-trilha`, `voz`, `sem-voz`, `efeitos` (sem voz original: só `sem-trilha`).
   - Mixagens (`inputProps.mix`, ver `src\tipos.ts`): `completo` = voz + trilha + efeitos · `sem-trilha` = voz + efeitos · `voz` = só a voz · **`sem-voz`** = trilha + efeitos com os clipes mudos · **`efeitos`** = só os efeitos.
2. **Entregas na pasta da peça:** `node scripts/entregar.mjs out\r2 "<pasta da peça>" <id>[:<marca>] ...`
   - `final-<marca>.mp4` (loudnorm −14 LUFS), `final-<marca>-sem-trilha.mp4` (só com trilha da Biblioteca do YouTube; trilha CC BY = versão única), `capa-<marca>.png`, `para-adobe.mp4` (só a voz) e a subpasta `_mix\` (vídeo sem áudio, `sem-voz.wav`, `efeitos.wav`, `manifesto.json`).
3. **Adobe Podcast (Luiz):** subir `para-adobe.mp4` inteiro (Speech 70, Music 0, Background 0) e salvar o resultado na mesma pasta como **`adobe.mp4`**.
4. **Remix:** avisar o Claude "voz do Adobe pronta" ou rodar
   `node scripts\remix-adobe.mjs "<pasta da peça>" [...] --ffmpeg ..\..\_esteiras\cortes-redes-sociais\bin\ffmpeg.exe`
   - refaz `final-<marca>.mp4` = vídeo + (voz do Adobe + `sem-voz`) e `final-<marca>-sem-trilha.mp4` = vídeo + (voz do Adobe + `efeitos`), com loudnorm −14 LUFS. O vídeo vem do `para-adobe.mp4` (ou de `_mix\` nas marcas extras), então pode rodar quantas vezes quiser.
   - Depois do remix, a peça passa a `pronto` (checklist em `_esteiras\cortes-redes-sociais\PECAS.md`).

Outras novidades:
- `Clip.regiao` (opcional): região própria de um clipe no layout `tela` (ex.: a anáfora troca do chat para a página do dicionário).
- `scripts\capas\capas_rodada2_inveja.py`: capas da rodada 2 no molde aprovado; o rosto é posicionado sozinho pela máscara (cabeça ~560 px, olhos ~y 870); nas capas sem rosto, recorte P&B da tela.
- `scripts\preparar.mjs` agora lê a rotação também em ffprobe antigo (`-show_streams`).

### Revisão de 19/10/2026
- **Palavrões:** `censura: [[ini, fim], ...]` em `src\cortes.json` (segundos do vídeo final) corta o som original nessas janelas (`Fundo.tsx`, volume por quadro); a legenda mostra `****`. Vale também na mixagem `voz` (para o Adobe).
- **Fim por marca:** `capa` + `capaDur` definem a imagem final. Palavras: `marca/palavras-final.png` (logo completo, 1,2 s). luiz: sem `capa` (termina na cartela).
- **Logo:** `public\marca\palavras-logo-{grafite|osso|terracota}.svg` e `palavras-icone-*.svg`.
- **Capas editoriais:** `python scripts\capas\capas_editoriais.py <saída> <pasta de quadros 4K>` gera E1 colagem, E2 meio rosto e E3 foto real por peça (`public\capas\editoriais\`); o `entregar.mjs` copia para as pastas das peças. Especificação: `identidade-visual\palavras\04-sistema-visual\base-existente\CAPAS-EDITORIAIS-v1.md`.
- **render-lote:** renderiza `voz`, `sem-voz` e `efeitos`; o `sem-trilha` sai por soma no ffmpeg (voz + efeitos), sem um render a mais.

### Fim por marca e nomes de postagem (19/10/2026, última etapa do fluxo)
Ordem: `render-lote.mjs` → `entregar.mjs` → Adobe Podcast → `remix-adobe.mjs` → **`fim-por-marca.mjs`**.
- `node scripts\render-cartelas.mjs <id> ...` renderiza só a cartela final do Palavras (logo oficial) em `out\cartelas\<id>.mp4`.
- `node scripts\fim-por-marca.mjs "<pasta da peça>" <id>:<marca>[:so-shorts] ... --ffmpeg <ffmpeg>`: luiz corta no fim do conteúdo, sem cartela; Palavras recebe a cartela única. Grava os arquivos com o destino no nome (`<marca>--postar-no-...mp4`) e apaga os `final-*.mp4` intermediários.
- Composições: luiz sem `cta` e sem `capa` (termina no conteúdo); Palavras com `cta` e sem `capa` (`estilo.ts`: `ctaLogo`).

### Flip "corta/câmera" (20/10/2026)
- Pedido do Luiz: alternar rápido entre duas capas da peça `aqui-e-bastidor` (`capa-luiz-l-exp.png` = "CORTA ISSO AÍ" e `capa-luiz-l-edi.png` = "EU E ESSA CÂMERA…"), como GIF, com trilha.
- Composição **`flip-corta-camera`** em `src\Flip.tsx` (1080×1920, 30 fps, 189 quadros ≈ 6,3 s): 8 trocas a cada 2 batidas, whip de 4 quadros com desfoque, "soco" de zoom e flash curto. Assets em `public\flip\`.
- Trilha: `Batty McFaddin - Silent Film Light` (Kevin MacLeod, 152 BPM, CC BY) — crédito obrigatório na legenda. Render entregue na Área de Trabalho; áudio normalizado a −14 LUFS no ffmpeg depois do render.
- Re-render: `npx remotion render src/index.ts flip-corta-camera out/flip-corta-camera.mp4 --codec=h264 --crf=18`.
- Versão GIF (pedido seguinte): 360×640, 20 fps, paleta de 256 cores, sem áudio — o GIF em 1080p passava de 27 MB; assim ficou em ~10 MB.

### Abertura de canal "palavras-abertura" (20/10/2026)
- Pedido do Luiz: vinheta de 6–8 s, 9:16, ligando os dois campos abstratos ao logo 3D, com a trilha já usada.
- Composição **`palavras-abertura`** em `src\PalavrasSting.tsx` (1080×1920, 30 fps, **189 quadros = 6,3 s**, 4 compassos a 152 BPM).
- Estrutura: compasso 1 = arco laranja se desenha no campo creme; compasso 2 = P sobe; compasso 3 = corte seco para o campo noite, círculo branco entra atrás do P; compasso 4 = logo respira. A ponta do arco passa por trás do círculo no corte.
- Assets em `public\palavras\`: `campo-creme.png`, `campo-noite.png`, `logo-3d.png` e `glifo-grafite.png` (P extraído com alpha do render). O arco é desenhado em SVG no componente (stroke animado), não usa o PNG extraído.
- Render: `npx remotion render src/index.ts palavras-abertura out/palavras-abertura.mp4 --codec=h264 --crf=18`.
- Pós: loudnorm a −14 LUFS + fades de 0,08 s/0,32 s → `out\palavras-abertura-final.mp4`; entrega em `Desktop\palavras-abertura-canal.mp4` (6,32 s).
- Trilha: `Batty McFaddin - Silent Film Light` (Kevin MacLeod, CC BY 4.0) — crédito em `Desktop\CREDITO-TRILHA-palavras-abertura.txt`.
- Norte do logo e leitura do acervo (802 imagens): `identidade-visual\palavras\04-sistema-visual\NORTE-LOGO-E-LEITURA-DO-ACERVO-2026-10-20.md`.
