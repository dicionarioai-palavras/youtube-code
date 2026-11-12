import json, sys
sys.argv=['x']; exec(open('/tmp/pt/mix_pt.py').read().split('# ---- longo ----')[0])
S=json.load(open('/tmp/mont/shorts.json'))
nomes={'s1-38-witnesses':'S1-38-witnesses','s2-where-did-38-come-from':'S2-where-did-38-come-from','s3-would-you-help':'S3-would-you-help','s4-she-didnt-die-alone':'S4-she-didnt-die-alone'}
for s in S:
    out=f"/tmp/pt/out/{nomes[s['id']]}-audio-pt-br.wav"; d=s['dur']
    if s['id'].startswith('s1'):
        run(f'ffmpeg -y -v error -i /tmp/pt/out/EP01-audio-pt-br.wav -t {d} -af "afade=t=in:d=0.15,afade=t=out:st={d-1.5:.2f}:d=1.5" -ar 48000 -ac 2 "{out}"')
    else:
        k=s['id'][:2]; p=f'/tmp/pt/{k}.prep.wav'; prep(A+f'shorts/{k}.mp3',p)
        ini=s['palavras'][0]['s']; alvo=s['palavras'][-1]['e']-ini+0.3
        r=max(1.0,dur(p)/alvo)
        if r>CAP: raise SystemExit(f'{k}: precisaria acelerar {r:.2f}x (máx. {CAP}). Enxugar o texto PT deste Short.')
        f=f'/tmp/pt/{k}.fit.wav'; tempo(p,f,r)
        mixar([(f,ini)],s['t0'],d,out,fade=True)
        print(k,'acelerado',round(r,3),'fala',round(dur(f),2),'de',round(alvo,2))
    print(out, round(dur(out),2),'alvo',d)
