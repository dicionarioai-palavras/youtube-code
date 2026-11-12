# Gera o cronograma geral (Markdown + CSV) de 06/11/2026 a 31/12/2026.
import datetime as dt, csv, io
D=lambda d,m: dt.date(2026,m,d)
SEM=['seg','ter','qua','qui','sex','sáb','dom']
rows={}  # data -> dict(col -> [itens])
COLS=['YouTube Palavras (longo/comunidade)','Shorts · Reels · TikTok Palavras','Instagram/TikTok Palavras (imagens)','Luiz (@luizhenrique.ansilv)','Blog · SEO Google']
def add(d,col,txt):
    # Fim de semana sem trabalho de Luiz (07/11/2026): o que sai no sábado/domingo precisa estar programado antes.
    if d.weekday()>=5 and 'enquete da comunidade' in txt: txt+=' — programar no Studio na sexta'
    rows.setdefault(d,{c:[] for c in COLS})[COLS[col]].append(txt)
Y,S,I,L,B=range(5)
P='canais/palavras/episodios/ep01-inveja/pecas/'
# ---------- Vídeo 1 — Inveja (pronto) ----------
add(D(11,11),Y,'🎬 VÍDEO 1 — INVEJA: "Por Que Seus Amigos Te Invejam em Segredo (Mais do Que Você Imagina)" (embalagem envelopada, teste E14, 10/11; A/B envelopada × v5 — `estudos/envelopamento/troca-2026-11/LEIA-ME-TROCAS.md`) estreia às **18h** (Luiz: no Studio, conferir a estreia às 18h, trocar o título e montar o Testar e comparar); **19h: post na comunidade** (enquete com imagem + link; `canais/palavras/episodios/ep01-inveja/comunidade/POST-COMUNIDADE-INVEJA.md`); Luiz: comentário fixado logo depois (textos: youtube-publicacao/)')
add(D(11,11),B,'Inveja: trocar pilar e crônica para a versão com embed (antes-do-video/LEIA-ME.md) e pedir reindexação')
add(D(11,11),L,'Story/post avisando do vídeo (opcional, sem peça pronta)')
add(D(12,11),S,'Inveja · corte `palavras-o-olho-volta` (ATÉ ONDE ESSE OLHAR VAI?)')
add(D(13,11),I,'Inveja · carrossel IG (8) + stories 1–5 com enquetes → destaque "Investigações" (`palavras-posts-texto`)')
add(D(13,11),L,'Inveja · `botao-da-foto-pb`')
add(D(13,11),S,'Inveja · corte `palavras-to-com-inveja` (VOCÊ CHAMOU PELO NOME?)')
add(D(14,11),S,'Inveja · `ela-nao-fere-ela-localiza`')
add(D(15,11),I,'Inveja · post único IG')
add(D(15,11),Y,'Inveja · enquete da comunidade ("Seu amigo é promovido…")')
add(D(15,11),L,'Inveja · `desejo-mesquinho` (crédito CC BY na legenda)')
add(D(15,11),S,'Inveja · corte `palavras-mesma-dor-dois-caminhos` (A MESMA DOR LEVA AONDE?)')
add(D(16,11),I,'Inveja · carrossel TikTok (6)')
add(D(16,11),Y,'Inveja · resposta da enquete no comentário fixado')
add(D(17,11),S,'Inveja · `frase-escolhida`')
add(D(17,11),L,'Inveja · `aquecendo-a-voz-pb`')
add(D(20,11),S,'Inveja · corte `palavras-invidere-videre` (POR QUE O OLHO VOLTA?)')
add(D(23,11),L,'Inveja · `cantando-sem-audio-pb`')
add(D(25,11),L,'Inveja · `aqui-e-bastidor` (crédito CC BY na legenda)')
add(D(27,11),S,'Inveja · corte `palavras-calculadora-do-almoco` (O QUE A CONTA ESCONDE?) — 12 dias depois do `desejo-mesquinho`')
add(D(29,11),L,'Bastidor solto · `corta-isso-ai-x-eu-e-essa-camera` (6 s; sem ficha — confirmar)')
add(D(11,12),Y,'Inveja · métricas de 30 dias (vídeo, blog, cortes, posts) → PLANO-EVOLUCAO-CONTINUA.md (M11)')
# Pesquisa de demanda (Luiz, 07/11/2026): retorno aos 7 e 28 dias de cada vídeo, comparado com a nota da triagem
add(D(18,11),Y,'IA: Inveja · retorno de 7 dias da pesquisa de demanda (nota 9,1): views, múltiplo, retenção e CTR pelo vidIQ → canais/palavras/guias/calibragem/notas-externas.md')
add(D(9,12),Y,'IA: Inveja · retorno de 28 dias da pesquisa de demanda → notas-externas.md')
add(D(25,11),Y,'IA: Ciúme · retorno de 7 dias da pesquisa de demanda (nota 7,75) → notas-externas.md')
add(D(16,12),Y,'IA: Ciúme · retorno de 28 dias da pesquisa de demanda → notas-externas.md')
# ---------- Seg 09 e ter 10/11 (Luiz, 07/11 10h40: sábado 07/11 sem atuação; tudo remarcado e dividido) ----------
add(D(9,11),S,'AGENDAR o Inveja no Palavras: todos os cortes, posts e stories de 12 a 30/11 (lista: `cronograma/AGENDAMENTO-2026-11-07.md`; stories ficam para o dia)')
add(D(9,11),L,'AGENDAR o Inveja no perfil Luiz: bastidores e cortes de 12 a 30/11 (mesma lista)')
add(D(10,11),S,'AGENDAR o Ciúme no Palavras: `pra-que-nove-vezes` e `palavras-posts-texto` (carrossel, post, comunidade, TikTok) de 20 a 23/11 (mesma lista; stories ficam para o dia)')
add(D(10,11),L,'AGENDAR o Ciúme no perfil Luiz: `o-cara-da-persiana`, `volta-pro-comeco-da-frase`, `pra-que-nove-vezes` (19, 21 e 30/11)')
# ---------- Vídeo 2 — Ciúme (estreia 18/11; bastidores prontos em 07/11) ----------
C='Ciúme · '
add(D(10,11),B,C+'VALIDAR os 5 artigos do Ciúme (rascunhos em canais/palavras/episodios/ep02-ciume/roteiro-blogs/palavras-barra-blog/: pilar, crônica, ciúme ou ciúmes, Capitu, prova de amor) → com o ok, Claude exporta para final/ e deixa a publicação pronta nas datas abaixo (16/11, 19/11, 26/11, 03/12)')
add(D(16,11),B,'Vídeo 2 — Ciúme · publicar pilar (/blog/ciume-origem-da-palavra) + crônica (/blog/ciume-ou-cuidado) + pedir indexação (textos e imagens prontos: canais/palavras/episodios/ep02-ciume/roteiro-blogs/)')
add(D(19,11),B,C+'publicar artigo "Ciúme ou ciúmes: qual é o certo?" (/blog/ciume-ou-ciumes) + pedir indexação')
add(D(26,11),B,C+'publicar artigo "Capitu traiu Bentinho?" (/blog/capitu-traiu-bentinho) + pedir indexação')
add(D(3,12),B,C+'publicar artigo "Ciúme é prova de amor?" (/blog/ciume-e-prova-de-amor) + pedir indexação')
add(D(18,11),Y,'🎬 VÍDEO 2 — CIÚME público + comentário fixado; trocar artigos para a versão com embed')
add(D(19,11),S,C+'corte 1 do vídeo final (a construir: C1–C7 da DEFINICAO-DAS-PECAS.md)')
add(D(19,11),L,C+'`o-cara-da-persiana` (Shorts: com trilha · IG/TikTok: sem trilha, música no app)')
add(D(20,11),I,C+'carrossel IG (8) + stories (5) com 2 enquetes → destaque "Investigações" (`palavras-posts-texto`)')
add(D(21,11),S,C+'`pra-que-nove-vezes` (versão Palavras; crédito CC BY na legenda)')
add(D(21,11),L,C+'`volta-pro-comeco-da-frase` (crédito CC BY na legenda)')
add(D(22,11),Y,C+'enquete da comunidade ("Ciúme é prova de amor?") (`palavras-posts-texto`)')
add(D(22,11),I,C+'post único IG "Ciúme ou ciúmes?" (`palavras-posts-texto`; link na bio → /blog/ciume-ou-ciumes)')
add(D(23,11),I,C+'carrossel TikTok (5) "Escrevi zeloso no currículo" (`palavras-posts-texto`)')
add(D(23,11),Y,C+'resposta da enquete no comentário fixado')
add(D(24,11),S,C+'corte 2 do vídeo final (a construir)')
add(D(30,11),L,C+'`pra-que-nove-vezes` (versão Luiz; 9 dias depois da versão Palavras; crédito CC BY)')
# ---------- Vídeos 2 a 8 (a produzir) ----------
# 09/11/2026 (Luiz): Vídeo 3 = POC de envelopamento (`estudos/envelopamento/poc/POC-2026-11-09.md`, v3).
TEMAS={3:'POC envelopamento — "A Psicologia dos Homens Que Nunca Amadurecem" (maduro / homem-criança)'}
for n,w in enumerate([D(25,11),D(2,12),D(9,12),D(16,12),D(23,12),D(30,12)],3):
    v=f'Vídeo {n}'
    seg=w-dt.timedelta(days=2)
    add(seg,B,f'{v} · publicar pilar + crônica "antes do vídeo" + pedir indexação (code/blog-publicacao/)')
    add(w,Y,f'🎬 VÍDEO {n} ({TEMAS.get(n,"tema a definir")}) público + comentário fixado; trocar artigos para a versão com embed')
    add(w+dt.timedelta(1),S,f'{v} · corte 1')
    add(w+dt.timedelta(1),L,f'{v} · corte/bastidor pessoal 1')
    add(w+dt.timedelta(2),I,f'{v} · carrossel IG + stories com enquete')
    add(w+dt.timedelta(3),S,f'{v} · peça 2 (bastidor ou corte)')
    add(w+dt.timedelta(3),L,f'{v} · bastidor 2')
    add(w+dt.timedelta(4),I,f'{v} · post único IG')
    add(w+dt.timedelta(4),Y,f'{v} · enquete da comunidade')
    add(w+dt.timedelta(5),I,f'{v} · carrossel TikTok')
    add(w+dt.timedelta(5),Y,f'{v} · resposta da enquete')
    add(w+dt.timedelta(6),S,f'{v} · corte 2')
    add(w+dt.timedelta(6),L,f'{v} · bastidor 3')
# ---------- SEO de segunda ----------
# ---------- Conteúdo independente (apoio, ~2 por mês, quinzenal; Luiz cria quando achar necessário) ----------
tb=[(D(17,11),'Mal ou mau — pilar (/blog/mal-ou-mau)','mal ou mau'),(D(1,12),'Sessão, seção ou cessão — pilar','sessão, seção ou cessão'),
    (D(15,12),'Por que mal e mau soam iguais (crônica)','mal ou mau'),(D(29,12),'Origem de sessão, seção e cessão (crônica)','sessão, seção ou cessão')]
for d,t,tema in tb:
    add(d,B,f'Conteúdo independente · artigo "{t}" (canais/palavras/independentes/blog/{tema}/palavras-barra-blog/final/)')
add(D(21,11),I,'Conteúdo independente · Mal ou mau — carrossel IG + carrossel TikTok (textos prontos em redes/final; arte a construir)')
add(D(5,12),I,'Conteúdo independente · Sessão, seção ou cessão — carrossel IG + carrossel TikTok (arte a construir)')
add(D(19,12),I,'Conteúdo independente · Mal ou mau — post único + stories (arte a construir)')
# ---------- Site novo, verbetes, SEO (segunda) e indexação diária (Luiz, 07/11/2026) ----------
# Lançamento do site novo do palavras.co em qua 18/11 (deploy em produção). Verbetes: 10–30 novos por dia útil.
# Indexação diária só depois do lançamento: todo verbete publicado no dia + lista da semana. Fim de semana sem tarefas.
add(D(18,11),B,'🚀 LANÇAMENTO DO SITE NOVO do palavras.co: deploy em produção (a carta "Sem Disfarce" do CTA do Ciúme passa a valer); a partir de hoje, todo verbete publicado vai para indexação no mesmo dia')
d=D(9,11)
while d<=D(31,12):
    if d.weekday()<5:
        if d.weekday()==0 and d>=D(16,11):
            add(d,B,'SEO (segunda, C:\\proj\\ROTINA_SEO_SEMANAL.md): criar seo-relatorios\\'+d.strftime('%Y-%m-%d')+'\\google\\; exportar do Search Console "Páginas" e "Estatísticas de rastreamento" (CSV); Bing Recomendações (opcional); pedir ao Claude "rotina semanal de SEO" → 3 linhas + lista de indexação da semana')
        add(d,B,'Palavras.co: 10–30 verbetes novos (criar, enriquecer e publicar)'+(' + mandar todos para indexação no Google hoje' if d>=D(18,11) else ''))
        if d>=D(18,11):
            add(d,B,'Indexação diária no Google: os verbetes publicados hoje + 10–20 URLs da lista da semana'+(' (incluir as URLs de artigos publicadas hoje)' if any(('publicar' in x or 'trocar' in x or 'independente' in x) for x in rows.get(d,{}).get(COLS[B],[])) else ''))
    d+=dt.timedelta(1)
# ---------- Organização das redes e centralização (Luiz, 09/11/2026) — todas as marcas: Luiz, Palavras e The Mind Behind ----------
OR='🗂 TODAS AS MARCAS · '
add(D(27,11),Y,OR+'IA prepara as listas da organização de dezembro: vídeos por playlist, o que fixar, textos de bio e de playlists, capas de destaque (`cronograma/ORGANIZACAO-DAS-REDES-DEZEMBRO-2026.md`)')
add(D(1,12),Y,OR+'COMEÇA a organização das redes (até sex 11/12): YouTube, Instagram e TikTok de Luiz, Palavras e The Mind Behind (TMB só YouTube) — playlists, fixados, destaques, página inicial, bio e links. Junto: centralizar e limpar os documentos de controle (mesmo arquivo)')
add(D(4,12),Y,OR+'depois da revisão com dados: escolher fixados, trailer e vídeo em destaque de cada perfil pelos números de novembro')
add(D(11,12),Y,OR+'FIM da organização das redes e da centralização dos documentos; decidir se cria Instagram e TikTok do The Mind Behind')
add(D(7,12),Y,OR+'Automação dos agendamentos: conectar o Buffer (MCP) e a pasta na nuvem com os arquivos finais; teste de aceite = 1 semana real das três marcas agendada pela IA com o ok de Luiz (`cronograma/ORGANIZACAO-DAS-REDES-DEZEMBRO-2026.md`)')
# ---------- saída ----------
dias=[]; d=D(6,11)
while d<=D(31,12): dias.append(d); d+=dt.timedelta(1)
md=io.StringIO()
md.write('''# Cronograma geral de postagens — Palavras e Luiz (06/11 a 31/12/2026)

> **A agenda do dia agora é `AGENDA-DIARIA.md`** (09/11/2026): ela mostra o que foi de fato agendado no PostEverywhere e no Studio (peças excluídas, stories e datas trocadas por Luiz) e o que só você faz. Este arquivo é o plano geral.

Criado em 31/10/2026 a pedido de Luiz. **Dia V do primeiro vídeo (Inveja): quarta 11/11/2026.** Depois, um vídeo longo por semana, às quartas, conforme cada vídeo e suas peças ficarem prontos (Vídeo 2 = Ciúme, 18/11; os Vídeos 3–8 são vagas a preencher). Luiz decide na hora de postar o que entra, o que sai e qual capa usar. LinkedIn e Medium fora por ora (Luiz decide quando aparecerem).
Fim de semana sem tarefas de Luiz (07/11/2026): o que sai no sábado e no domingo é programado durante a semana. Verbetes: 10–30 novos por dia útil. **Site novo no ar em qua 18/11** (deploy em produção); daí em diante, todo verbete publicado vai para indexação no mesmo dia. SEO: rotina semanal toda segunda (`C:\\proj\\ROTINA_SEO_SEMANAL.md`).\nOrdem de cada vídeo: artigos no blog (segunda) → vídeo (quarta) → redes (quinta a terça). Regras: 1 peça de vídeo por dia por marca; bastidores sempre no Luiz, às vezes no Palavras.
Peças do Inveja: `canais/palavras/episodios/ep01-inveja/pecas/`; do Ciúme: `canais/palavras/episodios/ep02-ciume/pecas/` (arquivo por destino e legenda na `ficha.md` de cada pasta). Ao postar: marcar `postado`, data e link na ficha. Versão planilha: `CRONOGRAMA-GERAL-POSTAGENS.csv`.

''')
md.write('''
## Como postar — passo a passo (vale para todas as peças)
Antes de tudo: abra a pasta da peça (o nome entre crases na tabela) em `canais/palavras/episodios/<tema>/pecas/<peça>/`. A `ficha.md` tem a legenda pronta, as figurinhas, o link e as observações; o nome do arquivo diz onde postar. Depois de postar, me diga (ou marque na ficha) `postado`, data e link.

**Qual arquivo subir**
- `...postar-no-shorts...` ou `...--postar-no-shorts--com-trilha.mp4` → YouTube Shorts.
- `...postar-no-instagram-ou-tiktok...` / `...sem-trilha--escolher-musica-no-app.mp4` → Reels e TikTok; a música entra no app.
- `...trilha-cc-by--credito-na-legenda.mp4` → serve para as três redes; a legenda já traz o crédito da música.
- Capas: `capa-*.png` na mesma pasta; escolha uma na hora. A capa nunca vai dentro do vídeo.

**Instagram — Reels (vídeo)**
1. **+** → **Reel** → escolha o vídeo da pasta → **Avançar**.
2. Se o arquivo for "sem trilha": **Áudio** → escolha uma música em alta, volume baixo (~10–15%) para não cobrir a voz.
3. **Editar capa** → **Adicionar da galeria** → a `capa-*.png` escolhida.
4. Cole a legenda da ficha (hashtags no fim). Marque **Compartilhar também no Feed**.
5. Para agendar: **Configurações avançadas** → **Programar este Reel** → data e hora. Publicar/Programar.
6. Se a ficha mandar 1º comentário (fontes), comente logo depois de sair (no agendado: assim que ele for ao ar).

**Instagram — carrossel e post único (imagens)**
1. **+** → **Post** → toque no ícone de várias imagens → selecione na ordem 01, 02, 03… → **Avançar**.
2. Sem filtro. Cole a legenda da ficha. Em **Texto alternativo** (Configurações avançadas), use o da ficha quando houver.
3. Agendar: **Configurações avançadas** → **Programar este post**.

**Instagram — stories (não dá para agendar no app; publique no dia)**
1. Deslize para a câmera → **Stories** → escolha a tela 01.
2. Figurinhas: **Enquete** (opções escritas na ficha) no espaço vazio do meio; **Link** onde a ficha indicar (vídeo no YouTube ou o artigo com UTM).
3. Publique as telas na ordem. Depois: **Destaque** → adicione ao destaque "Investigações".

**TikTok — vídeo**
1. **+** → **Carregar** → o vídeo "instagram-ou-tiktok" → **Avançar**.
2. **Sons** → escolha a música (volume original da voz em 100%, música baixa).
3. **Capa** → escolha o quadro ou o texto de capa. Cole a legenda da ficha.
4. Agendar: **Mais opções** → **Programar vídeo** (a opção aparece no app ou no TikTok Studio, conforme a conta). Publicar/Programar.

**TikTok — carrossel de fotos**
1. **+** → **Carregar** → aba **Foto** → selecione as telas na ordem → **Avançar**.
2. Escolha uma música no app. Cole a legenda da ficha. Publicar (programar, se a opção aparecer).

**YouTube — Shorts**
1. YouTube Studio (computador) → **Criar** → **Enviar vídeos** → arquivo "postar-no-shorts".
2. Título = gancho da ficha (até ~60 caracteres) + descrição da ficha (com crédito CC BY, se houver).
3. **Vídeo relacionado** → o vídeo longo do tema. Público: não é para crianças.
4. **Visibilidade** → **Programar** → data e hora. Salvar.

**YouTube — comunidade (enquete)**
1. YouTube Studio → **Criar** → **Criar postagem** (ou no app: + → Postar) → **Enquete**.
2. Pergunta e opções da ficha; a imagem `*-youtube-comunidade-01.png` é opcional. Programar, se a opção aparecer.
3. No dia seguinte, fixe nos comentários a "Resposta" da ficha.

**Blog (palavras.co)**
1. Na véspera ou no dia, me peça "publicar os artigos de hoje": eu publico pela API do blog o texto aprovado (`canais/palavras/episodios/<tema>/roteiro-blogs/final/`) com a imagem de `roteiro-blogs/imagem-artigo/` (procedimento: `code/blog-publicacao/LEIA-ME.md`).
2. Você confere a página no ar e pede a indexação no Google Search Console (**Inspecionar URL** → **Solicitar indexação**).
3. No dia do vídeo, eu troco os artigos para a versão com o vídeo incorporado.
4. LinkedIn e Medium: só quando você decidir (textos prontos em `roteiro-blogs/linkedin/` e agenda em `roteiro-blogs/medium/importacao.md`).

**Horários (08/11/2026, público no Brasil; análise em `canais/palavras/guias/HORARIOS-DE-POSTAGEM.md`)**: vídeo longo **quarta, 18h**; Shorts, Reels e TikTok **20h** (principal) e **12h** (segunda peça do dia, quando houver); carrossel 12h; stories ao longo do dia. Revisar com os dados das contas depois dos primeiros vídeos.
''')
cur=None
for d in dias:
    wk=d.isocalendar()[1]
    if wk!=cur:
        cur=wk; seg=d-dt.timedelta(d.weekday())
        md.write(f'\n## Semana de {seg.strftime("%d/%m")}\n\n| Data | '+' | '.join(COLS)+' |\n|'+'---|'*(len(COLS)+1)+'\n')
    r=rows.get(d,{c:[] for c in COLS})
    md.write(f'| {SEM[d.weekday()]} {d.strftime("%d/%m")} | '+' | '.join('<br>'.join(r[c]) or '—' for c in COLS)+' |\n')
md.write('''
## Reserva e pendências
- Inveja, 2ª leva de cortes: feita em 01/11/2026 e agendada (13/11, 15/11, 27/11). Plano: `canais/palavras/episodios/ep01-inveja/redes/PLANO-CONSTRUCAO-CORTES-CTA-2026-10-31.md`.
- Conteúdo independente (apoio, ~2 por mês; Luiz decide quando): datas acima são sugestão. Reserva para janeiro: "Bem ou bom", "Secção ou seção", "Seção eleitoral ou sessão eleitoral" (janela eleitoral passada: reavaliar o ângulo). Reels e vídeos de TikTok desse conteúdo: roteiros prontos em `redes/final/`, gravação a produzir.
- Vídeos 7 (23/12) e 8 (30/12) confirmados por Luiz também nas semanas de fim de ano.
- Rotina de SEO: `C:\\proj\\ROTINA_SEO_SEMANAL.md` (segunda: exportações + pedido ao Claude; todo dia: 10–20 pedidos de indexação; alertas: rastreamento > 1 s, 4xx > 1% ou qualquer 5xx, erro de sitemap, queda de indexadas, recomendação nova no Bing, e-mail do Search Console/Bing). URLs novas do blog e verbetes citados nos vídeos (ex.: /palavra/inveja) entram na lista de indexação.
''')
open('CRONOGRAMA-GERAL-POSTAGENS.md','w',encoding='utf-8').write(md.getvalue())
with open('CRONOGRAMA-GERAL-POSTAGENS.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';'); w.writerow(['Data','Dia']+COLS+['Feito?'])
    for d in dias:
        r=rows.get(d,{c:[] for c in COLS}); w.writerow([d.strftime('%d/%m/%Y'),SEM[d.weekday()]]+[' | '.join(r[c]) for c in COLS]+[''])
print(len(dias),'dias')
