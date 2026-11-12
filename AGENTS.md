# Código do projeto — instruções

Leia `AGENTS.md` da raiz e `_governanca/COMO-TRABALHAR-COM-IA.md`. Preserve implementações e peças existentes. Só esta pasta é versionada no Git (repositório `youtube-code`): sem mídia, `node_modules`, `out/`, `.env` nem credenciais.

| Pasta | O que tem |
|---|---|
| `ciclo/` | ciclo de cada vídeo: `novo_video.py`, `painel.py`, `conferir.py` (ver `_governanca/CICLO-LEAN.md`) |
| `cronograma/` | geradores da agenda diária e dos cronogramas (ver `cronograma/LEIA-ME.md`, na raiz) |
| `canal-the-mind-behind/` | imagens, narração e montagem do The Mind Behind (`code/canal-the-mind-behind/LEIA-ME.md`) |
| `remotion-redes-sociais/` | Remotion oficial (`code/remotion-redes-sociais/LEIA-ME.md`) |
| `video-longo/` | direção de prompts, trilha e pilotos do vídeo longo do Palavras |
| `apis-externas/` | configuração comum de APIs (`code/apis-externas/LEIA-ME.md`) |
| `blog-publicacao/` | publicação de artigos do blog |
| `processos/` | gerador do fluxograma de processos (histórico em `_historico/2026-10-31-fluxograma-processos`) |

Direção audiovisual: `canais/palavras/guias/PADRAO-DIRECAO-AUDIOVISUAL.md`.

## APIs externas — padrão obrigatório (22/10/2026)
Configuração comum em code/apis-externas/LEIA-ME.md. Todo executor de API externa deste projeto deve carregar o ambiente com src/config.mjs desse módulo, ou usar seu wrapper executar.mjs. Credenciais ficam somente em code/apis-externas/.env (local, ignorado pelo Git), ou em variáveis já existentes no processo; nunca em código, dados de tema ou chat. Não imprimir valores/headers/process.env. Diagnósticos mostram somente presença, sem alegar validade remota. Não ler .env para relatórios nem mostrar trechos de suas linhas. Para verificar usar status.mjs.

Salvar chaves não autoriza geração paga, compra ou contratação. Consultar saldo/preços, calcular lote e definir limite antes de gasto. Novos serviços são incorporados ao módulo comum quando necessários; não duplicar configuração por tema. Registrar alterações e próximos passos nos arquivos responsáveis.

## Direção completa nas gerações — Luiz,22/10/2026
Antes de qualquer geração de imagem/vídeo, ler code/video-longo/DIRECAO-DE-PROMPTS.md. Registrar direção e prompt realmente enviado, referências e hashes, atores/pigmentação/proporções, materiais, cenário, fotografia, atuação/câmera, continuidade, modelo e custo. Aplicar detalhes essenciais no pedido, não só na ficha; não prometer que o modelo obedeceu sem conferir. Luiz permanece real; aplicar ajustes de montagem/Remotion com aparência e fala preservadas. Transformação/caricatura de Luiz foi revogada. O catálogo de atores atual está em identidade-visual/palavras/elenco/base-cinematografica-2026-10-22/. Não confundir atores recusados do piloto1 com essa base.
