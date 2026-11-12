import json, subprocess, sys, numpy as np, unicodedata, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter
F='/home/claude/s1329'; SRC='/mnt/user-data/uploads/Redes-sociais/palavras/youtube/peças/ciume/redes/_fontes-cortes'
BEB=lambda s: ImageFont.truetype(f'{F}/BebasNeue.ttf',s); INT=lambda s: ImageFont.truetype(f'{F}/Inter-500.ttf',s)
OSSO=(251,233,194); TERRA=(196,109,69); W,H,FPS=1080,1920,30
ICON=Image.open('/home/claude/emb/_icone-osso.png').convert('RGBA').resize((70,70))
WORDS=json.load(open('/home/claude/pac/palavras-alinhadas.json'))
# id: arquivo, início do arquivo (abs), in, out, manchete (l1,l2)
CUTS={
 'C0':('C0.mp4',0.0,0.0,28.85,('NÃO É CIÚME,','É CUIDADO?')),
 'C1':('C1.mp4',37.3,37.55,66.95,('ME PASSA TUA','LOCALIZAÇÃO?')),
 'C2':('C2.mp4',189.0,189.3,218.4,('ZELOSO','NO CURRÍCULO?')),
 'C3':('C3.mp4',337.0,337.15,358.95,('EM FRANCÊS, CIÚME','É PERSIANA')),
 'C4':('C4.mp4',379.4,379.55,400.95,('QUEM É','RAFA?')),
 'C6':('C6.mp4',660.4,660.6,687.35,('CHEGOU BEM?','CHEGOU COM QUEM?')),
}
def grupos(t0,t1):
    ws=[[w[0],w[1],w[2].replace('"','').replace('“','').replace('”','')] for w in WORDS if w[0]>=t0-0.05 and w[1]<=t1+0.3 and w[2].strip('" ')]
    gs=[];cur=[]
    for w in ws:
        txt=' '.join(x[2] for x in cur+[w])
        if cur and (len(txt)>24 or len(cur)>=4 or w[0]-cur[-1][1]>0.6): gs.append(cur);cur=[]
        cur.append(w)
        if (w[2][-1] in '.?!…' and len(cur)>=1) or (w[2][-1] in ',;:' and len(cur)>=2): gs.append(cur);cur=[]
    if cur: gs.append(cur)
    return gs
def txtshadow(base,draw_fn,blur=10,forca=.8):
    L=Image.new('RGBA',(W,H)); draw_fn(ImageDraw.Draw(L))
    sh=L.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v:int(v*forca))
    base.paste((0,0,0,255),(0,5),sh); base.alpha_composite(L)
def render(cid):
    fn,f0,tin,tout,(l1,l2)=CUTS[cid]; dur=tout-tin
    gs=grupos(tin,tout)
    rd=subprocess.Popen(['ffmpeg','-loglevel','error','-ss',str(tin-f0),'-i',f'{SRC}/{fn}','-t',str(dur),'-vf','scale=1080:608,fps=30','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    FS=1080*608*3
    out=f'{cid}-sem-audio.mp4'
    p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
    fh=BEB(136)
    n=-1
    while True:
        buf=rd.stdout.read(FS)
        if len(buf)<FS: break
        n+=1; t=tin+n/FPS; a=Image.frombuffer('RGB',(1080,608),buf)
        bg=a.resize((480,270)).crop((480/2-76,0,480/2+76,270)).resize((W,H),Image.BICUBIC).filter(ImageFilter.GaussianBlur(18))
        bg=Image.fromarray((np.asarray(bg,np.float32)*0.42).astype('uint8')).convert('RGBA')
        bg.paste(a,(0,600))
        def head(d):
            k=min(1,(t-tin)/0.25)
            d.text((W/2,320),l1,font=fh,fill=OSSO+(int(255*k),),anchor='ms')
            d.text((W/2,456),l2,font=fh,fill=TERRA+(int(255*k),),anchor='ms')
        txtshadow(bg,head,14,.85)
        g=[x for x in gs if x[0][0]-0.05<=t<=x[-1][1]+0.25]
        if g:
            g=g[-1]; fc=INT(62)
            def cap(d):
                parts=[w[2] for w in g]; sp=d.textlength(' ',font=fc)
                tot=sum(d.textlength(p,font=fc) for p in parts)+sp*(len(parts)-1); x=W/2-tot/2
                for w in g:
                    cor=TERRA if w[0]<=t<=w[1]+0.05 else OSSO
                    d.text((x,1330),w[2],font=fc,fill=cor+(255,),anchor='ls'); x+=d.textlength(w[2],font=fc)+sp
            txtshadow(bg,cap,8,.9)
        def cta(d):
            d.text((W/2+30,1505),'VÍDEO COMPLETO NO CANAL',font=BEB(64),fill=OSSO+(255,),anchor='ms')
        txtshadow(bg,cta,8,.9)
        bg.alpha_composite(ICON,(int(W/2-BEB(64).getlength('VÍDEO COMPLETO NO CANAL')/2-60),1452))
        p.stdin.write(np.asarray(bg.convert('RGB')).tobytes())
    p.stdin.close(); p.wait()
    final=f'Ciume-Short-{cid}.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',out,'-ss',str(tin-f0),'-t',str(dur),'-i',f'{SRC}/{fn}','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-af','afade=t=out:st=%.2f:d=0.35'%(dur-0.35),'-shortest',final],check=True)
    print(cid,round(dur,2))
for c in sys.argv[1:]: render(c)
