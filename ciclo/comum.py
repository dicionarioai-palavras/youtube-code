# -*- coding: utf-8 -*-
"""Funções comuns do ciclo lean (construir -> medir -> aprender). Ver _governanca/CICLO-LEAN.md."""
from pathlib import Path
import datetime as dt
import json
import re
import unicodedata

RAIZ = Path(__file__).resolve().parents[2]
CANAIS = RAIZ / 'canais'
CARTAO = 'EXPERIMENTO.md'
SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
VAZIOS = {'', '?', '—', '-', '–'}
COLUNAS_DE_NUMERO = ['Impressões', 'CTR', '% aos 30 s', '% assistida', 'Outros números']


def canais():
    """{pasta: configuração} de cada canal (pastas que começam com _ ficam de fora)."""
    out = {}
    for f in sorted(CANAIS.glob('*/canal.json')):
        if not f.parent.name.startswith('_'):
            out[f.parent.name] = json.loads(f.read_text(encoding='utf-8'))
    return out


def vazio(v):
    return (v or '').strip() in VAZIOS


def slug(texto):
    t = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def dia_util_depois(d):
    while d.weekday() >= 5:
        d += dt.timedelta(days=1)
    return d


def dia_util_antes(d):
    while d.weekday() >= 5:
        d -= dt.timedelta(days=1)
    return d


def datas_de_leitura(cfg, estreia):
    """[(nome da leitura, data ou janela em texto ISO)], contadas da estreia.
    Leitura que cai no fim de semana vai para a segunda seguinte (regra da rotina de Luiz)."""
    out = []
    for l in cfg.get('leituras', []):
        ini = dia_util_depois(estreia + dt.timedelta(days=l['dias']))
        txt = ini.isoformat()
        if 'ate' in l:
            fim = max(ini, dia_util_antes(estreia + dt.timedelta(days=l['ate'])))
            if fim != ini:
                txt = f'{ini.isoformat()} a {fim.isoformat()}'
        out.append((l['nome'] + (' (decide)' if l.get('decide') else ''), txt))
    return out


def primeira_data(texto):
    m = re.search(r'(\d{4})-(\d{2})-(\d{2})', texto or '')
    return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None


def data_curta(d):
    return f'{SEMANA[d.weekday()]} {d.day:02d}/{d.month:02d}/{d.year}' if d else '?'


def _celulas(linha):
    linha = linha.strip().replace('\\|', '\x00')
    return [c.strip().replace('\x00', '|') for c in linha.strip('|').split('|')]


def ler_cartao(caminho):
    """Devolve (campos, leituras). campos = {Campo: Valor} das tabelas Campo/Valor;
    leituras = lista de dicionários da tabela da seção 'Leituras'."""
    campos, leituras, secao, cab = {}, [], None, None
    for ln in caminho.read_text(encoding='utf-8').splitlines():
        if ln.startswith('## '):
            secao, cab = ln[3:].strip(), None
            continue
        if not ln.lstrip().startswith('|'):
            continue
        cel = _celulas(ln)
        if all(set(c) <= set('-: ') for c in cel):
            continue
        if secao == 'Leituras':
            if cab is None:
                cab = cel
            else:
                leituras.append(dict(zip(cab, cel + [''] * (len(cab) - len(cel)))))
        elif cel and cel[0] != 'Campo' and len(cel) >= 2:
            campos[cel[0]] = ' / '.join(cel[1:])
    return campos, leituras


def leitura_feita(l):
    return any(not vazio(l.get(c)) for c in COLUNAS_DE_NUMERO)


def cartoes(canal):
    """[(pasta relativa à raiz, campos, leituras)] de episódios e lotes de Shorts do canal."""
    out = []
    for sub in ('episodios', 'shorts'):
        base = CANAIS / canal / sub
        if not base.is_dir():
            continue
        for d in sorted(p for p in base.iterdir() if p.is_dir()):
            c = d / CARTAO
            if c.is_file():
                campos, leituras = ler_cartao(c)
                out.append((d.relative_to(RAIZ).as_posix(), campos, leituras))
    return out


def pastas_sem_cartao(canal):
    out = []
    for sub in ('episodios', 'shorts'):
        base = CANAIS / canal / sub
        if base.is_dir():
            out += [d.relative_to(RAIZ).as_posix() for d in sorted(base.iterdir())
                    if d.is_dir() and not d.name.startswith('_') and not (d / CARTAO).is_file()]
    return out
