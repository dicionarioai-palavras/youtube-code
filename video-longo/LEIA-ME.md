> **Direção audiovisual vigente — 22/10/2026:** antes de produzir, ler canais/palavras/guias/PADRAO-DIRECAO-AUDIOVISUAL.md. Contexto integral e atmosfera precedem o prompt. Luiz em câmera real com ajustes de edição/Remotion; sem transformação facial. Guia visual e tipografia existentes continuam fontes; propostas antigas não viram aprovação. Cenas, metáforas e paleta adaptam-se a cada tema.

# Configuração compartilhada dos vídeos longos

Entrada: canais/palavras/guias/FLUXO-CONTINUO-VIDEO-LONGO.md, desde a raiz do projeto.

- padrao-palavras.json: regras compartilhadas e candidatos, sem decisão de estilo ou gasto presumida.
- diagnosticar.mjs: recebe configuração de qualquer tema, verifica arquivos e requisitos localmente; não gera, baixa, acessa rede ou mostra segredos.
- Dados de Inveja: canais/palavras/episodios/ep01-inveja/direcao-video/automacao/configuracao.json. Não embutir exceções narrativas no motor comum.

Na raiz: node code/video-longo/diagnosticar.mjs canais/palavras/episodios/ep01-inveja/direcao-video/automacao/configuracao.json

Credenciais ativas: RUNWAYML_API_SECRET e PIXABAY_API_KEY, carregadas pelo módulo comum code/apis-externas/src/config.mjs; Pexels fora da rota ativa. Não colar chaves em chat, arquivos JSON, comandos registrados ou relatórios. Este programa só confirma presença; não comprova validade da chave ou saldo. O carregador comum lê o .env local quando invocado pelo executor; não imprimir seu conteúdo.

A imagem exata de referência e o teto do piloto dependem de Luiz. Os executores de API, banco, composição e timeline não estão implementados neste módulo. O preparador anterior ainda é específico de Inveja; não foi generalizado por este diagnóstico. Priorizar uma integração validada antes do lote inteiro.


## Piloto integrado executado — 22/10/2026
Piloto completo Inveja em piloto-inveja/. Leia LEIA-ME dessa subpasta e a receita em canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v1/. A direção é por tema; o executor de API é compartilhado. Não executar fila antiga nem repetir geração ao retomar arquivos locais.


## Direção visual e prompts — regra vigente
Antes de gerar, ler DIRECAO-DE-PROMPTS.md. Detalhar e registrar aparência, materiais, contexto, fotografia, atuação, câmera, continuidade e custo. Base de atores retomada em identidade-visual/palavras/elenco/base-cinematografica-2026-10-22/.


## Rodada v3 — direção vigente
Teste integrado comPixabay/Runway/Remotion e Luiz real em canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v3/. Geradorpiloto-inveja-v3.mjs não é comando de remontagem: chamadas externas só nas etapas explícitas. Montagem local em montar-entrega-v3.mjs e Remotion scripts/render-piloto-v3.mjs. O teto76cr foi consumido nesta rodada; não reutilizar autorização como saldo de um lote novo.
