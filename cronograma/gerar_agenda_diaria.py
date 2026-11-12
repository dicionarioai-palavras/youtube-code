# Gera cronograma/AGENDA-DIARIA.md — a agenda única de Luiz (Luiz, Palavras e The Mind Behind).
# Uso: rodar a partir da pasta Redes-sociais:  python code/cronograma/gerar_agenda_diaria.py
# Fontes: (1) agendados-posteverywhere.json (fotografia do PostEverywhere; o Claude atualiza);
#         (2) YT_STUDIO abaixo (o que está programado direto no YouTube Studio);
#         (3) TAREFAS abaixo (o que só Luiz pode fazer). Para mudar a agenda, edite aqui e rode de novo.
import json, datetime as dt, os
BR=dt.timezone(dt.timedelta(hours=-3))
SEM=['seg','ter','qua','qui','sex','sáb','dom']
HERE=os.path.dirname(os.path.abspath(__file__))
def d(s): return dt.date(2026,int(s[3:5]),int(s[:2]))
auto={}   # data -> [(hora, marca, texto)]
def A(data,hora,marca,txt): auto.setdefault(data,[]).append((hora,marca,txt))
MARCA={'IG Luiz':'Luiz','TikTok Luiz':'Luiz','YT Luiz':'Luiz','IG Palavras':'Palavras','TikTok Palavras':'Palavras','YT Palavras':'Palavras','IG TMB':'The Mind Behind','TikTok TMB':'The Mind Behind','YT TMB':'The Mind Behind'}
# ---------- (1) PostEverywhere ----------
for p in json.load(open(os.path.join(HERE,'agendados-posteverywhere.json'),encoding='utf-8')):
    t=dt.datetime.fromisoformat(p['when'].replace('Z','+00:00')).astimezone(BR)
    redes=', '.join(a.replace(' Luiz','').replace(' Palavras','').replace(' TMB','') for a in p['accs'])
    peca=p['media'].replace('.mp4','') if p['n']==1 else f"carrossel de {p['n']} imagens"
    if p['accs']==['YT TMB']: continue   # envios do lote para o Studio: não são publicações
    marca=MARCA[p['accs'][0]]
    tipo='story' if p['first'] in ('Por que o olho volta?','O que a conta esconde?','Volta pro começo da frase.','O estúdio vira karaokê.','Aqui é bastidor, mano.','Antes de gravar, o ritual.','A IA deu opções e eu escolhi esta frase.','Gravei "pra quê?" 9 vezes.','Escrevendo o roteiro sobre inveja e me pegando no flagra.') and len(p['accs'])==1 and p['accs'][0].startswith('IG') else ''
    A(t.date(),t.strftime('%Hh%M').replace('h00','h'),marca,f"{peca} · {redes}{' (story)' if tipo else ''}")
# ---------- (2) YouTube Studio (programado no próprio YouTube) ----------
YT_STUDIO=[
 ('10/11','14h','The Mind Behind','🎬 EP03 longo (BTK) estreia'),
 ('17/11','14h','The Mind Behind','🎬 EP06 longo (Green River) estreia'),
 ('10/11','16h','The Mind Behind','Short O6 (YouTube)'),('10/11','21h','The Mind Behind','Short EP02-S1 (YouTube)'),
 ('11/11','18h','Palavras','🎬 INVEJA longo estreia (youtu.be/phIgSiM9AMQ)'),
 ('12/11','20h','Palavras','Short "Até onde esse olhar vai?" (YouTube)'),('13/11','20h','Palavras','Short "Você chamou pelo nome?" (YouTube)'),
 ('15/11','20h','Palavras','Short "A mesma dor leva aonde?" (YouTube)'),('20/11','20h','Palavras','Short "Por que o olho volta?" (YouTube)'),
 ('27/11','20h','Palavras','Short "O que a conta esconde?" (YouTube)'),
 ('18/11','18h','Palavras','🎬 CIÚME longo estreia'),
 ('19/11','20h','Palavras','Short Ciúme C1 "Me passa tua localização?" (YouTube)'),('21/11','20h','Palavras','Short Ciúme C4 "Quem é Rafa?" (YouTube)'),
 ('22/11','20h','Palavras','Short Ciúme C0 "Não é ciúme, é cuidado" (YouTube)'),('23/11','20h','Palavras','Short Ciúme C6 "Chegou bem? × Chegou com quem?" (YouTube)'),
 ('24/11','20h','Palavras','Short Ciúme C2 "Zeloso no currículo" (YouTube)'),('26/11','20h','Palavras','Short Ciúme C3 "Em francês, ciúme é persiana" (YouTube)'),
 ('10/11','18h','The Mind Behind','Post da comunidade EP03'),
]
# 11/11/2026 (Luiz): agenda do TMB limpa — só os Shorts do EP03, 1 por dia às 21h, até o EP06 (17/11). Ver canais/the-mind-behind/estrategia/agenda/AGENDA-2026-11-11.md
CUTS={'EP03-S1':'12/11 21h','EP03-S2':'13/11 21h','EP03-S3':'14/11 21h','EP03-S4':'15/11 21h'}
for c,w in CUTS.items(): YT_STUDIO.append((w[:5],w[6:],'The Mind Behind',f'Short {c} (YouTube)'))
for s,h,m,t in YT_STUDIO: A(d(s),h,m,t)
# ---------- (3) O que só Luiz faz ----------
TAREFAS={
 "11/11": [
  "✅ feito (Luiz, 11/11) — TMB: subir no Studio a capa nova (`identidade-visual/the-mind-behind/youtube/tmb-banner-terca.png`) e colar a descrição \"toda terça\" (inglês, português e espanhol); trocar as bios do Instagram e do TikTok (textos no fim de `canais/the-mind-behind/guias/08-CANAL-YOUTUBE-CONFIG.md`)",
  "✅ feito (Luiz, 11/11) — TMB: agendar o EP06 (Green River) no Studio para ter 17/11, 14h, e fazer a parte do EP06 na aba \"Ajustes por lote\" de `cronograma/AJUSTES-MANUAIS-THE-MIND-BEHIND.xlsx` (com o *Testar e comparar* do E14). O relacionado dos Shorts do EP06 não vale mais: eles saíram da agenda.",
  "✅ feito (Luiz, 11/11) — Conferir no Studio o post da comunidade do Palavras programado para 19h (texto \"Seu amigo é promovido…\", imagem `inveja-instagram-carrossel-01.png`)",
  "Pedir ao Claude: \"trocar os artigos do Inveja para a versão com o vídeo\" e depois pedir a reindexação no Search Console"
 ],
 "12/11": [
  "✅ feito (Luiz, 12/11) — Ciúme: partes S13–S29 no Premiere; montagem pronta",
  "Ciúme: subir o longo no Studio e programar para qua 18/11, 18h (título, descrição, tags, legenda .srt, Testar e comparar A × B1) e os 6 Shorts (19 a 26/11, 20h) — tudo em `canais/palavras/episodios/ep02-ciume/youtube-publicacao/` e `redes/youtube/shorts/`"
 ],
 "13/11": [
  "Palavras · Homem-criança: aprovar a decomposição do viral de origem",
  "TMB · EP03, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "16/11": [
  "The Mind Behind: corrigir o nome do perfil do TikTok (themindbehindcases → The Mind Behind)",
  "Ciúme (blog): pedir ao Claude \"publicar os artigos de hoje\" (pilar e crônica) e pedir a indexação",
  "Palavras · Homem-criança: aprovar o roteiro",
  "Palavras · Inveja, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras: Shorts originais — a confirmar com as regras novas de validação que Luiz vai trazer (Shorts feitos para Short; corte do longo só com critério)",
  "Ler o radar semanal (roda sozinho às 7h41; arquivo em `estudos/envelopamento/radar/`)"
 ],
 "17/11": [
  "Ciúme: conferir no Studio que o longo está programado para qua 18/11, 18h, com o Testar e comparar ligado",
  "TMB: semana de Luiz desenvolver o vídeo na estrutura nova (17 a 24/11). Instruções novas virão de Luiz; EP04, EP05, EP07 e EP08 parados por tempo indeterminado",
  "TMB · EP03, leitura do dia 7–10 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras · Homem-criança: narrar e editar (17 a 20/11)"
 ],
 "18/11": [
  "Ciúme: me mandar o link do vídeo; nos 6 Shorts do Ciúme, marcar o \"Vídeo relacionado\" = Ciúme (se o Studio não deixou antes)",
  "Pedir ao Claude: \"trocar os artigos do Ciúme para a versão com o vídeo\"",
  "Palavras: escolher o tema do vídeo de 02/12 entre os 3 candidatos que o Claude traz (busca no vidIQ, até 20 créditos)"
 ],
 "19/11": [
  "Ciúme (blog): pedir \"publicar o artigo de hoje\" (Ciúme ou ciúmes?) e pedir a indexação",
  "TMB: (estrutura nova em desenvolvimento por Luiz; a POC e a produção antigas de 19 e 20/11 saíram da agenda — aguardar instruções)"
 ],
 "20/11": [
  "TMB · EP06, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "23/11": [
  "Palavras · Homem-criança: subir os artigos do blog",
  "Palavras · Ciúme, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "24/11": [
  "TMB: fim da semana de desenvolvimento da estrutura nova (data do próximo vídeo no ar a definir por Luiz)",
  "Palavras · Homem-criança: agendar para qua 25/11, 18h",
  "TMB · EP06, leitura do dia 7–10 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "25/11": [
  "🎬 Palavras · Homem-criança estreia 18h: ligar o *Testar e comparar* (A2 × A × B) quando ficar público; post da comunidade às 19h",
  "Palavras · Inveja, leitura do dia 14 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras: escolher o tema do vídeo de 09/12 entre os 3 candidatos do Claude (busca no vidIQ, até 20 créditos)"
 ],
 "26/11": [
  "Ciúme (blog): pedir \"publicar o artigo de hoje\" (Capitu traiu Bentinho?) e pedir a indexação"
 ],
 "27/11": [
 ],
 "30/11": [
  "Luiz: se quiser, fixar no topo do Instagram o post \"Pra que nove vezes\" (sai hoje às 20h)",
  "Palavras · Homem-criança, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "01/12": [
  "TMB: próximo longo e Shorts originais — a definir com a estrutura nova de Luiz",
  "Palavras.co: quando os créditos do Claude reiniciarem, novo lote de enriquecimento de verbetes (mínimo 150; mais se o orçamento permitir)",
  "🗂 Começa a organização das redes (até 11/12): `cronograma/ORGANIZACAO-DAS-REDES-DEZEMBRO-2026.md`",
  "🧹 Limpeza da pasta, onda 2: pedir ao Claude a lista da mídia do Ciúme, do EP06 e das sessões brutas do Inveja para apagar (regra em `DECISOES-VIGENTES.md`, seção 7)"
 ],
 "02/12": [
  "🎬 Palavras · Vídeo 4 estreia 18h (*Testar e comparar*: thumb clone × padrão Palavras — 2º vídeo da E1)",
  "Palavras · Ciúme, leitura do dia 14 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "03/12": [
  "Ciúme (blog): pedir \"publicar o artigo de hoje\" (Ciúme é prova de amor?) e pedir a indexação",
  "TMB · EP01, leitura do dia 28: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "04/12": [
  "📊 Palavras: revisão com os dados de novembro (define a bateria de dezembro)",

 ],
 "07/12": [
  "TMB · EP02, leitura do dia 28 (caiu no sábado): pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras · Vídeo 4, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "08/12": [
  "TMB: vídeo da semana (a confirmar com a estrutura nova)",
  "TMB · EP03, leitura do dia 28: pedir ao Claude o prompt da leitura e colar os números do Studio",

 ],
 "09/12": [
  "🎬 Palavras · Vídeo 5 estreia 18h (3º vídeo da E1)",
  "Palavras · Homem-criança, leitura do dia 14 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras · Inveja, leitura do dia 28: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "11/12": [
  "🗂 Fim da organização das redes e da centralização dos documentos"
 ],
 "14/12": [
  "🚀 Luiz (Instagram e TikTok): começar o planejamento das redes de Luiz com foco em crescimento; YouTube de Luiz só como espelho, sem foco. Foco invertido em relação a Palavras e The Mind Behind (lá o foco é o YouTube). Ver `cronograma/PLANO-REDES-LUIZ-CRESCIMENTO-DEZ-2026.md`",
  "Palavras · Vídeo 5, leitura de 72 h: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "15/12": [
  "TMB: vídeo da semana (a confirmar com a estrutura nova)",
  "TMB · EP06, leitura do dia 28: pedir ao Claude o prompt da leitura e colar os números do Studio"
 ],
 "16/12": [
  "🎬 Palavras · vídeo da semana estreia 18h (tema a definir)",
  "Palavras · Ciúme, leitura do dia 28: pedir ao Claude o prompt da leitura e colar os números do Studio",
  "Palavras · Vídeo 4, leitura do dia 14 (decide): pedir ao Claude o prompt da leitura e colar os números do Studio"
 ]
}
REGRA_FIXADO='Regra (Luiz, 10/11/2026): deixar o vídeo não listado não libera o comentário; o comentário fixado se faz logo depois que o longo é publicado (textos no pacote de cada vídeo). Estreia em fim de semana: fixar na segunda.'
SEMPRE=['🤖 Claude, de manhã: consultar o plano no PostEverywhere (status, fim do teste, cobrança no cartão) e avisar Luiz. O plano STARTER já tem o cartão dele; a cobrança é automática no fim do teste (dom 16/11, 15h18) e não há nada a fazer além de acompanhar','Responder os comentários de ontem (YouTube, Instagram e TikTok)','Abrir o PostEverywhere (e-mail ou painel) e ver se algum post deu "falhou"; se deu, me avisar']
UTIL=[]  # verbetes: sem meta diária; enriquecimento em lote mensal pelo Claude, mínimo 150 (Luiz, 10/11/2026)
INDEX='Indexação no Google: verbetes de hoje + 10–20 URLs da lista'  # pausada até o deploy do site novo (qua 18/11, Luiz 10/11/2026)
# comentário fixado logo depois de cada estreia de longo (fim de semana → segunda)
FIXADO_FEITO={'11/11':'Luiz, 11/11'}  # comentário fixado já feito (confirmado por Luiz)
for s_,h_,m_,t_ in YT_STUDIO:
    if '🎬' in t_:
        dd=d(s_); nome=t_.replace('🎬 ','').replace(' estreia','').split(' (youtu')[0]
        if dd.weekday()>=5:
            dd=dd+dt.timedelta(7-dd.weekday()); txt=f'Comentar e fixar no {nome} ({m_}), que estreou no fim de semana'
        else: txt=f'Logo depois das {h_}: comentar e fixar no {nome} ({m_}), quando ficar público'
        if dd.strftime('%d/%m') in FIXADO_FEITO: txt=f"✅ feito ({FIXADO_FEITO[dd.strftime('%d/%m')]}) — "+txt
        TAREFAS.setdefault(dd.strftime('%d/%m'),[]).insert(0,txt)
# ---------- saída ----------
ini,fim=dt.date(2026,11,10),dt.date(2026,12,18)
o=['# Agenda diária de Luiz — Luiz, Palavras e The Mind Behind','',
 'Gerada por `code/cronograma/gerar_agenda_diaria.py`. **Uso:** de manhã, abra o Claude e pergunte "o que tem para hoje?"; ele lê o dia aqui (e confere o PostEverywhere).',
 'Cada dia tem duas partes: **🙋 Você faz** (o que só você pode fazer) e **🤖 Sai sozinho** (já agendado no PostEverywhere ou no YouTube Studio — não precisa tocar). Horários de Brasília.',
 'Fim de semana sem tarefas suas: o que cai no sábado ou no domingo passa para segunda.',REGRA_FIXADO,'']
x=ini
while x<=fim:
    k=x.strftime('%d/%m'); fds=x.weekday()>=5
    o.append(f'## {SEM[x.weekday()]} {k}')
    t=TAREFAS.get(k,[])
    o.append('**🙋 Você faz**')
    if fds and not t: o.append('- Nada (fim de semana).')
    else:
        for i in t: o.append(f'- [ ] {i}')
        if not fds:
            for i in SEMPRE+UTIL+([INDEX] if x>=dt.date(2026,11,18) else []): o.append(f'- [ ] {i}')
    a=sorted(auto.get(x,[]),key=lambda r:(int(r[0].split('h')[0]),r[0]))
    if a:
        o.append('**🤖 Sai sozinho**')
        for m in ['The Mind Behind','Palavras','Luiz']:
            it=[f'{h} {txt}' for h,mm,txt in a if mm==m]
            if it: o.append(f'- *{m}:* '+' · '.join(it))
    o.append('')
    x+=dt.timedelta(1)
os.makedirs('cronograma',exist_ok=True)
open('cronograma/AGENDA-DIARIA.md','w',encoding='utf-8').write('\n'.join(o))
print('ok', (fim-ini).days+1, 'dias')
