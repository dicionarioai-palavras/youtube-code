# The Mind Behind — plano da montagem v2 (direção visual v2, 06/11/2026). Genérico por episódio.
# Lê <episodio>/montagem/plano.json (cenas por bloco, ancoradas numa frase da narração, com movimento planejado)
# e <episodio>/montagem/transcricao-palavras.json (gerado por conferir-narracao.py --palavras)
# e grava <episodio>/montagem/timeline.json (o que o Remotion lê: composição tmb-epNN, componente EpisodioV2).
# Uso: python plano_v2.py <pasta-do-episodio>
# Formato do plano.json:
#   {"pasta": "ep02", "capitulos": {"02-parte-1": ["I", "WHO THEY WERE"], ...}, "abertura_depois_de": "01-abertura",
#    "intro_s": 3.0, "capitulo_s": 2.5, "respiro_s": 0.6, "final_s": 20,
#    "blocos": {"01-abertura": [[null, {cena}], ["frase da narração", {cena}], ...], ...}}
#   cena: {"tipo": "img"|"video"|"ficha"|"nomes"|"mapa"|"dados"|"citacao", "src": "...", "mov": "revela|descobre|desliza|parado",
#          "foco": [x, y], "escala": [a, b], "destino": [x, y], "corte": true (corte seco), "pista": true (vinheta que fecha), ...}
# A frase âncora é procurada na transcrição depois da cena anterior (números da transcrição viram palavras).
import json, re, sys
from pathlib import Path
try:
    from num2words import num2words
except ImportError:
    num2words = None

ep = Path(sys.argv[1])
P = json.loads((ep / 'montagem' / 'plano.json').read_text(encoding='utf-8'))
W = json.loads((ep / 'montagem' / 'transcricao-palavras.json').read_text(encoding='utf-8'))

def nrm(w): return re.sub(r"[^a-z0-9']", '', w.lower())
def palavras_de(n, suf=None):
    if not num2words: return [n]
    try:
        modo = 'ordinal' if suf in ('st', 'nd', 'rd', 'th') else ('year' if len(n) == 4 else 'cardinal')
        return re.split(r'[\s-]+', num2words(int(n), to=modo).replace(',', ''))
    except Exception: return [n]
def tokens(ws):
    out = []
    for w, s, e in ws:
        for p in re.split(r'[\s\-–—]+', w):
            n = nrm(p)
            if not n: continue
            m = re.fullmatch(r'(\d+)(st|nd|rd|th|s)?', n)
            if m:
                for x in palavras_de(m.group(1), m.group(2)): out.append((nrm(x), s, e))
            else: out.append((n, s, e))
    return out
def achar(toks, frase, depois):
    q = [nrm(x) for x in re.split(r'[\s\-]+', frase) if nrm(x)]
    for i in range(len(toks)):
        if toks[i][1] < depois: continue
        if [t[0] for t in toks[i:i + len(q)]] == q: return toks[i][1]
    raise SystemExit(f'âncora não achada: "{frase}"')

FPS = 30; t = 0.0; cenas = []; blocos = []
for b, lista in P['blocos'].items():
    if b in P.get('capitulos', {}):
        n, tit = P['capitulos'][b]
        cenas.append({'tipo': 'capitulo', 'numero': n, 'titulo': tit, 'ini': round(t, 3), 'fim': round(t + P['capitulo_s'], 3), **({'digita': True} if P.get('digita') else {})}); t += P['capitulo_s']
    dur = W[b]['dur']; toks = tokens(W[b]['words'])
    blocos.append({'id': b, 'ini': round(t, 3), 'dur': dur})
    starts = []; ultimo = 0
    for anc, c in lista:
        s = 0.0 if anc is None else max(0, achar(toks, anc, ultimo) - 0.12)
        starts.append((s, c)); ultimo = s + 0.2
    for k, (s, c) in enumerate(starts):
        e = starts[k + 1][0] if k + 1 < len(starts) else dur
        cenas.append({**c, 'ini': round(t + s, 3), 'fim': round(t + e, 3)})
    t += dur
    if b == P.get('abertura_depois_de'):
        cenas.append({'tipo': 'abertura', 'ini': round(t, 3), 'fim': round(t + P['intro_s'], 3)}); t += P['intro_s']
    elif b != list(P['blocos'])[-1]:
        cenas[-1]['fim'] = round(t + P['respiro_s'], 3); t += P['respiro_s']
cenas.append({'tipo': 'final', 'ini': round(t, 3), 'fim': round(t + P['final_s'], 3)}); t += P['final_s']
out = {'fps': FPS, 'duracao': round(t, 3), 'pasta': P['pasta'], 'blocos': blocos, 'cenas': cenas}
(ep / 'montagem' / 'timeline.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
print('duração total', round(t, 1), 's ·', len(cenas), 'cenas')
for c in cenas:
    d = c['fim'] - c['ini']
    if d < 2.0 or d > 16 or (c['tipo'] == 'video' and d > 9): print('atenção', c.get('src', c['tipo']), round(c['ini'], 1), round(d, 1), 's')
