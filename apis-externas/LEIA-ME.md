> **Estado vigente — 22/10/2026:** Runway e Pixabay configurados e testados; não solicitar novamente chaves já presentes. Credenciais somente no .env local. Inveja teve três rodadas: saldo após v3 de 714 créditos, sem autorização automática de novo lote. Ler palavras/youtube/guias/PADRAO-DIRECAO-AUDIOVISUAL.md antes de gerar. Gen-4 Image/Turbo e Gen-4.5 têm validação local de prompt; direção completa e texto enviado são registros distintos. Os estados antigos de espera abaixo são históricos.

> **Atualização 22/10/2026:** Pexels fora do fluxo ativo. Unsplash configurado e busca autenticada testada (fotos); Pixabay recomendado para fotos/vídeos, aguardando chave. Preencher PIXABAY_API_KEY no .env. Unsplash: UNSPLASH_ACCESS_KEY; APP_ID/SECRET_KEY não são usados na busca. Não presumir autorização para lote autônomo Unsplash. Detalhes em PESQUISA-E-TESTE-BANCOS-2026-10-22.md.

# APIs externas — configuração comum do projeto

Criado em 22/10/2026. Serve a todos os temas e scripts do projeto; nenhuma chave deve ficar em uma pasta de tema. Node 22+; nenhuma dependência para instalar.

## O que preencher
Abra code/apis-externas/.env e cole APENAS as duas chaves correspondentes:

RUNWAYML_API_SECRET=chave_da_API_Runway
PEXELS_API_KEY=chave_da_API_Pexels

Uma linha por chave, sem Bearer, sem senha de conta e sem compartilhar valores no chat. Deixe vazio o serviço que ainda não possui. Salve como .env, não .env.txt. Você pode substituir esses placeholders pela chave diretamente no arquivo .env já criado; .env.example é só o modelo público. Não precisa preencher modelos, estilo, saldo ou orçamento aqui.

Runway: criar/copiar chave no projeto do portal https://dev.runwayml.com/ . Assinatura do app não comprova créditos API. Configuração oficial: https://docs.dev.runwayml.com/guides/setup/ . Pexels: https://www.pexels.com/api/ . Em 22/10/2026 o suporte informa pausa na emissão de novas chaves: https://help.pexels.com/hc/en-us/articles/900004904026-How-do-I-get-an-API-key . Se já possui, usar a existente; se não conseguir obter, deixar vazio e registrar busca manual provisória, sem contratar alternativa automaticamente.

## Conferir sem revelar chaves
Na raiz Redes-sociais:
node code/apis-externas/src/status.mjs

Mostra somente presença de cada credencial. Não faz rede, consulta saldo ou prova validade da chave. Não usa setx e não altera o ambiente global do Windows. Variáveis já definidas no processo prevalecem, inclusive vazias; remover a variável antiga do processo para adotar a do arquivo. Reiniciar o processo após editar .env quando necessário.

## Todos os usos futuros
Todo novo executor externo importa loadExternalEnv/getCredential de src/config.mjs antes de acessar o serviço; falhar com erro sanitizado e nunca imprimir valores, cabeçalhos, process.env ou resposta que possa repetir segredos. Alternativa para scripts Node existentes: node code/apis-externas/src/executar.mjs caminho/relativo/script.mjs [argumentos]. O wrapper carrega as chaves só no processo filho e não usa shell. O script filho precisa também respeitar o contrato de logs; o wrapper não pode impedir que código arbitrário imprima valores.

O diagnóstico do vídeo longo já carrega este módulo. Demais executores ainda precisam ser implementados/conectados; não presumir que programas fora deste projeto ou processos abertos recebam as variáveis automaticamente.

## Gasto e arquivos locais
Credencial salva não autoriza geração paga. Antes de executar lote, consultar saldo, preços e estimativa, definir limite explícito e controlar tentativas. Este módulo não contém comando de geração nem compra. Configuração por vídeo e orçamento ficam no tema, nunca misturados às chaves. Nenhum arquivo de segredo deve aparecer em logs/relatórios. .gitignore evita inclusão acidental via Git, mas .env continua texto local: não compartilhar, sincronizar ou enviar a pasta inteira sem excluir o arquivo.

## Arquivos
.env (local privado, criado sem valores; nunca sobrescrever ao retomar), .env.example (modelo), servicos.json (catálogo público), src/config.mjs (carregador), src/status.mjs (diagnóstico), src/executar.mjs (wrapper), src/config.test.mjs (verificações com credenciais fictícias). Novos serviços entram no carregador/catálogo/modelo quando necessários, não adicionar logins de conta.

## Pixabay configurado e testado — 22/10/2026
Chave local fornecida por Luiz carregada sem exposição. Busca de fotos luxury house (cenas #33/#47): HTTP 200, 17.353 resultados totais, três candidatos retornados. Busca de vídeos Santorini (#118/#124): HTTP 200, 12 resultados totais, três candidatos. Duas requisições; nenhum download ou geração paga. Contadores recebidos: limite 100/60s, restante 98 após as duas buscas.
Implementados code/apis-externas/src/pixabay.mjs e testar-pixabay.mjs: busca dirigida, campos úteis de autoria/origem/dimensões/variantes, respostas em cache por 24h sem URL de requisição ou chave. Nova execução imediata confirmou cache nas duas buscas e zero chamadas remotas. Quatro testes locais passaram, incluindo cache e erro sem exposição de chave. Pesquisa não comprova aprovação estética, enquadramento ou licença específica de cada candidato. Relatório JSON em code/apis-externas/teste-pixabay.json contém candidatos, não mídia final.
Pixabay disponível para seleção dirigida de fotos e vídeos. Unsplash permanece pesquisa assistida de fotos; Pexels fora do fluxo ativo. Download de selecionados, revisão visual e migração das rotas antigas no manifesto ainda não executados. Nenhuma busca de música/efeitos iniciada; manter etapa sonora no momento previsto.
Próximo passo: validar acesso e saldo Runway sem geração e preparar orçamento lógico do lote inicial da abertura; banco Pixabay já autenticado. Chaves nunca no chat. Fonte consultada 22/10/2026: https://pixabay.com/api/docs/ .
## Consulta Runway e cálculo — 22/10/2026
GET /v1/organization HTTP 200: saldo API 1.000 créditos (USD 10 nominal); imagens 2 simultâneas/200 dia, vídeo 1/50 dia nos modelos consultados; zero gerações feitas. Calculador local e dois testes passaram. Report detalhado: code/apis-externas/RUNWAY-SALDO-E-ORCAMENTO-2026-10-22.md. Piloto proposto de três imagens 1080p (24 créditos), vídeo condicional 10 s (50), base74/máximo148 com uma repetição por tarefa. Limite global sugerido 800, com reserva interna até200 e previsão base até600; não aprovado como autorização. Cenário de 80 imagens mistas e12 vídeos5s custa580, até780 com reserva; não é plano de cenas confirmado. Não executar fila antiga 180/28, que mesmo em Turbo mínimo excede1.000. Orçamento/saldo devem ser checados antes de cada lote. Nenhuma geração paga/compra executada. Próximo: preparar prompts/lote concreto e reconciliar rotas antes de execução paga. Música e efeitos depois do visual.

## Geração real do piloto — 22/10/2026
Implementado src/runway-gerar.mjs. Usa configuração compartilhada, preço conferido com calculador, saldo, teto máximo de 150 créditos por rodada deste piloto, trava de concorrência e IDs persistidos antes de acompanhar tarefas; nenhuma repetição automática de POST. Diretório com envio incerto ou trava órfã exige conciliação por ID/portal. Não criar vários diretórios para contornar autorização. Quatro travas foram testadas sem rede. Runway real: 3 imagens + clipe 10s, 68 créditos, saldo932; detalhes em palavras/youtube/peças/inveja/direcao-video/piloto-integrado-v1/entrega/. Não há autorização para novo lote só porque há saldo. Retomada normal é local em code/video-longo/piloto-inveja/executar.mjs.

## Uso em 31/10/2026 — imagens do artigo de Inveja
Autorizado por Luiz: 3 imagens gen4_image 1080p (24 créditos); saldo 369 → 345. Registro em `palavras/youtube/peças/inveja/roteiro-blogs/imagem-artigo/LEIA-ME.md`. Observação técnica: em pasta conectada sem permissão de exclusão, `runway-gerar.mjs` conclui a tarefa e falha ao apagar `.runway-executor.lock` (EPERM); a trava fica no diretório e bloqueia nova execução no mesmo diretório.
