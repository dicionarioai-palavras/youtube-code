# Teste Unsplash e alternativa de banco — 22/10/2026

## Resultado executado
UNSPLASH_ACCESS_KEY já preenchida foi carregada sem exposição. Uma requisição de busca de Santorini Greece retornou HTTP 200, 665 resultados totais e três candidatos. Limite retornado: 50/h; restante após teste: 49. Nenhuma imagem baixada, nenhuma geração paga. App ID/Secret Key não são necessários à busca pública. Resultado de busca com autores/links em code/apis-externas/teste-unsplash.json; sem chaves. Dois testes locais do carregador passaram.

## Conclusão para o projeto
Unsplash serve à pesquisa assistida de fotos, não substitui banco de vídeo. A licença geral permite uso comercial, mas a API tem condições adicionais: atribuição, hotlinks e notificação de download. Diretriz de experiência não automatizada torna inadequado presumir autorização para esteira autônoma de download em lote/exportação offline; não foi implementado esse comportamento. Esclarecer esse uso com fornecedor antes de promovê-lo a executor autônomo. Chave válida não comprova aprovação do caso de uso.

Pixabay é o candidato recomendado para banco de fotos e vídeos: API gratuita com endpoint de vídeo. Padrão documentado de 100 requisições/60 s, cache de 24h, sem consultas excessivas nem downloads sistemáticos em massa. Planejar busca dirigida às cenas, candidatos revisados e somente downloads selecionados; não mineração de acervo. Ainda não há chave nem teste remoto Pixabay. A licença permite incorporação e adaptação em obras, sujeita às restrições de conteúdo, marcas e pessoas; não distribuir assets isolados como produto.

Pexels retirado do fluxo ativo por decisão do usuário. O usuário informou encerramento; a evidência oficial anterior indicava pausa de emissão de chaves. Encerramento global não foi confirmado nesta rodada. Não manter Pexels como dependência para avançar o Inveja.

## Alterações reais
- Carregador/configuração e catálogo reconhecem UNSPLASH_ACCESS_KEY e PIXABAY_API_KEY; chaves existentes preservadas.
- Busca Unsplash implementada em src/unsplash.mjs e teste manual em src/testar-unsplash.mjs. Preview usa URL retornada, não arquivo local.
- Campo PIXABAY_API_KEY em .env/.env.example; usuário deve obter chave na conta Pixabay e colar localmente.
- Diagnóstico do vídeo não exige mais Pexels; sinaliza ausência do banco de vídeo alternativo. Manifestos antigos ainda carregam nomes Pexels e precisam de migração de rota ao integrar o executor de banco; não executar fila antiga cegamente.
- Nada foi baixado, publicado, comprado, enviado para geração ou contratado. Nenhuma senha/chave apareceu nos relatórios.

## Próximo passo
Usuário cria conta/acessa https://pixabay.com/api/docs/ e obtém chave, se o acesso for concedido; preencher somente PIXABAY_API_KEY no arquivo local. Testar busca de fotos e vídeos e avaliar os resultados reais para Inveja, com cache e seleção dirigida. Manter músicas/efeitos na Biblioteca do YouTube conforme decisão vigente.

## Fontes oficiais consultadas em 22/10/2026
- https://unsplash.com/documentation — autenticação pública Access Key, fotos e limites.
- https://unsplash.com/license — licença geral das imagens.
- https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines — regras adicionais da API.
- https://help.unsplash.com/en/articles/2511256-guideline-high-quality-authentic-experiences — uso não automatizado.
- https://pixabay.com/api/docs/ — fotos/vídeos, cache e limites.
- https://pixabay.com/service/license-summary/ — resumo da licença; termos completos prevalecem.