> **01/11/2026:** o upload pela API do blog (`POST /blog/admin/uploads`) voltou a funcionar em produção (faltava `R2_PUBLIC_BASE_URL` no Railway). Use a API; o envio direto ao R2 por `enviar-r2.cjs` fica só como alternativa.

# Publicação de artigos no palavras.co/blog — procedimento

Criado em 31/10/2026 a partir da primeira publicação (Inveja). Projeto do blog fora desta pasta: `C:\proj\blog-palavras\palavras-blog` (front Next.js na Vercel) e `palavras-blog-backend` (API Fastify no Railway, PostgreSQL schema `blog`).

## Caminho
1. **Texto:** usar a versão "antes do vídeo" do tema (`roteiro-blogs/final/antes-do-video/`), pela ordem de publicação artigos → vídeo → redes. O conteúdo vai em Markdown, começando pelo H1.
2. **Capa:** imagem 16:9 em JPG. Enviar ao R2 com `node code/blog-publicacao/enviar-r2.cjs <arquivo.jpg>` (lê as credenciais R2 do `.env` local do palavras-blog-backend; nunca imprime). Precisa de `@aws-sdk/client-s3`: no ambiente Linux, instalar numa pasta temporária e passar `S3_SDK=<pasta>/node_modules/@aws-sdk/client-s3`; no Windows com o backend instalado, o padrão já funciona. Devolve a URL pública.
   - Por quê: `POST /blog/admin/uploads` em produção responde 503 "Armazenamento de imagens não configurado (R2_*)". **Pendência de Luiz:** cadastrar as variáveis `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BASE_URL` (e `R2_BUCKET_IMG`, se não for `palavras-img`) no serviço do blog no Railway; depois disso o envio pelo painel volta a funcionar.
3. **Artigo:** `POST https://palavras-blog-backend-production.up.railway.app/blog/articles` com header `x-admin-key` (valor no `.env` local do backend; nunca no chat ou em registros) e JSON: `title, slug, excerpt (≤300), seoTitle, metaDescription, coverImageUrl, contentMarkdown, authorName "Luiz Henrique", authorSlug "luiz-henrique", categories, tags, relatedWords (verbetes), status "published", featured`. Trocar capa ou texto: `PUT /blog/articles/<id>` só com os campos que mudam. Exemplo real: `canais/palavras/episodios/ep01-inveja/roteiro-blogs/imagem-artigo/publicar.py`.
4. **Conferir:** `GET /blog/articles/<slug>` e `GET /blog/search?q=<tema>`. A página em palavras.co tem checkpoint da Vercel contra acesso automatizado: a conferência visual é de Luiz.
5. **Depois:** Luiz pede a indexação no Google Search Console manualmente; atualizar `canais/palavras/guias/blog-indice.md` (publicado + data) e o ESTADO do tema. LinkedIn e Medium só quando as publicações forem para as redes.
6. **No dia do vídeo:** trocar para a versão com embed (`roteiro-blogs/final/antes-do-video/LEIA-ME.md`) por `PUT`.
