# Shorts originais: monta <lote>-shorts.json (Remotion) a partir de transcricao.json (palavras com tempo), cenas.json (gerado por imagens/cenas.py) e dos cartões da coluna Tela. Rodar dentro da pasta de trabalho 'plano/'. Lote 0, 06/11/2026.
# Monta lote00-shorts.json (Remotion) a partir da transcrição (palavras com tempo), do mapa de cenas e dos cartões da coluna "Tela".
import json, re, sys
T=json.load(open('../transcricao.json')); C=json.load(open('cenas.json'))
ANCORA={'O1':'o1-01','O2':'o2-01b','O3':'o3-01c','O4':'o4-01b','O5':'o5-01e','O6':'o6-01c'}
TROCA=json.load(open('troca.json')) if len(sys.argv)>1 else {}
# correções da legenda: o texto aprovado manda (a voz está certa; a transcrição erra a grafia)
CORR={'O1':[(["You'd","think"],["You","think"]),(["Di","Paolo,"],["DePaulo,"]),(["de","Paolo,"],["DePaulo,"])],
      'O4':[(["advisor,"],["adviser,"]),(["Beyerot."],["Bejerot."]),(["used"],["use"]),(["Syndrome."],["syndrome."]),(["August"],["August."])],
      'O6':[(["Bib"],["Bibb"]),(["LaTain"],["Latané"]),(["Latain"],["Latané"]),(["gray"],["grey"])]}
GANCHO={'O1':("YOU'D KNOW?",""),'O2':("BROKEN GLASS?",""),'O3':("YOU'D STOP?",""),'O4':("NEVER SPOKE TO HER","NEVER"),
        'O5':("NO BOOTS. 9 HIKERS.",""),'O6':("40 PEOPLE. THAT'S THE PROBLEM.","")}
R='vermelho'
CART={
'O1':[("pulled together",[["206 STUDIES"]]),("On average",[["54%",R],["COIN: 50%"]]),("They caught only",[["LIES CAUGHT: 47%"]]),
      ("And the professionals",[["EXPERTS:"],["NO BETTER"]]),("So who's",[["BEST LIAR"],["YOU KNOW?"]])],
'O2':[("Then they asked",[['"HIT"']]),("Smashed.",[['"HIT" →'],['"SMASHED"',R]]),("There was no",[["NO GLASS"],["IN THE FILM"]]),
      ("sixteen out of",[["SMASHED: 16/50"]]),("With hit,",[["SMASHED: 16/50"],["HIT: 7/50"]]),("Same film.",[["ONE WORD."]])],
'O3':[("all the way",[["450 VOLTS"]]),("The man is an actor.",[["ACTOR."],["FAKE SHOCKS."]]),("And a calm voice",[['"PLEASE'],['CONTINUE."']]),
      ("guessed about",[["GUESS: 1%"]]),("Sixty-five percent did.",[["GUESS: 1%"],["REAL: 65%",R]]),("Be honest.",[["WOULD YOU"],["STOP?"]])],
'O4':[("Stockholm, August.",[["STOCKHOLM, 1973"]]),("A bank robbery",[["6 DAYS."],["4 HOSTAGES."]]),("gets the prime",[["CALL TO THE"],["PRIME MINISTER"]]),
      ("And to this day",[["NOT IN THE DSM"]])],
'O5':[("February nineteen",[["URALS, 1959"]]),("Boots, coats",[["BOOTS LEFT INSIDE"]]),("The cuts had",[["CUT FROM"],["THE INSIDE"]]),("What makes",[["WHY LEAVE?"]])],
'O6':[("the more witnesses",[["MORE WITNESSES"],["= SLOWER"]]),("Pick one face.",[["POINT AT ONE"]]),("Call an ambulance.",[['"YOU. CALL AN'],['AMBULANCE."']]),
      ("in two hundred",[["219 FIGHTS:"],["9 IN 10 HELPED"]]),("This all started",[["THE 38 WITNESSES →"]])],
}
CTA={'O1':("TELL ME.","IN THE COMMENTS"),'O2':("FOLLOW.","THE MIND BEHIND"),'O3':("TELL ME.","IN THE COMMENTS"),
     'O4':("FULL CASE SOON.","THE MIND BEHIND"),'O5':("FULL CASE.","ON THE CHANNEL"),'O6':("FULL CASE.","ON THE CHANNEL")}
from num2words import num2words
def toks(t):
    t=t.replace(',','') if re.fullmatch(r'[\d,]+[.%?!]*',t) else t
    t=re.sub(r'\b(1[0-9]{3}|20[0-9]{2})(s?)\b',lambda m: num2words(int(m.group(1)),to='year')+m.group(2),t)
    t=re.sub(r'(\d+)%',lambda m: num2words(int(m.group(1)))+' percent',t)
    t=re.sub(r'\d+',lambda m: num2words(int(m.group(0))),t)
    t=t.lower().replace('-',' ').replace('sixtys','sixties')
    return [x for x in (re.sub(r"[^a-z']","",y) for y in t.split()) if x and x!='and']
def achar(ws,frase,depois=0):
    flat=[(tk,i) for i,w in enumerate(ws) for tk in toks(w['w'])]
    q=toks(frase)
    for p in range(len(flat)-len(q)+1):
        i=flat[p][1]
        if ws[i]['s']<depois-0.01: continue
        if all(flat[p+k][0]==q[k] for k in range(len(q))): return i
    raise SystemExit(f'nao achei: {frase}')
out=[]
for k in ['O1','O2','O3','O4','O5','O6']:
    ws=[{'w':w,'s':s,'e':e} for w,s,e,p in T[k]['words']]
    for a,b in CORR.get(k,[]):
        for i in range(len(ws)-len(a)+1):
            if [x['w'] for x in ws[i:i+len(a)]]==a:
                s,e=ws[i]['s'],ws[i+len(a)-1]['e']; novo=[{'w':w,'s':s,'e':e} for w in b]
                if len(b)==len(a): novo=[{'w':w,'s':ws[i+j]['s'],'e':ws[i+j]['e']} for j,w in enumerate(b)]
                ws[i:i+len(a)]=novo; break
    m=[]
    for x in ws:
        if m and re.match(r"^[%.,]",x['w']): m[-1]['w']+=x['w']; m[-1]['e']=x['e']
        else: m.append(x)
    ws=m
    ws[0]['w']=ws[0]['w'][:1].upper()+ws[0]['w'][1:]
    fim=ws[-1]['e']; dur=round(fim+2.2,2)
    cen=[]; t=0
    lista=[dict(c) for c in C[k]]
    lista[0]['src']=ANCORA[k]
    OVR={'o1-11c':dict(src='o1-01',mov='revela',foco={'x':0.5,'y':0.5},escala=[1.06,1.5]),
         'o4-02b':dict(mov='parado',foco={'x':0.5,'y':0.72},escala=[1.45,1.55]),
         'o4-03b':dict(mov='parado',foco={'x':0.5,'y':0.55},escala=[1.45,1.55]),
         'o1-04b':dict(mov='parado',foco={'x':0.5,'y':0.3125},escala=[1.58,1.62]),
         'o6-03b':dict(src='o6-03',mov='parado',foco={'x':0.5,'y':0.75},escala=[1.56,1.62]),
         'o2-06b':dict(foco={'x':0.66,'y':0.6}),
         'o2-07c':dict(src='o2-06b',mov='parado',foco={'x':0.64,'y':0.6},escala=[1.5,1.6]),
         'o4-09c':dict(src='o4-03b',mov='parado',foco={'x':0.42,'y':0.5},escala=[1.55,1.62]),
         'o4-11d':dict(src='o4-01b',mov='descobre',foco={'x':0.55,'y':0.42},escala=[1.06,1.4]),
         'o5-01e':dict(mov='desliza',foco={'x':0.42,'y':0.42},destino={'x':0.5,'y':0.44},escala=[1.45,1.45]),
         'o5-01c':dict(mov='desliza',foco={'x':0.5,'y':0.42},destino={'x':0.58,'y':0.46},escala=[1.45,1.45]),
         'o6-11':dict(mov='desliza',foco={'x':0.5,'y':0.55},destino={'x':0.45,'y':0.72},escala=[1.4,1.4])}
    for c in lista:
        c.update(OVR.get(c['src'],{}))
        c['src']=TROCA.get(c['src'],c['src'])
    for j,c in enumerate(lista):
        ini=0 if j==0 else max(0,ws[achar(ws,c['frase'],t)]['s']-0.12)
        c['ini']=round(ini,2); t=ini; cen.append(c)
    for j in range(len(cen)): cen[j]['fim']=cen[j+1]['ini'] if j<len(cen)-1 else dur
    # cenas longas: corte seco para um segundo enquadramento da mesma imagem (ritmo 2–4 s)
    def partir(c,ultimo):
        lim=5.6 if ultimo else 4.4
        if c['fim']-c['ini']<=lim: return [c]
        meio=(c['ini']+c['fim']-(2.2 if ultimo else 0))/2
        cand=[x['e'] for x in ws if c['ini']+1.8<x['e']<c['fim']-1.8-(1.0 if ultimo else 0)]
        if not cand: return [c]
        pont=[x['e'] for x in ws if x['e'] in cand and re.search(r'[.,?!:]$',x['w'])]
        corte=min(pont or cand,key=lambda e:abs(e-meio)+(0 if pont else 0))
        a=dict(c); b=dict(c); a['fim']=round(corte+0.05,2); b['ini']=a['fim']
        if c['mov']=='descobre': b.update(mov='parado',escala=[1.06,1.06])
        else: b.update(mov='parado',escala=[1.45,1.45])
        b['corte']=True; b['reprise']=True
        return partir(a,False)+partir(b,ultimo)
    novo=[]
    for j,c in enumerate(cen): novo+=partir(c,j==len(cen)-1)
    cen=novo
    car=[]; t=0
    for frase,linhas in CART[k]:
        i=achar(ws,frase,t); ini=ws[i]['s']-0.05; t=ini
        car.append({'ini':round(ini,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    for j,c in enumerate(car):
        nxt=car[j+1]['ini'] if j<len(car)-1 else fim+0.3
        c['fim']=round(min(c['ini']+3.4,nxt),2)
    g,dest=GANCHO[k]
    for c in cen: c['escala']=[max(1.06,x) for x in c['escala']]
    out.append({'id':k,'gancho':g,'destaque':dest,'dur':dur,'pasta':'lote00','cenas':cen,'cartoes':car,
                'palavras':[{'w':x['w'],'s':round(x['s'],2),'e':round(x['e'],2)} for x in ws],'cta':list(CTA[k])})
    print(k,'dur',dur,'| cenas',[(c['src'][-3:]+('*' if c.get('reprise') else ''),round(c['fim']-c['ini'],1)) for c in cen])
json.dump(out,open('lote00-shorts.json','w'),indent=1,ensure_ascii=False)
