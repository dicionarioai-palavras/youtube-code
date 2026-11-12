# EP03 · cortes S1–S4 (07/11/2026): abertura nova + trechos do áudio do longo (emendas em fim de frase) + CTA novo, em EN e PT-BR.
# Gera, por corte: <saida>/<id>-en.wav e <id>-pt.wav (mesma duração, -14 LUFS), e montagem/ep03-cortes.json (Remotion, ShortOriginal).
# Uso: python cortes_ep03.py <episodio> <pasta-de-som> <saida>
import json, re, sys, subprocess as sp
from pathlib import Path
EP=Path(sys.argv[1]); SOM=Path(sys.argv[2]); OUT=Path(sys.argv[3]); OUT.mkdir(parents=True,exist_ok=True)
TR=json.load(open(EP/'montagem'/'transcricao-palavras.json',encoding='utf-8'))
TC=json.load(open(EP/'montagem'/'transc-cortes.json',encoding='utf-8'))
CEN=json.load(open(EP/'imagens'/'cortes'/'cenas.json',encoding='utf-8'))
tmp=Path('/tmp/cortes3'); tmp.mkdir(exist_ok=True)
def run(c): sp.run(c,shell=True,check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def nrm(w): return re.sub(r"[^\w%']","",w.lower())
def toks(ws):
    out=[]
    for w,s,e in ws:
        for p in re.split(r'[\s\-–—]+',w):
            if nrm(p): out.append((nrm(p),s,e,p))
    return out
def seq(T,frase,depois=-1):
    q=[nrm(x) for x in re.split(r'[\s\-]+',frase) if nrm(x)]
    for i in range(len(T)-len(q)+1):
        if T[i][1]>depois and [t[0] for t in T[i:i+len(q)]]==q: return i,i+len(q)-1
    raise SystemExit(f'não achei: "{frase}"')
def trecho(ws,a,z):  # (início, fim, palavras) entre a frase a (início) e a frase z (fim)
    T=toks(ws); i,_=seq(T,a); _,j=seq(T,z,T[i][1]-0.01)
    return max(0,T[i][1]-0.02), T[j][2]+0.25, [(t[3],t[1],t[2]) for t in T[i:j+1]]
FIX={'B':'BTK','Lt':'Lieutenant','Greg':'Gregg','disc':'disk','Maureen':'Marine'}
# Definição: segmentos EN (bloco, frase início, frase fim) e PT (arquivo, início, fim); pausa extra depois do segmento (s)
C={
'S1':dict(nome='S1-thirty-years-one-question',gancho='30 YEARS FREE. ONE\u00a0QUESTION.',destaque='',trilha=('Rapid Unscheduled Disassembly - The Grey Room _ Density & Time.mp3',30),
  en=[('05-parte-4a','Can I send you','will be okay',0),('05-parte-4a','The police placed the ad','placed the ad',0),('05-parte-4a','On February','pieces of information',0),('05-parte-4a','The name of a church','Dennis',0)],
  pt=[('pt-br/05-parte-4a.mp3','Posso mandar','tudo bem',0),('pt-br/05-parte-4a.mp3','A polícia publicou','o anúncio',0),('pt-br/05-parte-4a.mp3','Em 16 de fevereiro','duas informações',0),('pt-br/05-parte-4a.mp3','O nome de uma igreja','Dennis',0)],
  cart=[('Can I send',[['THE POSTCARD'],['JANUARY 2005']]),('The police placed',[['THEY SAID YES.']]),('The name of',[['DENNIS','vermelho']])],
  sfx=[('On February',0.2,'disquete-entrando-s1395.mp3',-4,2.2),('The name of',1.0,'830184__silverillusionist__dramatic-sting-sudden-realization.wav',-4,6.5)],
  troca={}),
'S2':dict(nome='S2-who-installed-the-alarms',gancho='WHO INSTALLED THE ALARMS?',destaque='',trilha=('Through The Gates Of Hell - Blue Deer Studio.mp3',0),
  en=[('02-parte-1','after those first murders','people\'s homes',0),('05-parte-4a','For 14 of the years','do the wiring',0)],
  pt=[('pt-br/02-parte-1.mp3','E as empresas','alarme em casa',0),('pt-br/05-parte-4a.mp3','Por 14 dos','a fiação',0)],
  cart=[('For 14',[['ALARM INSTALLER'],['1974–1988']]),('But the people',[['THEY LET HIM IN.']])],
  sfx=[('For 14',0.3,'bips-teclado-s0758.mp3',-6,1.5),('But the people',0,'639307__silverillusionist__cinematic-hit-2.wav',-8,5.25)],
  troca={'In nineteen seventy':'In 1974','For fourteen':'For 14'}),
'S3':dict(nome='S3-lost-in-the-classifieds',gancho='LOST IN THE CLASSIFIEDS',destaque='',trilha=('Stats - The Grey Room _ Density & Time.mp3',40),
  en=[('03-parte-2','In 1978','about this case',3.2),('03-parte-2','He wasn\'t asking','an insult',0)],
  pt=[('pt-br/03-parte-2.mp3','Em 1978','neste caso',3.2),('pt-br/03-parte-2.mp3','Ele não pedia','um insulto',0)],
  cart=[('In 1978',[['1978: THE POEM'],['NEVER PRINTED']]),('He wasn\'t asking',[['NOTICED.','vermelho']])],
  sfx=[('He wasn\'t asking',-3.0,'530331__silverillusionist__menacing-brass.aiff',-5,3.0)],
  citacao=('He wasn\'t asking',-3.1,[['"HOW MANY DO I'],['HAVE TO KILL..."'],['BTK, 1978','ambar']]),
  troca={'In nineteen seventy':'In 1978'}),
'S4':dict(nome='S4-the-17-percent',gancho="YOU'D PAY TO TALK ABOUT YOU",destaque='',trilha=('Tiburtina - Schwartzy.mp3',0),
  en=[('06-parte-5','In 2012','so much',0),('06-parte-5','They put volunteers','brain scanner',0),('06-parte-5','talking about themselves lit','other pleasures',0),
      ('06-parte-5','Then they ran','chose themselves',0),('06-parte-5','On average','who they are',0),('06-parte-5','Thinking about yourself','felt better',0)],
  pt=[('pt-br/06-parte-5.mp3','Em 2012','nós mesmos',0),('pt-br/06-parte-5.mp3','Num aparelho','do dinheiro',0),('pt-br/06-parte-5.mp3','Depois um teste','de novo e de novo',0),
      ('pt-br/06-parte-5.mp3','Em média','de quem são',0),('pt-br/06-parte-5.mp3','Pensarem si','era melhor',0)],
  cart=[('In 2012',[['HARVARD, 2012']]),('On average',[['17% LESS MONEY'],['TO TALK ABOUT YOU']])],
  sfx=[('Then they ran',3.0,'moedas-s0193.mp3',-12,4)],
  troca={'s4-05':'rq-c08-pedestal'}),
}
CTA_TELA=['FULL CASE.','TAP THE RELATED VIDEO']
FALAS_EN=dict(l.split('|',1) for l in '''S1-abertura|Uncaught for 30 years, you'd never trust the police. He did.
S1-cta|He trusted the police once. Who Dennis was is the full case, on the channel.
S2-abertura|In 1974, Wichita bought alarms. You won't believe who installed them.
S2-cta|The full case is on the channel: how the man who installed the alarms got caught.
S3-abertura|"How many do I have to kill?" A filing mistake.
S3-cta|Twenty-seven years later, the classified ads caught him. How many before that? Full case on the channel.
S4-abertura|Why you'd lose 17% just to talk about yourself.
S4-cta|One man in Wichita let that need run his life. Full case on the channel. Would you give up the 17%?'''.split('\n'))
def legenda(texto,ws,t0):  # palavras do texto aprovado com os tempos da transcrição (proporcional se a contagem não bate)
    tx=texto.split(); 
    if not ws: return []
    if len(tx)==len(ws): return [{'w':w,'s':round(t0+a[1],2),'e':round(t0+a[2],2)} for w,a in zip(tx,ws)]
    s0,s1=ws[0][1],ws[-1][2]; n=len(tx); L=[len(w)+2 for w in tx]; tot=sum(L); out=[]; c=s0
    for w,l in zip(tx,L): d=(s1-s0)*l/tot; out.append({'w':w,'s':round(t0+c,2),'e':round(t0+c+d,2)}); c+=d
    return out
def prep(src,ss,to,dst):
    run(f'ffmpeg -y -v error -ss {ss:.3f} -to {to:.3f} -i "{src}" -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.03,afade=t=out:st={max(0,to-ss-0.06):.3f}:d=0.06" -ar 48000 -ac 1 "{dst}"')
def soma(lista,D,saida,canais=1):
    ins=''.join(f' -i "{f}"' for f,_ in lista)
    fc=''.join(f'[{i}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{i}];' for i,(f,s) in enumerate(lista))
    fc+=''.join(f'[p{i}]' for i in range(len(lista)))+f'amix=inputs={len(lista)}:normalize=0,atrim=0:{D}[o]'
    run(f'ffmpeg -y -v error{ins} -filter_complex "{fc}" -map "[o]" -ar 48000 -ac {canais} "{saida}"')
def master(voz,cama,fx,saida,D):
    run(f'ffmpeg -y -v error -i "{cama}" -i "{fx}" -i "{voz}" -filter_complex "[2:a]aformat=channel_layouts=stereo,asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];[m][1:a][v]amix=inputs=3:normalize=0,atrim=0:{D}[o]" -map "[o]" -ar 48000 -ac 2 {tmp}/pre.wav')
    m=sp.run(f'ffmpeg -hide_banner -i {tmp}/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(re.findall(r'\{[^{}]*\}',m)[-1])
    af=(f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(f'ffmpeg -y -v error -i {tmp}/pre.wav -af "{af},afade=t=out:st={D-0.8:.2f}:d=0.8" -ar 48000 -ac 2 "{saida}"')
res=[]
for k,c in C.items():
    # ---- EN ----
    ab=EP/'audio'/'cortes-en'/f'{k}-abertura.mp3'; cta=EP/'audio'/'cortes-en'/f'{k}-cta.mp3'
    wa=TC[f'cortes-en/{k}-abertura.mp3']['words']; wc=TC[f'cortes-en/{k}-cta.mp3']['words']
    t=0.15; partes=[]; pal=[]
    f=tmp/f'{k}-ab.wav'; prep(ab,0,dur(ab),f); da=dur(f); partes.append((f,t)); pal+=legenda(FALAS_EN[f'{k}-abertura'],wa,t); t+=wa[-1][2]+0.45
    seg_ini=[]
    for n,(b,a,z,pausa) in enumerate(c['en']):
        s0,s1,ws=trecho(TR[b]['words'],a,z); f=tmp/f'{k}-en{n}.wav'; prep(EP/'audio'/f'{b}.mp3',s0,s1,f)
        partes.append((f,t)); seg_ini.append(t)
        pal+=[{'w':FIX.get(re.sub(r'\W','',w),w) if re.sub(r'\W','',w) in FIX else w,'s':round(t+ss-s0,2),'e':round(t+ee-s0,2)} for w,ss,ee in ws]
        t+=s1-s0+0.32+pausa
    t+=0.25; t_cta=t; f=tmp/f'{k}-cta.wav'; prep(cta,0,dur(cta),f); partes.append((f,t)); pal+=legenda(FALAS_EN[f'{k}-cta'],wc,t)
    fim_fala=t+wc[-1][2]
    # ---- PT: abertura em 0, cada trecho no início do trecho inglês correspondente, CTA no início do CTA inglês ----
    abp=EP/'audio'/'cortes-pt'/f'{k}-abertura.mp3'; ctap=EP/'audio'/'cortes-pt'/f'{k}-cta.mp3'
    pp=[]; f=tmp/f'{k}-abp.wav'; prep(abp,0,dur(abp),f); pp.append((f,0.15)); pos=0.15+dur(f)+0.25
    rel=[]
    for n,(arq3,a,z,pausa) in enumerate(c['pt']):
        s0,s1,_=trecho(TC[arq3]['words'],a,z); f=tmp/f'{k}-pt{n}.wav'; prep(EP/'audio'/arq3,s0,s1,f)
        ini=max(seg_ini[n] if n<len(seg_ini) else pos, pos); pp.append((f,ini)); pos=ini+(s1-s0)+0.3+pausa; rel.append(round(ini,2))
    ini=max(t_cta,pos); f=tmp/f'{k}-ctap.wav'; prep(ctap,0,dur(ctap),f); pp.append((f,ini)); fimpt=ini+dur(f)
    D=round(max(fim_fala,fimpt)+1.9,2)
    # junta B-T-K
    lim=[]; 
    for p in pal:
        if lim and p['w'] in ('T','K','T-K') and lim[-1]['w'] in ('BTK','B'): lim[-1]['e']=p['e']; lim[-1]['w']='BTK'; continue
        lim.append(p)
    pal=lim
    soma(partes,D,tmp/f'{k}-voz-en.wav')
    # cama: trilha única do corte em -30 LUFS, sobe nos 1,5 s finais
    arq,desde=c['trilha']
    run(f'ffmpeg -y -v error -ss {desde} -i "{SOM/"musica"/arq}" -t {D} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-29:TP=-6:LRA=11,afade=t=in:d=0.6,volume=\'1+1.0*gte(t,{fim_fala+0.2:.2f})\':eval=frame" -ar 48000 {tmp}/{k}-cama.wav')
    def tw(fr):  # tempo de uma frase na legenda do corte
        q=[nrm(x) for x in fr.split() if nrm(x)]
        for i in range(len(pal)-len(q)+1):
            if [nrm(p['w']) for p in pal[i:i+len(q)]]==q: return pal[i]['s']
        raise SystemExit(f'{k}: frase da tela não achada: {fr}')
    fx=[]
    for n,(fr,off,arq2,db,mx) in enumerate(c['sfx']):
        f=tmp/f'{k}-fx{n}.wav'; L=min(mx,dur(SOM/'sfx'/arq2))
        run(f'ffmpeg -y -v error -i "{SOM/"sfx"/arq2}" -t {L:.2f} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I={-22+db}:TP=-3,afade=t=out:st={max(0,L-0.4):.2f}:d=0.4" -ar 48000 "{f}"')
        fx.append((f,max(0,tw(fr)+off)))
    if not fx: fx=[(tmp/f'{k}-cama.wav',D+1)]
    soma(fx,D,tmp/f'{k}-fx.wav',2)
    master(tmp/f'{k}-voz-en.wav',tmp/f'{k}-cama.wav',tmp/f'{k}-fx.wav',OUT/f'{k}-en.wav',D)
    soma(pp,D,tmp/f'{k}-voz-pt.wav')
    master(tmp/f'{k}-voz-pt.wav',tmp/f'{k}-cama.wav',tmp/f'{k}-fx.wav',OUT/f'{k}-pt.wav',D)
    # ---- cenas e cartões ----
    lista=[]
    for cc in CEN[k]:
        cc=dict(cc); cc['src']=c['troca'].get(cc['src'],cc['src']); fr=c['troca'].get(cc['frase'],cc['frase'])
        cc['ini']=0 if not lista else max(0,tw(fr)-0.12); lista.append(cc)
    for n in range(len(lista)): lista[n]['fim']=lista[n+1]['ini'] if n<len(lista)-1 else D
    def partir(cc):
        if cc['fim']-cc['ini']>5.2:
            meio=(cc['ini']+cc['fim'])/2; cand=[p['e'] for p in pal if cc['ini']+1.8<p['e']<cc['fim']-1.8]
            if cand:
                corte=min(cand,key=lambda e:abs(e-meio)); a=dict(cc); b=dict(cc); a['fim']=round(corte+0.05,2); b['ini']=a['fim']
                b.update(mov='parado',escala=[max(cc['escala']),max(cc['escala'])],corte=True); return partir(a)+partir(b)
        return [cc]
    novo=[x for cc in lista for x in partir(cc)]
    for cc in novo: cc['escala']=[max(1.06,x) for x in cc['escala']]; cc.pop('frase',None)
    car=[]
    for fr,linhas in c['cart']:
        ini=tw(fr)-0.05; car.append({'ini':round(ini,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    if 'citacao' in c:
        fr,off,linhas=c['citacao']; ini=tw(fr)+off; car.append({'ini':round(ini,2),'fim':round(tw(fr)-0.1,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    car.sort(key=lambda x:x['ini'])
    for n,x in enumerate(car):
        nxt=car[n+1]['ini'] if n<len(car)-1 else t_cta
        x['fim']=round(min(x.get('fim',99),x['ini']+3.2,nxt),2)
    res.append({'id':k,'nome':c['nome'],'gancho':c['gancho'],'destaque':c['destaque'],'dur':D,'pasta':'ep03-cortes','cenas':novo,'cartoes':car,'palavras':pal,'cta':CTA_TELA})
    print(k,c['nome'],'dur',D,'| PT trechos em',rel,'fim PT',round(fimpt,1),'| cenas',[(x['src'][-5:],round(x['fim']-x['ini'],1)) for x in novo])
json.dump(res,open(EP/'montagem'/'ep03-cortes.json','w',encoding='utf-8'),indent=1,ensure_ascii=False)
