import json, re
W=json.load(open('/tmp/ep/words.json'))
I=lambda n:{'tipo':'img','src':n}
plano={
'01-abertura':[(None,I('c01b-cama')),("You lie there",I('c02-janela')),("Now imagine",I('a1-fachada')),("That's the story the world",{'tipo':'ficha'}),("It's in textbooks",I('c03-livro')),("It launched a whole",I('c04-academia')),("There's just one problem",I('c05-janelas-apagadas'))],
'02-parte-1':[(None,I('a2b-bar')),("She shared",I('c07b-cozinha')),("On the night",I('c08-carro')),("She was attacked",I('c09-rua-longe')),("And six days later",I('c10b-viatura')),("He was convicted",I('c11-delegacia')),("where he died",I('c12-prisao')),("For two weeks",I('c13-caminhao'))],
'03-parte-2':[(None,I('c14b-rotativa')),("Thirty seven who saw",{'tipo':'citacao','texto':"37 Who Saw Murder Didn't Call the Police",'autor':'The New York Times, March 27, 1964'}),("The article said",I('c15b-primeira-pagina')),("Where did that number",I('c16-almoco')),("Rosenthal assigned",I('c17-livro-vermelho')),("And the world reacted",I('c18-sermao')),("Editorials about",I('c19-metro')),("The thirty eight witnesses became",I('c20-espelho'))],
'04-parte-3':[(None,I('c21-pesquisadores')),("So in",I('c22-sala-microfone')),("A few minutes later",I('c23-interfone')),("There was no other student",I('a4b-cabines')),("When people believed",{'tipo':'numero1'}),("Same emergency",I('c24-levanta')),("In another study",I('c25-fumaca')),("Psychologists call that",I('c26-multidao-olhares')),("Put those two ideas",I('c27-livros-pilha'))],
'05-parte-4':[(None,{'tipo':'linha'}),("What they found",I('c28-arquivo')),("First there was",I('c29-tribunal')),("Second what people",I('c30-vista-alta')),("Third and this",I('c31c-grito')),("Sophia",I('a3b-escada')),("That detail was not",{'tipo':'citacao','texto':'Help is on the way.','autor':'Sophia Farrar, as recalled in The Witness (2015)'}),("Decades later",I('c32-irmao')),("And in 2016",I('c33-redacao'))],
'06-parte-5':[(None,I('c26-multidao-olhares')),("The experiments are real",I('c21-pesquisadores')),("argued that this one",I('c27-livros-pilha')),("In 2020",I('c34b-cctv')),("In nine out of",{'tipo':'numero2'}),("Read that again",I('c35-ajuda-rua')),("So what actually stops",I('c30-vista-alta')),("Which means the fix",I('c36-apontar')),("And if you're the one",I('c37-telefone'))],
'07-fecho':[(None,I('c38-fim-porta')),("So let me ask you",I('a1-fachada'))],
}
cap={'02-parte-1':('I','WHO SHE WAS'),'03-parte-2':('II','THE NUMBER'),'04-parte-3':('III','THE EXPERIMENT'),'05-parte-4':('IV','WHAT ACTUALLY HAPPENED'),'06-parte-5':('V','SO ARE WE COWARDS?')}
def nrm(w): return re.sub(r"[^a-z0-9']","",w.lower().replace('-',' ')).replace('neighbour','neighbor')
def tokens(ws):
    toks=[]
    for w,s,e in ws:
        for p in re.split(r"[\s-]+",w):
            n=nrm(p)
            if n: toks.append((n,s,e))
    return toks
NUMW={'37':['thirty','seven'],'38':['thirty','eight'],'1968':['1968'],'2020':['2020'],'2016':['2016']}
def find(toks,phrase,after):
    q=[nrm(x) for x in phrase.split()]
    seq=[t[0] for t in toks]
    # expand digit tokens
    for i in range(len(toks)):
        if toks[i][1]<after: continue
        j=i;k=0;ok=True
        while k<len(q):
            if j>=len(toks): ok=False;break
            t=toks[j][0]
            if t==q[k]: j+=1;k+=1;continue
            if t in NUMW and q[k:k+len(NUMW[t])]==NUMW[t]: j+=1;k+=len(NUMW[t]);continue
            ok=False;break
        if ok: return toks[i][1]
    raise SystemExit(f'âncora não achada: {phrase}')
FPS=30; t=0.0; cenas=[]; blocos=[]
INTRO=3.0; CAP=2.5; RESP=0.6
ordem=list(plano)
for bi,b in enumerate(ordem):
    if b in cap:
        cenas.append({'tipo':'capitulo','numero':cap[b][0],'titulo':cap[b][1],'ini':t,'fim':t+CAP}); t+=CAP
    dur=W[b]['dur']; toks=tokens(W[b]['words'])
    blocos.append({'id':b,'ini':round(t,3),'dur':dur})
    starts=[]; last=0
    for anc,c in plano[b]:
        s=0.0 if anc is None else max(0,find(toks,anc,last)-0.15)
        starts.append((s,c)); last=s+0.01
    for k,(s,c) in enumerate(starts):
        e=starts[k+1][0] if k+1<len(starts) else dur
        cenas.append({**c,'ini':round(t+s,3),'fim':round(t+e,3)})
    t+=dur
    if b=='01-abertura':
        cenas.append({'tipo':'abertura','ini':t,'fim':t+INTRO}); t+=INTRO
    elif b!='07-fecho':
        # respiro: estende a última cena
        cenas[-1]['fim']=round(t+RESP,3); t+=RESP
FIM=20.0
cenas.append({'tipo':'final','ini':t,'fim':t+FIM}); t+=FIM
json.dump({'fps':FPS,'duracao':round(t,3),'blocos':blocos,'cenas':cenas},open('/tmp/mont/timeline.json','w'),indent=1)
print('duração total',round(t,1),'s', len(cenas),'cenas')
for c in cenas: 
    d=c['fim']-c['ini']
    if d<2.5 or d>22: print('atenção',c.get('src',c['tipo']),round(d,1))
