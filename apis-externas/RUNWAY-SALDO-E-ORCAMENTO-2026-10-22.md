# Runway — acesso, saldo e cálculo de gerações

Consulta: 22/10/2026, 20:02 (America/Sao_Paulo). Autenticação HTTP 200 em GET /v1/organization, sem criar tarefas de geração. Saldo retornado: 1.000 créditos; equivalente nominal de geração USD 10. Saldo específico da organização/API associada à chave, não do app web. Uma consulta de leitura; zero gerações e zero créditos gastos nesta operação.

## Custos por operação calculados
| Modelo / operação | Créditos | USD |
|---|---:|---:|
| Gen-4 Image Turbo, 1 imagem | 2 | 0,02 |
| Gen-4 Image, 1 imagem 720p | 5 | 0,05 |
| Gen-4 Image, 1 imagem 1080p | 8 | 0,08 |
| Gen-4 Turbo, vídeo 5 s | 25 | 0,25 |
| Gen-4 Turbo, vídeo 10 s | 50 | 0,50 |
| Gen-4.5, vídeo 5 s | 60 | 0,60 |
| Gen-4.5, vídeo 10 s | 120 | 1,20 |

Snapshot oficial, MP4 padrão sem upscale, HDR, ProRes ou roteador. Cada repetição paga soma novamente. Uma edição/variação também pode gerar custo. Preços reconfirmados em 22/10/2026; cálculo local validado, não cobrança real medida. Não criar geração apenas para consultar estimatedCost: criar tarefa pode iniciar cobrança.

## Limites retornados pela conta
Gen-4 Image e Turbo: duas tarefas simultâneas, 200 gerações/dia. Vídeo Gen-4 Turbo e Gen-4.5: uma simultânea, 50/dia. Uso diário retornado zero nos quatro modelos. Limites/saldo são fotografia do momento; consultar novamente antes de gastar.

## Proposta para piloto — não autorizado nem executado
Etapa 1: três imagens Gen-4 Image 1080p = 3 × 8 = 24 créditos (USD 0,24). Conferir as imagens antes de vídeo.
Etapa 2 condicional: um clipe Gen-4 Turbo de 10 s = 10 × 5 = 50 créditos (USD 0,50).
Base: 74 créditos (USD 0,74); reserva máxima de uma repetição de cada tarefa: mais 74; teto proposto 148 créditos (USD 1,48, 14,8% do saldo). Não repetir automaticamente. A duração real da cena e a qualidade orientarão se 5 s bastam ou se precisa de 10 s. Gen-4.5 fica como escalonamento pontual, não padrão de tudo.

## Enquadramento econômico do vídeo — cenário, não fila aprovada
Proposta de limite global do Inveja: 800 créditos (USD 8), preservando 200 do saldo para fora desse limite. Dentro do limite, reservar até 200 para correções, trabalhando inicialmente com até 600 créditos de tarefas previstas.
Exemplo de combinação que cabe: 60 imagens Turbo × 2 = 120; 20 imagens Gen-4 1080p × 8 = 160; 12 clipes Turbo de 5 s × 25 = 300. Base 580; com reserva de correções de 200, total 780 créditos (USD 7,80). Restariam 220 se toda essa reserva fosse consumida. Isso é cenário de cálculo; não afirma que 80 imagens/12 clipes já atendem às 248 cenas. Qualidade exige referência, reaproveitamento, banco, composição e revisão por cena.
O piloto é contabilizado dentro do limite quando seus assets forem aproveitados; correções contam mesmo se rejeitadas. Não somar piloto como se fosse gratuito ou descontar duas vezes. Nenhum limite foi salvo como autorização de gasto.
O manifesto antigo de 180 imagens/28 clipes, até no cenário 180 Turbo × 2 + 28 vídeos de 5 s × 25 = 1.060 créditos, excede o saldo antes de correções. Não executar a fila antiga inteira.

## Implementado
code/apis-externas/src/runway-saldo.mjs: leitura sanitizada de saldo e limites.
src/runway-custos.mjs e runway-precos.json: calculador com modelos/resoluções/perfis explicitamente suportados; rejeita desconhecidos e formatos adicionais não orçados.
src/testar-runway.mjs: consulta de saldo e simulação de custos; nenhuma rota de geração.
src/runway.test.mjs: dois testes passaram (unidade/lote/tentativas; saldo desconhecido e parâmetros inválidos). Resultado sanitizado em resultado-runway.json.

## Fontes oficiais
- https://docs.dev.runwayml.com/guides/pricing/ — preços e conversão de crédito; consultada 22/10/2026.
- https://raw.githubusercontent.com/runwayml/sdk-node/main/src/resources/organization/organization.ts — GET e formato creditBalance/limites.
- https://raw.githubusercontent.com/runwayml/sdk-node/main/src/client.ts — autenticação/versionamento.
- https://raw.githubusercontent.com/runwayml/sdk-node/main/src/resources/image-to-video.ts — geração cria tarefas; estimatedCost é resposta da criação, não simulador não faturável.

## Próximo passo
Reconciliar tarefas da abertura com o limite proposto e preparar prompts do lote de três imagens; confirmar execução concreta antes de criar tarefas pagas. Banco Pixabay pronto, direção específica de Inveja preservada. Somente depois da preparação visual entram busca/curadoria sonora. Nunca mostrar chaves.