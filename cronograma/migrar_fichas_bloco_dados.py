"""Acrescenta o bloco de dados (YAML, regras 'pronto para plugar' da R1) no topo de cada ficha.md de um tema.
Uso: python migrar_fichas_bloco_dados.py <pasta-pecas> <tema>   (roda da raiz do projeto)"""
import os, sys, re, csv, json, subprocess, datetime as dt
pasta, tema = sys.argv[1], sys.argv[2]
CSV = 'cronograma/CRONOGRAMA-GERAL-POSTAGENS.csv'
rows = list(csv.reader(open(CSV, encoding='utf-8-sig'), delimiter=';'))
head, rows = rows[0], rows[1:]
def datas(pid):
    out = {}
    for r in rows:
        for i, c in enumerate(r[2:-1], start=2):
            if re.search(r'(?<![\w-])' + re.escape(pid) + r'(?![\w-])', c):
                out.setdefault(head[i], []).append(dt.datetime.strptime(r[0], '%d/%m/%Y').date().isoformat())
    return out
def dur(f):
    try:
        return round(float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).strip()),1)
    except Exception: return None
def redes(nome):
    n = nome.lower()
    if 'shorts-instagram-e-tiktok' in n: return ['youtube-shorts','instagram-reels','tiktok']
    if 'shorts' in n: return ['youtube-shorts']
    if 'instagram' in n and 'tiktok' in n: return ['instagram-reels','tiktok']
    return []
def marca_de(nome, padrao):
    if nome.startswith('luiz') or '-luiz-' in nome: return 'luiz'
    if nome.startswith('palavras') or '-palavras-' in nome: return 'palavras'
    return padrao
def col_marca(col): return 'luiz' if col.startswith('Luiz') else 'palavras'
def y(v): return json.dumps(v, ensure_ascii=False)
for pid in sorted(os.listdir(pasta)):
    d = os.path.join(pasta, pid); f = os.path.join(d, 'ficha.md')
    if not os.path.isfile(f): continue
    txt = open(f, encoding='utf-8').read()
    if txt.startswith('---\nid:'): print('já tem bloco:', pid); continue
    arqs = sorted(os.listdir(d))
    if 'descartada' in txt[:600].lower():
        bloco = f'---\nid: {pid}\norigem: video-longo:{tema}\nstatus: descartada\n---\n\n'
        open(f,'w',encoding='utf-8').write(bloco+txt); print('descartada:', pid); continue
    padrao = 'palavras' if pid.startswith('palavras') else 'luiz'
    quando = datas(pid)
    tipo = 'corte' if ('invidere' in pid or 'olho-volta' in pid) else 'bastidor'
    destinos = []; formato = None
    for a in arqs:
        if not a.endswith('.mp4') or a.startswith('_mix') or a.startswith('para-adobe'): continue
        m = marca_de(a, padrao)
        du = dur(os.path.join(d, a))
        formato = formato or {'proporcao':'9:16','duracao_s':du,'imagens':0}
        for r in redes(a):
            datas_m = sorted(set(sum([v for k, v in quando.items() if col_marca(k) == m], [])))
            destinos.append({'marca':m,'rede':r,'arquivo':a,'capa':'','data_prevista':datas_m[0] if datas_m else '','status':'pronto','link':''})
    if pid == 'palavras-posts-texto':
        tipo = 'posts'
        grupos = [('carrossel','instagram-feed','inveja-instagram-carrossel-'),('post','instagram-feed','inveja-instagram-post-'),
                  ('stories','instagram-stories','inveja-instagram-story-'),('destaque-capa','instagram-stories','inveja-instagram-destaque-'),
                  ('carrossel','tiktok','inveja-tiktok-carrossel-'),('comunidade','youtube-comunidade','inveja-youtube-comunidade-')]
        for t, r, pre in grupos:
            fs = [a for a in arqs if a.startswith(pre)]
            if fs: destinos.append({'marca':'palavras','tipo':t,'rede':r,'arquivos':fs,'capa':'','data_prevista':'','status':'pronto','link':''})
        formato = {'proporcao':'4:5 / 9:16 / 1:1 (por arquivo)','duracao_s':0,'imagens':len([a for a in arqs if a.endswith('.png')])}
    marcas = sorted({x['marca'] for x in destinos}) or [padrao]
    L = ['---', f'id: {pid}', f'marca: {y(marcas[0] if len(marcas)==1 else marcas)}', f'tipo: {tipo}', f'origem: video-longo:{tema}',
         f'formato: {y(formato)}', f'datas_no_cronograma: {y(quando)}', 'legenda: "ver as seções de legenda abaixo nesta ficha"', 'destinos:']
    for x in destinos:
        L.append('  - ' + ', '.join(f'{k}: {y(v)}' for k, v in x.items()).join(['{','}']) if False else '  - ' + y(x))
    if pid == 'olho-volta-luiz':
        L.append('pendencia: "Luiz escolhe entre a versão original e a filtro-luiz-v2 antes de postar (ver fim da ficha)"')
    L += ['---', '', '']
    open(f, 'w', encoding='utf-8').write('\n'.join(L) + txt); print('ok:', pid, len(destinos), 'destinos')
