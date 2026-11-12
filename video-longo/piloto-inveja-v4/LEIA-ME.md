# Piloto Inveja v4 — retomada

Execução autorizada em23/10/2026, cenas1–32. Não é executor genérico de todos os vídeos. Direção e documentação em canais/palavras/episodios/ep01-inveja/direcao-video/piloto-integrado-v4.

Etapas pagas já executadas: gerar-e-baixar.mjs image e video; não repetir com outros nomes nem alterar receita para provocar nova geração. IDs no ledger. Limite33cr; sem repetição. buscar-banco-saldo consulta APIs e usa cache.

Etapas locais: montagem-base.mjs prepara segmentos e quadros (reutiliza segmentos existentes); no projeto Remotion oficial, scripts/render-piloto-v4.mjs stills ou render; finalizar.mjs audio prepara stems sem API; finalizar.mjs monta entrega e verifica/consulta saldo. A montagem consome a voz pós-Premiere13:40 já mantida por Luiz. Não usar a outra v5 de17:38 com estes tempos.

Código auxiliar gerado por DeepSeek teve revisão do produtor; TSX final é editável. Pacote de entrega mantém11 cenas com grafismos incorporados, áudio separado e XML. Não prometer grafismos em camadas nativas do Premiere. Importação XML deve ser testada no editor.

Acabamento final: após renderizar o Remotion, rodar acabamento-direcao.mjs apply e depois finalizar.mjs. O acabamento preserva o render anterior com sufixo antes-acabamento; não aplicar novamente sobre o resultado, usar a fonte preservada. Ele ajusta câmera/luz localmente, sem APIs. Plano detalhado em direcao/PLANO-DE-ACABAMENTO.md do piloto.
