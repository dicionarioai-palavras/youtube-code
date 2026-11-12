# EP02 · cortes S1–S4 (07/11/2026): monta ep02-cortes.json (Remotion, componente ShortOriginal) a partir da transcrição
# com tempos do episódio (montagem/transcricao-palavras.json + blocos da timeline), do mapa de cenas (cenas.json, gerado
# por cenas_cortes.py) e dos cartões. Trechos escolhidos pela skill yt-shorts (ver PACOTE-YOUTUBE.md, seção dos Shorts).
# Uso: python cortes_ep02_montar.py <pasta-do-episodio>
#   lê imagens/cortes/cenas.json (de cenas_cortes.py) e imagens/cortes/troca.json (nome pedido → imagem usada; "" retira a cena);
#   grava montagem/ep02-cortes.json (copiar para code/remotion-redes-sociais/src/canal-dark/ep02-cortes.json).
import json, re, sys
from pathlib import Path
EP=Path(sys.argv[1]); CORT=EP/'imagens'/'cortes'
TL=json.load(open(EP/'montagem'/'timeline.json',encoding='utf-8')); TR=json.load(open(EP/'montagem'/'transcricao-palavras.json',encoding='utf-8'))
C=json.load(open(CORT/'cenas.json',encoding='utf-8'))
TROCA=json.load(open(CORT/'troca.json',encoding='utf-8')) if (CORT/'troca.json').exists() else {}
INI={b['id']:b['ini'] for b in TL['blocos']}
W=[(w,s+INI[k],e+INI[k]) for k in TR for w,s,e in TR[k]['words']]
# trecho: (primeira palavra, tempo aproximado), (última palavra, tempo aproximado); cauda = CTA depois da fala
SPAN={'S1':(('just',355.64),('speed.',408.14),1.8),'S2':(('As',614.40),('night.',671.06),1.5),
      'S3':(('In',692.16),('snow.',728.10),2.0),'S4':(('For',834.82),('night?',871.80),2.0)}
NOME={'S1':'S1-fear-decides-first','S2':'S2-one-cut-in-the-snow','S3':'S3-too-small-to-believe','S4':'S4-the-one-who-turned-back'}
GANCHO={'S1':("9 HIKERS. ONE WRONG CHOICE.",""),'S2':("ONE CUT IN THE SNOW?",""),'S3':("TOO SMALL TO BELIEVE?",""),'S4':("THE 10TH HIKER LIVED.","")}
# legenda: grafia do roteiro aprovado (a voz está certa; a transcrição erra nomes e hífens)
CORR={'S1':[(['just'],['Just']),(['J','.A.'],['J.','A.']),(['J'],['J.']),(['.A.'],['A.'])],
      'S2':[(['Kunsevich,'],['Kuntsevich,']),(["prosecutor's"],["prosecutors'"]),(['re','-investigation'],['reinvestigation']),(['peer','-reviewed'],['peer-reviewed']),
            (['it.'],['it:']),(['The','truth,'],['"The','truth,']),(['night.'],['night."'])],
      'S3':[(['Lehman'],['Leman']),(['Sinarella,'],['Cinnirella,']),(['major','event,'],['"major','event,']),(['cause','heuristic.'],['cause"','heuristic.'])],
      'S4':[(['said,','If'],['said:','"If']),(['be,','What'],['be:','what']),(['night?'],['night?"'])]}
R='vermelho'
CART={'S1':[("In 1959,",[["EASTERBROOK, 1959"]]),("What narrows",[["THREAT"],["NARROWS IT MOST"]]),("Get out.",[["GET OUT."]]),("That isn't",[["NOT STUPIDITY."],["SPEED."]])],
      'S2':[("As Puzrin",[["ALEXANDER PUZRIN"],["ETH ZURICH"]]),("Then, in 2021,",[["2021: SLOPE"],["OVER 30°"]]),("And in early",[["2022: 2 SLABS"],["FILMED"]]),("It is not proven.",[["NOT PROVEN."]])],
      'S3':[("In 2007,",[["LEMAN & CINNIRELLA"],["2007"]]),("The researchers",[["MAJOR EVENT,"],["MAJOR CAUSE"]])],
      'S4':[("Yuri Yudin,",[["YURI YUDIN"],["THE 10TH HIKER"]])]}
CTA=("FULL CASE.","TAP THE RELATED VIDEO")
def norm(x): return re.sub(r"[^a-z0-9']","",x.lower())
def idx(palavra,tempo):
    c=[i for i,(w,s,e) in enumerate(W) if norm(w)==norm(palavra) and (abs(s-tempo)<0.05 or abs(e-tempo)<0.05)]
    assert len(c)==1,(palavra,tempo,c); return c[0]
def achar(ws,frase,depois=0):
    q=[norm(x) for x in frase.split()]
    for i in range(len(ws)-len(q)+1):
        if ws[i]['s']<depois-0.01: continue
        if all(norm(ws[i+k]['w'])==q[k] for k in range(len(q))): return i
    raise SystemExit('nao achei: '+frase)
out=[]
for k,((pa,ta),(pz,tz),cauda) in SPAN.items():
    i=idx(pa,ta); j=idx(pz,tz)
    antes=W[i-1][2]; depois=W[j+1][1] if j+1<len(W) else W[j][2]+1
    t0=round(max(antes+0.1,W[i][1]-0.2),2); t1=round(min(depois-0.15,W[j][2]+0.35),2)
    ws=[{'w':w,'s':round(s-t0,2),'e':round(e-t0,2)} for w,s,e in W[i:j+1]]
    for a,b in CORR.get(k,[]):
        for n in range(len(ws)-len(a)+1):
            if [x['w'] for x in ws[n:n+len(a)]]==a:
                if len(a)==len(b): ws[n:n+len(a)]=[{'w':b[m],'s':ws[n+m]['s'],'e':ws[n+m]['e']} for m in range(len(b))]
                else: ws[n:n+len(a)]=[{'w':x,'s':ws[n]['s'],'e':ws[n+len(a)-1]['e']} for x in b]
                break
    dur=round(t1-t0+cauda,2); fim=ws[-1]['e']
    lista=[dict(c) for c in C[k]]
    for c in lista: c['src']=TROCA.get(c['src'],c['src'])
    lista=[c for c in lista if c['src']]  # troca vazia = cena retirada
    cen=[]; t=0
    for n,c in enumerate(lista):
        ini=0 if n==0 else max(0,ws[achar(ws,c['frase'],t)]['s']-0.12)
        c['ini']=round(ini,2); t=ini; cen.append(c)
    for n in range(len(cen)): cen[n]['fim']=cen[n+1]['ini'] if n<len(cen)-1 else dur
    def partir(c,ultimo):  # cena longa: corte seco para um 2º enquadramento (ritmo 2–4 s)
        lim=5.8 if ultimo else 4.6
        if c['fim']-c['ini']<=lim: return [c]
        meio=(c['ini']+c['fim']-(cauda if ultimo else 0))/2
        cand=[x['e'] for x in ws if c['ini']+1.8<x['e']<c['fim']-1.8-(cauda if ultimo else 0)]
        if not cand: return [c]
        pont=[x['e'] for x in ws if x['e'] in cand and re.search(r'[.,?!:]"?$',x['w'])]
        corte=min(pont or cand,key=lambda e:abs(e-meio))
        a=dict(c); b=dict(c); a['fim']=round(corte+0.05,2); b['ini']=a['fim']
        if c['mov']=='descobre': b.update(mov='parado',escala=[max(c['escala']),max(c['escala'])])
        elif c['mov']=='revela': b.update(mov='parado',escala=[min(c['escala'])+0.04,min(c['escala'])+0.04],foco={'x':0.5,'y':0.5})
        else: b.update(mov='parado',escala=[1.3,1.3])
        b['corte']=True; b['reprise']=True
        return partir(a,False)+partir(b,ultimo)
    novo=[]
    for n,c in enumerate(cen): novo+=partir(c,n==len(cen)-1)
    cen=novo
    for c in cen:
        c['escala']=[max(1.06,x) for x in c['escala']]
        if c['src'].startswith('rq-'): c['escala']=[min(1.16,x) for x in c['escala']]  # 16:9 do EP02 reenquadrada (já ampliada 1,76×): zoom curto
    car=[]; t=0
    for frase,linhas in CART[k]:
        n=achar(ws,frase,t); ini=ws[n]['s']-0.05; t=ini
        car.append({'ini':round(ini,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    for n,c in enumerate(car):
        nxt=car[n+1]['ini'] if n<len(car)-1 else fim+0.3
        c['fim']=round(min(c['ini']+3.2,nxt),2)
    g,dest=GANCHO[k]
    out.append({'id':k,'nome':NOME[k],'gancho':g,'destaque':dest,'dur':dur,'t0':t0,'t1':t1,'pasta':'ep02-cortes','cenas':cen,'cartoes':car,'palavras':ws,'cta':list(CTA)})
    print(k,NOME[k],'trecho',t0,'-',t1,'fala',round(fim-ws[0]['s'],2),'dur',dur,'| cenas',[(c['src'][-2:]+('*' if c.get('reprise') else ''),round(c['fim']-c['ini'],1)) for c in cen])
json.dump(out,open(EP/'montagem'/'ep02-cortes.json','w',encoding='utf-8'),indent=1,ensure_ascii=False)
