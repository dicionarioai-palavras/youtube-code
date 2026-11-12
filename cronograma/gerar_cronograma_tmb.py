# Gera a agenda do canal The Mind Behind (Markdown + CSV) em cronograma/.
# Rodar na pasta cronograma/:  python ../code/cronograma/gerar_cronograma_tmb.py
# Mudou algo (tema, data, modo dos cortes)? Edite AQUI e rode de novo; não edite só o .md.
import datetime as dt, csv, io

MODO_CORTES = 'um_por_dia'  # Luiz, 08/11/2026 (do EP03 em diante): 1 Short por dia, às 21h; um dia pode ter 2 (o extra às 16h). Foco na qualidade.
# Modos antigos: 'espalhado' (2 Shorts por dia, 16h e 21h) e 'junto' (os 4 no dia do longo).
INICIO, FIM = dt.date(2026,11,5), dt.date(2026,12,31)
SEM = ['seg','ter','qua','qui','sex','sáb','dom']
COLS = ['Longo (14h)', 'Shorts 16h', 'Shorts 21h', 'Produção (IA)', 'Luiz']
L, S12, S19, P, Z = range(5)
rows = {}
def add(d, c, t):
    # Fim de semana sem trabalho (Luiz, 07/11/2026): de 09/11 em diante, tarefa de produção (IA) ou de Luiz que cairia
    # no sábado/domingo vai para a sexta anterior; retornos de 7/28 dias vão para a segunda seguinte. Publicações não mudam.
    if c in (P, Z) and d >= dt.date(2026,11,9) and d.weekday() >= 5:
        d = d + dt.timedelta(7 - d.weekday()) if 'retorno' in t else d - dt.timedelta(d.weekday() - 4)
    if INICIO <= d <= FIM: rows.setdefault(d, {k: [] for k in COLS})[COLS[c]].append(t)

# Pauta: EP01 pronto; EP02–EP11 = proposta de novembro; EP12–EP25 = proposta de dezembro (aprovar no lote do mês).
# Alterna crime e mistério; casos de risco M ficam depois que o canal estiver rodando.
# Pauta (06/11/2026: 2 longos por semana, terça e sábado). EP01 já no ar (qui 05/11).
# EP02–EP07 = novembro; EP08–EP16 = dezembro (aprovar no lote do mês). Alterna crime e mistério.
# 07/11/2026 (Luiz, pela triagem de demanda `canal-the-mind-behind/pesquisa-de-demanda/2026-11-pauta.md`): EP06 Somerton -> Gary Ridgway; EP07 Dancing plague e EP08 Central Park Five (invertidos); Somerton para a reserva; D. B. Cooper entra no lugar antigo de Ridgway (dezembro, provisório até a triagem).
# 09/11/2026 (Luiz): a POC de envelopamento (`estudo-envelopamento/poc/POC-2026-11-09.md`, v3) é o primeiro episódio depois do EP08 (vira EP09);
# os demais andam uma vaga (Chikatilo -> EP10 ...); o Zodiac vira EP17 (ter 29/12). A triagem de dezembro (26/11) reordena EP10–EP16; o EP09 fica fixo.
_CASOS = ['Kitty Genovese (1964)', 'Dyatlov Pass (1959)', 'BTK / Dennis Rader (2005)', 'Mary Celeste (1872)', 'Norrmalmstorg, Estocolmo (1973)', 'Gary Ridgway (1982–2001)', 'Dancing plague (1518)', 'Central Park Five (1989)', 'POC envelopamento — The Victims Who Outsmarted Ted Bundy and Jeffrey Dahmer', 'Andrei Chikatilo (1978–1990)', 'Flannan Isles (1900)', 'Ed Kemper', 'Salem (1692)', 'D. B. Cooper (1971)', 'Jack the Ripper (1888)', 'Hinterkaifeck (1922)', 'Zodiac (1968–69)']
_DATAS = [dt.date(2026,11,5), dt.date(2026,11,7)]   # EP02 antecipado para sáb 07/11 (Luiz, 06/11/2026)
_d = dt.date(2026,11,10)
while len(_DATAS) < len(_CASOS):
    if _d.weekday() in (1,5): _DATAS.append(_d)
    _d += dt.timedelta(1)
PAUTA = [(f'EP{i+1:02d}', c, _DATAS[i]) for i, c in enumerate(_CASOS) if _DATAS[i] <= dt.date(2026,12,31)]
um = dt.timedelta(1)

# ---------- hoje (05/11): estreia ----------
add(INICIO, Z, 'Se o canal ainda não existe: criar, verificar por telefone e configurar (`canal-the-mind-behind/08-CANAL-YOUTUBE-CONFIG.md`, seções 1–4)')
add(INICIO, L, '🎬 EP01 — Kitty Genovese: subir `final/EP01-kitty-genovese-final.mp4` com o `PACOTE-YOUTUBE.md` (título, descrição, capítulos, thumb A, comentário fixado) — publicar **antes** dos Shorts')
EP01S = [(INICIO, S19, 'S1 38 WITNESSES?'), (INICIO+dt.timedelta(1), S12, 'S2 WHERE DID "38" COME FROM?'),
         (INICIO+dt.timedelta(1), S19, 'S3 WOULD YOU HELP?'), (INICIO+dt.timedelta(2), S12, "S4 SHE DIDN'T DIE ALONE")]
for d0, c, s in EP01S:
    add(d0, c, f'EP01 · {s} (`final/shorts/`; "vídeo relacionado" = EP01)')

# ---------- episódios seguintes ----------
FILA = []   # (ep, data do longo) — cortes distribuídos depois, 1 por dia às 21h
for n, (ep, caso, d) in enumerate(PAUTA):
    if ep == 'EP01': continue
    add(d, L, f'🎬 {ep} — {caso} (agendado no Studio na véspera)')
    if ep in ('EP02', 'EP03'): continue   # tratados à parte abaixo (07/11/2026)
    # cortes
    if MODO_CORTES == 'um_por_dia':
        FILA.append((ep, d))
    elif MODO_CORTES == 'junto':
        for k in range(1, 5): add(d, S19, f'{ep} · corte S{k}')
    else:
        add(d, S19, f'{ep} · S1 (gancho principal)')
        add(d+um, S12, f'{ep} · S2'); add(d+um, S19, f'{ep} · S3')
        add(d+2*um, S12, f'{ep} · S4')
    # produção: D-3 roteiro · D-2 aprovação + voz + imagens · D-1 montagem + aprovação do corte
    add(d-3*um, P, f'IA: aprofundamento da demanda do {ep} (`DEMANDA.md`: perguntas do público, o que os maiores vídeos já disseram, brecha) e roteiro ({caso}) em EN + PT')
    add(d-2*um, Z, f'{ep}: aprovar o `ROTEIRO-PT.md` (até 12h)')
    add(d-2*um, P, f'IA: {ep} narração EN + faixa PT-BR (ElevenLabs) + conferência + imagens (Runway)')
    add(d-um, P, f'IA: {ep} montagem, render, thumbs e 4 cortes (faixas PT-BR do longo e dos cortes; abertura nova no corte se o gancho tiver nota < 50)')
    add(d-um, Z, f'{ep}: assistir e aprovar o vídeo e os 4 cortes (com as aberturas novas em PT); agendar longo 14h + cortes + post na comunidade (18h do dia do longo; `canal-the-mind-behind/comunidade/POSTS-COMUNIDADE.md`)')

# ---------- EP02 (feito) e EP03 (07/11/2026) ----------
# EP02 produzido e aprovado em 06–07/11; cortes nos horários livres depois do lote 0.
add(dt.date(2026,11,6), P, 'IA: EP02 completo — narração EN + PT-BR, imagens (direção visual v2), montagem, thumbs e pacote (feito)')
add(dt.date(2026,11,7), P, 'IA: EP02 — 4 cortes + faixas PT-BR (feito)')
for d0, c, s_ in [(dt.date(2026,11,10), S19, 'S1 fear decides first'), (dt.date(2026,11,11), S12, 'S2 one cut in the snow'),
                  (dt.date(2026,11,11), S19, 'S3 too small to believe'), (dt.date(2026,11,12), S12, 'S4 the one who turned back')]:
    add(d0, c, f'EP02 · {s_} (`final/shorts/`; "vídeo relacionado" = EP02)')
# POST COMUNIDADE EP01/EP02 (já no ar): seg 09/11 e qua 11/11, 18h
add(dt.date(2026,11,9), Z, 'Post na comunidade do EP01 (18h; texto e imagens em `canal-the-mind-behind/comunidade/POSTS-COMUNIDADE.md`) + programar o do EP02 (qua 11/11, 18h) e o do EP03 (ter 10/11, 18h)')
# EP03 vai ao ar ter 10/11 14h; toda a produção concentrada na seg 09/11 (pedido de Luiz, 07/11/2026).
add(dt.date(2026,11,9), P, 'IA (cedo): `DEMANDA.md` do EP03 (nota 6,7, amarelo: título e tese pelo mecanismo, não pelo nome do caso) e roteiro do EP03 (BTK / Dennis Rader, 2005) em EN + PT, com PESQUISA-FONTES e checagem de risco (pessoa viva condenada: status jurídico correto; vítimas sem descrição gráfica)')
add(dt.date(2026,11,9), Z, 'EP03: aprovar o `ROTEIRO-PT.md` (até 11h)')
add(dt.date(2026,11,9), P, 'IA (depois do ok): EP03 completo — narração EN + PT-BR, imagens (direção visual v2), montagem, render, 3 thumbs e `PACOTE-YOUTUBE.md` (modelo do EP02)')
add(dt.date(2026,11,9), Z, 'EP03 (noite): assistir, aprovar e agendar ter 10/11 14h; subir as 3 thumbs no "Testar e comparar" e a faixa PT-BR')
# (07/11/2026) resolvido e removido: dt.date(2026,11,9), P, 'IA: novo planejamento da agenda …
# (07/11/2026) resolvido e removido: dt.date(2026,11,9), Z, 'Aprovar o novo planejamento (gra…
# (07/11/2026) resolvido e removido: dt.date(2026,11,9), Z, 'Decidir: (a) frase de abertura n…
add(dt.date(2026,11,9), Z, 'EP01 no Studio: pôr card para o EP02 aos 7:29 (a descrição já foi corrigida pela IA em 07/11)')
# (07/11/2026) Luiz: as 7 traduções que deram erro ficam sem por enquanto; inglês, português e espanhol bastam.
add(dt.date(2026,11,9), Z, 'EP02: passar à IA as notas das 3 thumbs no "Testar e comparar" (abaixo de 87, a IA refaz)')
# EP03 · cortes (grade aprovada por Luiz em 07/11/2026): ocupam qui 12/11 21h, sex 13/11 16h e 21h e sáb 14/11 16h;
# o lote 1 de Shorts originais cai para 2 (seg 16/11 21h e ter 17/11 16h).
add(dt.date(2026,11,10), P, 'IA (depois do EP03 no ar): 4 cortes do EP03 pela `yt-shorts` + faixas PT-BR; abertura nova onde o gancho tiver nota < 50')
# 08/11/2026 (Luiz): do EP03 em diante, 1 Short por dia às 21h (um dia pode ter 2; o extra vai às 16h). Os cortes do EP03 entram na fila a partir de qui 12/11.
add(dt.date(2026,11,11), Z, 'EP03 · cortes: aprovar os 4 (com as aberturas novas em PT) e programar nas datas da agenda (1 por dia, 21h)')
USO = {}   # (data, coluna) ocupados
for (d0, c) in [(dt.date(2026,11,10), S19), (dt.date(2026,11,11), S12), (dt.date(2026,11,11), S19), (dt.date(2026,11,12), S12)]: USO[(d0, c)] = 1   # cortes do EP02 (já na grade)
for k_,(d0,c) in enumerate([(dt.date(2026,11,7),S19),(dt.date(2026,11,8),S12),(dt.date(2026,11,8),S19),(dt.date(2026,11,9),S12),(dt.date(2026,11,9),S19),(dt.date(2026,11,10),S12)]): USO[(d0, c)] = 1   # lote 0
FILA_EP03 = [('EP03', dt.date(2026,11,12))]
def _distribui():
    todos = [('EP03', dt.date(2026,11,12), True)] + [(e, d, False) for e, d in FILA if e != 'EP03']
    for e, d, _ in todos:   # S1 de cada longo: dia do longo, 21h (o do EP03 vai para qui 12/11)
        USO[(d, S19)] = 1; add(d, S19, f'{e} · S1 (gancho principal; "vídeo relacionado" = {e})')
    for e, d, _ in todos:
        dia = d
        for k in (2, 3, 4):
            dia = dia + um
            if (dia, S19) not in USO: USO[(dia, S19)] = 1; add(dia, S19, f'{e} · S{k}')
            elif (dia, S12) not in USO: USO[(dia, S12)] = 1; add(dia, S12, f'{e} · S{k} (2º Short do dia)')
            else:
                while (dia, S19) in USO: dia += um
                USO[(dia, S19)] = 1; add(dia, S19, f'{e} · S{k}')

# ---------- Shorts originais (06/11/2026): completam 2 Shorts por dia ----------
# Semana-padrão (longos ter e sáb): cortes ocupam ter 21h, qua 16h/21h, qui 16h, sáb 21h, dom 16h/21h, seg 16h.
# Os 6 horários restantes são Shorts originais: qui 21h, sex 16h, sex 21h, sáb 16h, seg 21h, ter 16h.
# Lote semanal: ter a IA escreve os 6 roteiros · qua Luiz aprova até 12h, a IA produz, Luiz programa à noite.
ORIG_SLOTS = [(1,S19),(2,S12),(2,S19),(3,S12),(5,S19),(6,S12)]   # dias depois da quarta do lote: qui 21h, sex 16h, sex 21h, sáb 16h, seg 21h, ter 16h
# Lote 0 (estreia da nova estratégia): sáb 07 21h, dom 08 16h e 21h, seg 09 16h e 21h, ter 10 16h
L0 = [(dt.date(2026,11,7),S19),(dt.date(2026,11,8),S12),(dt.date(2026,11,8),S19),(dt.date(2026,11,9),S12),(dt.date(2026,11,9),S19),(dt.date(2026,11,10),S12)]
for k,(d0,c) in enumerate(L0,1): add(d0, c, f'Short original · lote 0 · O{k} (`shorts-originais/lote-00/`)')
add(dt.date(2026,11,6), P, 'IA: roteiros dos 6 Shorts originais do lote 0 (EN + PT de leitura), com gancho e CTA próprios — `10-SHORTS-ORIGINAIS.md`')
add(dt.date(2026,11,7), Z, 'Lote 0 dos Shorts originais: aprovar os textos em PT (manhã) e programar os 6 no Studio (até 18h)')
add(dt.date(2026,11,7), P, 'IA: lote 0 — narração, imagens (Runway), render dos 6 Shorts originais')
lote = 1; qua = dt.date(2026,11,11)
# 08/11/2026 (Luiz): com 1 Short por dia, os cortes ocupam todos os dias; Shorts originais do lote 1 em diante ficam PAUSADOS (foco na qualidade).
while MODO_CORTES != 'um_por_dia' and qua <= FIM:
    slots = [(5,S19),(6,S12)] if lote == 1 else ORIG_SLOTS   # lote 1 só com 2: os cortes do EP03 ocupam os outros 4 horários
    n = len(slots)
    add(qua - um, P, f'IA: roteiros dos {n} Shorts originais do lote {lote} (EN + PT de leitura; só inglês na voz), cada tema com nota de demanda (versão curta)')
    add(qua, Z, f'Shorts originais lote {lote}: aprovar os textos em PT até 12h; à noite, programar os {n} no Studio')
    add(qua, P, f'IA: lote {lote} — narração EN, imagens, render dos {n} Shorts originais (sem faixa PT-BR)')
    for k,(off,c) in enumerate(slots,1):
        add(qua + off*um, c, f'Short original · lote {lote} · O{k}')
    lote += 1; qua += 7*um

if MODO_CORTES == 'um_por_dia': _distribui()

# ---------- pesquisa de demanda (Luiz, 07/11/2026) ----------
# Retorno aos 7 e 28 dias de cada longo publicado (dados do próprio canal pelo vidIQ) e triagem da pauta de dezembro antes da aprovação.
for ep, caso, d0 in PAUTA:
    if d0 + 7*um <= FIM: add(d0 + 7*um, P, f'IA: retorno de 7 dias do {ep} ({caso}) no vidIQ → `canal-the-mind-behind/pesquisa-de-demanda/RESULTADOS.md`')
    if d0 + 28*um <= FIM: add(d0 + 28*um, P, f'IA: retorno de 28 dias do {ep} ({caso}) → `RESULTADOS.md` (a cada 4 episódios, leitura nota × resultado)')
add(dt.date(2026,11,26), P, 'IA: triagem de demanda da pauta de dezembro (EP09–EP16 + reservas) no vidIQ → `canal-the-mind-behind/pesquisa-de-demanda/2026-12-pauta.md`, com ordem recomendada')

# ---------- rotina ----------
d = INICIO
while d <= FIM:
    if d.weekday() == 0:
        add(d, Z, 'Métricas da semana no Studio (~10 min): CTR e retenção dos longos, views dos Shorts → pedir à IA "leitura da semana The Mind Behind"')
    d += um
add(dt.date(2026,11,6), Z, 'Canal: conferir se as funcionalidades avançadas foram liberadas. Se o envio de áudio aparecer em Idiomas: carregar as faixas PT-BR novas do EP01 e dos 4 Shorts (`final/pt-br/`, refeitas sem aceleração)')
add(dt.date(2026,11,6), Z, 'Aprovar a pauta de novembro (EP02–EP07, abaixo)')
add(dt.date(2026,11,27), Z, 'Aprovar a pauta de dezembro (EP09–EP16), pela triagem de demanda de 26/11')
# (09/11/2026, Luiz) movido para a organização de dezembro: add(dt.date(2026,11,15), Z, 'Canal: criar as 3 playlists e colocar EP01 em Myths That Fooled the World, EP02 em Unsolved Mysteries, Explained, EP03 em True Crime Psychology (`08-CANAL-YOUTUBE-CONFIG.md`, passo 7)')
# (09/11/2026, Luiz) movido para a organização de dezembro: add(dt.date(2026,11,15), Z, 'Canal: trailer = Short S1 do EP01; destaque para inscritos = episódio mais recente (`08-CANAL-YOUTUBE-CONFIG.md`, passo 4)')
add(dt.date(2026,12,1), Z, 'Organização do canal (até sex 11/12; Luiz, 09/11/2026): criar as 3 playlists com todos os episódios, trailer, vídeo em destaque, seções da página inicial, comentário fixado, tela final/cards e vídeo relacionado onde faltar — `cronograma/ORGANIZACAO-DAS-REDES-DEZEMBRO-2026.md` (vale também para Palavras e Luiz)')
add(dt.date(2026,12,4), Z, 'Depois da revisão com dados: escolher trailer (melhor Short de novembro) e vídeo em destaque')
add(dt.date(2026,12,11), Z, 'Decidir se cria Instagram e TikTok do The Mind Behind (números de novembro, custo extra, referência de nicho) — `cronograma/ORGANIZACAO-DAS-REDES-DEZEMBRO-2026.md`')
# (07/11/2026) removido: 'decidir thumb A ou B do EP01' — a thumb K já é a final desde 06/11 (REGISTRO-DIARIO).

# ---------- saída ----------
dias = []; d = INICIO
while d <= FIM: dias.append(d); d += um
md = io.StringIO()
md.write(f'''# Agenda do canal The Mind Behind (05/11 a 31/12/2026)

> **O que fazer em cada dia (e o que já sai sozinho) está em `AGENDA-DIARIA.md`** (09/11/2026), junto com Luiz e Palavras. Instagram e TikTok do canal saem pelo PostEverywhere; YouTube, programado no Studio.

Gerado por `code/cronograma/gerar_cronograma_tmb.py` (editar o script e rodar de novo; não editar só este arquivo). Versão planilha: `CRONOGRAMA-THE-MIND-BEHIND.csv`.

- **Horários (Luiz, 08/11/2026; público-alvo EUA/Reino Unido/Canadá/Austrália, não o Brasil):** longos às **14h de Brasília** (= 12h em Nova York, 9h em Los Angeles, 17h em Londres); Shorts às **16h** (14h NY / 19h Londres) e **21h** (19h NY / 16h LA). Fonte: `canal-the-mind-behind/HORARIOS-DE-POSTAGEM.md`.\n- **Longos:** **terça e sábado, 14h** (Brasília) — decisão de Luiz em 06/11/2026 (antes eram 3 por semana). EP01 saiu na qui 05/11; EP02 antecipado para sáb 07/11 (Luiz, 06/11/2026); EP03 na ter 10/11 e daí em diante terça e sábado.\n- **Shorts: 2 por dia, todos os dias (16h e 21h).** 4 cortes de cada longo (8 por semana) + **6 Shorts originais por semana**, de temas próprios, com gancho e CTA próprios (`canal-the-mind-behind/10-SHORTS-ORIGINAIS.md`), produzidos em lote toda quarta.
- **Shorts:** modo `{MODO_CORTES}`. {"**1 por dia, às 21h (Luiz, 08/11/2026, do EP03 em diante)**: S1 no dia do longo, S2–S4 nos dias seguintes; quando os cortes de dois longos se encontram, o dia ganha um 2º Short às 16h. Foco na qualidade. Shorts originais do lote 1 em diante pausados." if MODO_CORTES == "um_por_dia" else MODO_CORTES}`. {"Dois por dia, 16h e 21h: o S1 sai no dia do longo, às 21h; os outros três nos dois dias seguintes. Assim o canal aparece todo dia e cada longo recebe empurrão até o próximo." if MODO_CORTES=="espalhado" else "Os quatro saem no dia do longo, depois dele."} Trocar o modo: `MODO_CORTES` no topo do script. Decisão de Luiz (05/11): espalhar desde o EP01.
- **Produção de cada episódio (D = dia do longo):** D−3 a IA entrega o roteiro EN + PT · D−2 Luiz aprova o PT até 12h, a IA gera voz e imagens · D−1 a IA monta e Luiz aprova o corte e agenda. Com longos na terça e no sábado, a produção de um começa enquanto o outro está indo ao ar.
- **Pauta:** proposta pela IA a partir de `canal-the-mind-behind/03-BANCO-DE-CASOS.md`, **com triagem de demanda de todos os casos** (`canal-the-mind-behind/pesquisa-de-demanda/AAAA-MM-pauta.md`, desde 07/11/2026), ordenada pela nota e alternando crime e mistério. Luiz aprova em lote por mês; trocar um tema = trocar a linha em `PAUTA` no script.
- **Quem publica é Luiz** (agendando no Studio na véspera). A IA não publica.
''')
cur = None
for d in dias:
    wk = d.isocalendar()[1]
    if wk != cur:
        cur = wk; seg = d - dt.timedelta(d.weekday())
        md.write(f'\n## Semana de {seg.strftime("%d/%m")}\n\n| Data | ' + ' | '.join(COLS) + ' |\n|' + '---|'*(len(COLS)+1) + '\n')
    r = rows.get(d, {k: [] for k in COLS})
    md.write(f'| {SEM[d.weekday()]} {d.strftime("%d/%m")} | ' + ' | '.join('<br>'.join(r[k]) or '—' for k in COLS) + ' |\n')
md.write('\n## Pauta proposta\n\n| EP | Caso | Vai ao ar | Situação |\n|---|---|---|---|\n')
for ep, caso, d in PAUTA:
    sit = 'pronto' if ep in ('EP01', 'EP02', 'EP03') else ('fixado por Luiz em 09/11 (POC de envelopamento; fora da triagem)' if ep == 'EP09' else 'aprovada por Luiz em 07/11 (triagem de demanda)' if d.month == 11 else 'pauta de dezembro — aprovar, com triagem de demanda antes')
    md.write(f'| {ep} | {caso} | {SEM[d.weekday()]} {d.strftime("%d/%m")} | {sit} |\n')
md.write('''
Reserva no banco de casos: The Somerton Man (nota 5,1 em 07/11), Tanganyika, Charles Ponzi, The Isdal Woman, Lizzie Borden, Bernie Madoff, Frank Abagnale, Amanda Knox, Anna Sorokin; Ted Bundy, Ed Gein, Chris Watts, Elisa Lam (risco M); Jonestown fica adiado (risco A).

## O que precisa estar coberto (2 longos + 14 Shorts por semana)
- **ElevenLabs:** ~13 mil caracteres por longo + ~700 por Short original → ~30 mil por semana, ~130 mil por mês (só inglês): é o limite do plano Creator. Faixa PT-BR (opcional) dobra o gasto dos longos. Restam ~107 mil neste ciclo.
- **Runway (API):** ~90–120 créditos por longo + ~8 por Short original → ~250 por semana. Saldo da API ~200: comprar créditos da API (os do site não valem na API).
- **Render:** ~1 h por longo + ~15 min para os 4 cortes + ~20 min por lote de Shorts originais, feito pela IA.
''')
open('CRONOGRAMA-THE-MIND-BEHIND.md', 'w', encoding='utf-8').write(md.getvalue())
with open('CRONOGRAMA-THE-MIND-BEHIND.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['Data','Dia'] + COLS + ['Feito?'])
    for d in dias:
        r = rows.get(d, {k: [] for k in COLS}); w.writerow([d.strftime('%d/%m/%Y'), SEM[d.weekday()]] + [' | '.join(r[k]) for k in COLS] + [''])
print(len(dias), 'dias,', len(PAUTA), 'episódios, modo', MODO_CORTES)
