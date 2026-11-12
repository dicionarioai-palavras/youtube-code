# Fluxograma de todos os processos do projeto Redes-sociais (página HTML com SVG à mão). Gera fluxo-dos-processos.html.
import html, textwrap

FASES = [
 ('1', 'Pauta', 'pesquisa-de-mercado/04_temas-quentes · palavras/ESTRATEGIA-GERAL.md', [
   ('Temas quentes da semana de lançamento (datas, notícias, buscas em alta, tendências, Search Console) + opções atemporais', 'n'),
   ('Temas: lista de urgências e pilares (emoções, julgamento, cultura, mudança de sentido)', 'n'),
   ('Pesquisa de mercado e calibragem (buscas reais, referências Elementar e Ludoviajante)', 'n'),
   ('Luiz escolhe o tema e se os derivados são atemporais ou puxados pelo tema quente', 'g')]),
 ('2', 'Roteiro', 'palavras/youtube/guias/CRIACAO-DO-ROTEIRO.md', [
   ('Uma etapa por vez; só o roteiro (sem título, thumb ou peças)', 'n'),
   ('Resumidor: resumo base + fontes externas (palavras.co atual não é fonte)', 'g'),
   ('Estruturador: modelo, variáveis com fonte, blocos', 'g'),
   ('Blocos 1, 2 e 3, um por vez, com humor + base literária', 'g'),
   ('Introdução, sempre por último', 'g'),
   ('Revisão → polimento + validador → revisão linguística → ajuste fino', 'n'),
   ('CTAs → .docx para ajuste de Luiz → final/ (.txt + .docx)', 'g')]),
 ('3', 'Estudo semiótico das cenas', 'youtube/guias/ESTUDO-SEMIOTICO-AUDIOVISUAL.md', [
   ('TXT com cenas S01–Snn: fala, imagem, buscas, montagem, som, Runway/câmera, pedido ao Remotion', 'n'),
   ('1–2 aparições opcionais de Luiz, com função narrativa', 'n'),
   ('Estudo aprovado', 'g')]),
 ('4', 'Definição das peças (logo após o estudo)', 'leque-de-artigos · complementos-redes', [
   ('Só definir, sem construir: DEFINICAO-DAS-PECAS.md', 'n'),
   ('Leque de artigos: pilar, crônica e derivados, com estratégia de SEO', 'n'),
   ('Textos das redes: carrossel, post, stories, comunidade, TikTok', 'n'),
   ('Cortes candidatos, bastidores a gravar (com intenção) e destinos por marca', 'n'),
   ('Definição aprovada', 'g'),
   ('Direção da gravação dos bastidores (DIRECAO-DE-GRAVACAO.md)', 'g')]),
 ('5', 'Produção do vídeo', 'youtube/guias/PRODUCAO-ARTESANAL-GUIADA.md', [
   ('Gravação: Shure → GO:MIXER → Audacity; bastidores pela direção de gravação (falar a marca de destino)', 'n'),
   ('Áudio: Adobe Podcast (Speech 70, Music 0, Background 0) + volume', 'n'),
   ('Premiere: cortes e transcrição da voz (JSON)', 'n'),
   ('Materiais por cena: banco (Pixabay, Unsplash, Pexels), Runway/Firefly por Luiz, insertos no Remotion, câmera opcional', 'n'),
   ('Som: Biblioteca de Áudio do YouTube e Freesound, licença por item', 'n'),
   ('Montagem no Premiere', 'n'),
   ('Exportação final aprovada', 'g')]),
 ('6', 'Embalagem do YouTube', 'peças/<tema>/thumb/ · youtube-publicacao/', [
   ('Estudo semiótico da thumb e dos títulos (3 composições)', 'n'),
   ('Luiz gera no Runway, busca no Pexels/Pixabay ou fotografa', 'n'),
   ('Thumb final no Remotion + prancha de leitura (claro/escuro, tamanho pequeno)', 'n'),
   ('Thumb aprovada (sem Luiz na imagem)', 'g'),
   ('Textos e configuração (14C): título, descrição, capítulos, fontes, créditos, IA = Sim', 'g')]),
 ('7', 'Artigos no blog', 'code/blog-publicacao/', [
   ('Construídos só com o vídeo pronto, depois da thumb e do 14C', 'n'),
   ('Versão "antes do vídeo" dos artigos', 'n'),
   ('Capa: imagem gerada no Runway ou desenho de Luiz', 'n'),
   ('Envio da imagem ao R2 + publicação pela API do blog', 'n'),
   ('Indexação no Search Console (Luiz) + blog-indice.md', 'n'),
   ('14C atualizado com os links dos artigos', 'n')]),
 ('8', 'Peças das redes', 'esteira de cortes · Remotion · fichas', [
   ('Construídas só com o vídeo pronto, depois da thumb e do 14C (esteira de cortes)', 'n'),
   ('Cortes do vídeo final: transcrição do Premiere da sequência final', 'n'),
   ('Bastidores: esteira.bat (Whisper local) → destinos da definição → análise crítica (nota ≥ 7, até 4 por vídeo)', 'n'),
   ('Cardápio e plano de construção aprovados', 'g'),
   ('Cortes do vídeo final: plano (IDs, manchetes, CTA existente do vídeo)', 'n'),
   ('Folha comparativa de capas (4 por peça, logo do Palavras)', 'g'),
   ('Render 9:16: Shorts com trilha; Instagram/TikTok só voz; cartela por marca', 'n'),
   ('Posts de texto: carrossel, post, stories, destaque, TikTok, comunidade', 'n'),
   ('Ficha por peça + _pecas.md → estado "pronto"', 'g')]),
 ('9', 'Cronograma', 'cronograma/ · code/cronograma/gerar_cronograma.py', [
   ('Dois cronogramas: construção (CRONOGRAMA-CONSTRUCAO.md) e postagens (gerado pelo script)', 'n'),
   ('Inserir o vídeo e as peças no script', 'n'),
   ('Conteúdo independente de apoio: ~2 por mês, quinzenal (Luiz decide quando)', 'n'),
   ('Gerar o .md e o .csv (dia a dia, por marca e rede)', 'n'),
   ('Regras: 1 vídeo por dia por marca; mesmo trecho ≥ 7 dias de distância', 'n')]),
 ('10', 'Publicação', 'palavras/PLANO-DE-PUBLICACAO.md', [
   ('Segunda: artigos do vídeo no blog', 'n'),
   ('Quarta: vídeo longo (Não listado → Público); artigos ganham o embed', 'n'),
   ('Quinta a terça: cortes, posts e bastidores', 'n')]),
 ('11', 'Rotina diária e SEO', 'cronograma/LEIA-ME.md · C:\\proj\\ROTINA_SEO_SEMANAL.md', [
   ('Luiz: "o que devo fazer hoje?" ou pedido de continuidade', 'n'),
   ('Qualquer IA começa pelo PONTEIRO.md e pelo DECISOES-VIGENTES.md (raiz)', 'n'),
   ('IA lê os dois cronogramas, o registro diário e as fichas → blocos: publicar, construir, SEO, pendências, amanhã', 'n'),
   ('Luiz posta e escolhe a capa na hora', 'g'),
   ('IA registra só o confirmado (REGISTRO-DIARIO + ficha)', 'n'),
   ('SEO: segunda = exportações + "rotina semanal de SEO"; todo dia = 10–20 pedidos de indexação', 'n')]),
 ('12', 'Fechamento', 'PLANO-EVOLUCAO-CONTINUA.md', [
   ('Dia +30: métricas por rede (vídeo, blog, cortes, posts)', 'n'),
   ('Aprendizados no plano de evolução (M11)', 'n'),
   ('Decidir a 2ª leva de cortes e o próximo tema', 'g')]),
]

def wrap(t, n=40): return textwrap.wrap(t, n)

def fase_svg(num, titulo, ref, passos):
    W, x0, bw = 380, 20, 340
    y = 16; parts = []; boxes = []
    for txt, tipo in passos:
        ls = wrap(txt, 44 if tipo == 'n' else 40)
        h = 18 + 16 * len(ls)
        boxes.append((y, h, ls, tipo)); y += h + 26
    H = y - 10
    parts.append(f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Fase {num}: {html.escape(titulo)}, {len(passos)} passos em sequência">')
    parts.append('<defs><marker id="a%s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>' % num)
    for i, (by, h, ls, tipo) in enumerate(boxes):
        if tipo == 'g':
            parts.append(f'<rect x="{x0}" y="{by}" width="{bw}" height="{h}" rx="10" class="gate"/>')
            parts.append(f'<text x="{x0+14}" y="{by+22}" class="gt">◆</text>')
            tx = x0 + 34
        else:
            parts.append(f'<rect x="{x0}" y="{by}" width="{bw}" height="{h}" rx="10" class="box"/>')
            tx = x0 + 14
        for j, l in enumerate(ls):
            parts.append(f'<text x="{tx}" y="{by+22+16*j}" class="{"gtx" if tipo=="g" else "tx"}">{html.escape(l)}</text>')
        if i < len(boxes) - 1:
            ny = boxes[i+1][0]
            parts.append(f'<line x1="{x0+bw/2}" y1="{by+h}" x2="{x0+bw/2}" y2="{ny-2}" class="ln" marker-end="url(#a{num})"/>')
    parts.append('</svg>')
    return '\n'.join(parts)

def visao_geral():
    W, H = 1260, 300; r = 34; cols = 6; parts = []
    pos = []
    for i in range(12):
        row = i // cols; col = i % cols if row == 0 else cols - 1 - (i % cols)
        x = 110 + col * 196; y = 80 + row * 140
        pos.append((x, y))
    parts.append(f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Visão geral: 12 fases em sequência, da pauta ao fechamento, que alimenta a próxima pauta">')
    parts.append('<defs><marker id="ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>')
    rot = {'Pauta':'Pauta','Roteiro':'Roteiro','Estudo semiótico das cenas':'Estudo das cenas','Definição das peças (logo após o estudo)':'Definição das peças','Produção do vídeo':'Produção do vídeo','Embalagem do YouTube':'Thumb e YouTube','Artigos no blog':'Artigos no blog','Peças das redes':'Peças das redes','Cronograma':'Cronogramas','Publicação':'Publicação','Rotina diária e SEO':'Rotina diária e SEO','Fechamento':'Fechamento'}
    for i, (x, y) in enumerate(pos):
        if i < 11:
            nx, ny = pos[i+1]
            if ny == y:
                d = 1 if nx > x else -1
                parts.append(f'<line x1="{x+d*(r+4)}" y1="{y}" x2="{nx-d*(r+8)}" y2="{ny}" class="ln" marker-end="url(#ag)"/>')
            else:
                parts.append(f'<path d="M{x+r+2},{y} C{x+r+70},{y} {nx+r+70},{ny} {nx+r+8},{ny}" class="ln" marker-end="url(#ag)"/>')
    x, y = pos[11]; x0, y0 = pos[0]
    parts.append(f'<path d="M{x-r-4},{y} C{x-140},{y} {30},{y} {30},{y-70} L30,{y0+50} C30,{y0} {x0-r-60},{y0} {x0-r-8},{y0}" class="ln dash" marker-end="url(#ag)"/>')
    parts.append(f'<text x="44" y="{(y+y0)//2+4}" class="sm">próximo tema / 2ª leva</text>')
    for i, (x, y) in enumerate(pos):
        f = FASES[i]
        parts.append(f'<a href="#fase-{f[0]}"><circle cx="{x}" cy="{y}" r="{r}" class="{ "nodeacc" if f[0] in ("10","11") else "node"}"/>')
        parts.append(f'<text x="{x}" y="{y+7}" text-anchor="middle" class="num">{f[0]}</text></a>')
        parts.append(f'<text x="{x}" y="{y+r+20}" text-anchor="middle" class="lbl">{html.escape(rot[f[1]])}</text>')
    parts.append('</svg>')
    return '\n'.join(parts)

cards = []
for num, titulo, ref, passos in FASES:
    cards.append(f'''<section class="card" id="fase-{num}"><h2><span class="n">{num}</span>{html.escape(titulo)}</h2>
<p class="ref">{html.escape(ref)}</p><figure>{fase_svg(num, titulo, ref, passos)}</figure></section>''')

page = f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fluxo dos processos — Redes-sociais</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{{--bg:#F6F1E7;--fg:#1B1B1F;--mut:#6b6458;--card:#FFFDF8;--line:#d8cfbf;--acc:#C46D45;--accbg:#F6E3D8}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16161A;--fg:#ECE6DA;--mut:#a59d90;--card:#1F1F24;--line:#3a3a42;--acc:#E08A60;--accbg:#3a261d}}}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--fg);font-family:Inter,system-ui,sans-serif;line-height:1.45}}
header{{max-width:1240px;margin:0 auto;padding:40px 24px 8px}} h1{{font-family:'Bebas Neue';font-size:56px;letter-spacing:1px;margin:0;line-height:1}}
.sub{{color:var(--mut);max-width:820px;margin:10px 0 0}} main{{max-width:1240px;margin:0 auto;padding:12px 24px 48px}}
.overview{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 12px 4px;margin:18px 0 22px;color:var(--fg)}}
.legend{{display:flex;gap:22px;flex-wrap:wrap;color:var(--mut);font-size:14px;margin:6px 4px 18px}} .legend b{{color:var(--fg);font-weight:600}}
.sw{{display:inline-block;width:18px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:6px;border:1.5px solid var(--line);background:var(--card)}} .sw.g{{border-color:var(--acc);background:var(--accbg)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 14px 6px;color:var(--fg)}}
.card h2{{font-family:'Bebas Neue';font-weight:400;font-size:30px;letter-spacing:.5px;margin:0 4px;display:flex;align-items:center;gap:10px}}
.n{{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--fg);color:var(--bg);font-family:Inter;font-weight:600;font-size:15px}}
.ref{{margin:4px 6px 4px;color:var(--mut);font-size:12.5px;font-family:ui-monospace,Menlo,monospace;word-break:break-word}}
figure{{margin:0}} svg{{width:100%;height:auto;display:block;color:var(--fg)}}
.box{{fill:var(--card);stroke:var(--line);stroke-width:1.5}} .gate{{fill:var(--accbg);stroke:var(--acc);stroke-width:2}}
.tx{{font-size:13px;fill:currentColor}} .gtx{{font-size:13px;font-weight:600;fill:currentColor}} .gt{{font-size:14px;fill:var(--acc)}}
.ln{{stroke:currentColor;stroke-width:1.6;fill:none;opacity:.75}} .dash{{stroke-dasharray:6 6}}
.node{{fill:var(--card);stroke:currentColor;stroke-width:2}} .nodeacc{{fill:var(--accbg);stroke:var(--acc);stroke-width:2.5}}
.num{{font-size:20px;font-weight:600;fill:currentColor}} .lbl{{font-size:14px;font-weight:500;fill:currentColor}} .sm{{font-size:12px;fill:var(--mut)}}
.rules{{margin-top:22px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 20px}} .rules h2{{font-family:'Bebas Neue';font-weight:400;font-size:30px;margin:0 0 6px}}
.rules ul{{margin:0;padding-left:20px}} .rules li{{margin:4px 0}} a{{color:inherit}}
</style></head><body>
<header><h1>Fluxo dos processos</h1>
<p class="sub">Do tema ao fechamento de cada vídeo do Palavras, com as peças do perfil do Luiz e a rotina de todo dia. Cada número abre o detalhe da fase. As caixas com ◆ são os pontos em que Luiz aprova antes de seguir.</p></header>
<main>
<div class="overview"><figure>{visao_geral()}</figure></div>
<div class="legend"><span><span class="sw"></span><b>Passo</b> feito pela IA, por Luiz ou por um programa local</span><span><span class="sw g"></span><b>◆ Aprovação de Luiz</b></span><span><b>Fases 10 e 11</b> repetem toda semana e todo dia (cronograma)</span></div>
<div class="grid">{''.join(cards)}</div>
<section class="rules"><h2>Regras que valem em todas as fases</h2><ul>
<li>Luiz decide o escopo e aprova; planejar não é fazer; entregas já vêm completas.</li>
<li>Sem fonte não há etimologia nem regra; fontes externas citadas no roteiro (o palavras.co atual não é fonte).</li>
<li>Trabalho pesado (transcrição, render) roda local, sem IA; a IA orquestra, analisa e registra.</li>
<li>Voz e câmera reais, sem transformar o rosto do Luiz; som só da Biblioteca de Áudio do YouTube, com licença por item.</li>
<li>Tudo fica registrado na pasta: decisão no guia da área, andamento no ESTADO-DA-PECA do tema, execução diária em cronograma/REGISTRO-DIARIO.md.</li>
<li>Ordem de publicação: artigos → vídeo → redes. Um vídeo longo por semana, às quartas.</li>
</ul></section>
</main></body></html>'''
open('fluxo-dos-processos.html', 'w', encoding='utf-8').write(page)
print('ok', len(page))
