# -*- coding: utf-8 -*-
"""Gera canais/<canal>/validacao/PAINEL.md a partir dos cartões EXPERIMENTO.md.
Uso (da raiz): python code/ciclo/painel.py [--hoje AAAA-MM-DD]"""
import datetime as dt
import sys

from comum import (RAIZ, CANAIS, canais, cartoes, pastas_sem_cartao, vazio, leitura_feita,
                   primeira_data, data_curta, COLUNAS_DE_NUMERO)


def cel(v):
    return (v or '?').replace('|', '\\|').strip() or '?'


def gerar(canal, cfg, hoje):
    cs = cartoes(canal)
    L = [f'# Painel — {cfg["nome"]}', '',
         f'Gerado por `code/ciclo/painel.py` em {hoje.isoformat()}. **Não editar à mão:** a fonte são os cartões '
         '`EXPERIMENTO.md` de cada episódio. Como o ciclo funciona: `_governanca/CICLO-LEAN.md`.'
         + (f' Metas e como ler cada métrica: `canais/{canal}/validacao/VALIDACAO-E-METAS.md`.'
            if (CANAIS / canal / 'validacao' / 'VALIDACAO-E-METAS.md').is_file() else ''), '']

    # 1. aprendizados
    L += ['## 1. Aprendizados e decisões (ler antes de começar um vídeo)', '']
    apr = [(c.get('No ar em', ''), p, c) for p, c, _ in cs if not vazio(c.get('Aprendizado (1 frase)'))]
    if apr:
        L += ['| Vídeo | Resultado | Aprendizado | Decisão para o próximo vídeo | Aplicada em |', '|---|---|---|---|---|']
        for _, p, c in sorted(apr, key=lambda x: x[0], reverse=True):
            L.append(f'| `{p.split("/")[-1]}` | {cel(c.get("Resultado"))} | {cel(c.get("Aprendizado (1 frase)"))} | '
                     f'{cel(c.get("Decisão para o próximo vídeo"))} | {cel(c.get("Aplicada em"))} |')
    else:
        L.append('Nenhum vídeo fechou a leitura que decide ainda. Enquanto isso, vale o que está em "Todos os experimentos" e em "Números registrados".')
    L.append('')

    # 2. próximas leituras
    L += ['## 2. Leituras a fazer', '']
    pend = []
    for p, c, ls in cs:
        if (c.get('Estado', '').strip().lower() == 'parado'):
            continue
        for l in ls:
            if not leitura_feita(l):
                d = primeira_data(l.get('Data'))
                pend.append((d or dt.date.max, p.split('/')[-1], l.get('Leitura', '?'), l.get('Data', '?')))
    if pend:
        L += ['| Data | Vídeo | Leitura | Situação |', '|---|---|---|---|']
        for d, nome, leitura, texto in sorted(pend):
            sit = '?' if d == dt.date.max else ('atrasada' if d < hoje else 'hoje' if d == hoje else 'prevista')
            quando = data_curta(d) if d != dt.date.max else cel(texto)
            if ' a ' in (texto or ''):
                fim = primeira_data(texto.split(' a ', 1)[1])
                quando += f' a {data_curta(fim)}'
                if fim and d < hoje <= fim:
                    sit = 'na janela'
            L.append(f'| {quando} | `{nome}` | {cel(leitura)} | {sit} |')
    else:
        L.append('Nenhuma leitura pendente.')
    L.append('')

    # 3. todos
    L += ['## 3. Todos os experimentos', '',
          '| Pasta | Vídeo | Estado | No ar em | Hipótese | O que mudou | Métrica e critério | Resultado |', '|---|---|---|---|---|---|---|---|']
    for p, c, _ in cs:
        L.append(f'| `{p.split("/")[-1]}` | {cel(c.get("Vídeo"))} | {cel(c.get("Estado"))} | {cel(c.get("No ar em"))} | '
                 f'{cel(c.get("Hipótese"))} | {cel(c.get("O que mudou (1 ou 2)"))} | '
                 f'{cel(c.get("Métrica principal"))} · {cel(c.get("Critério de decisão"))} | {cel(c.get("Resultado"))} |')
    sem = pastas_sem_cartao(canal)
    if sem:
        L += ['', 'Pastas sem cartão: ' + ', '.join(f'`{s}`' for s in sem) + '.']
    L.append('')

    # 4. números
    L += ['## 4. Números registrados', '']
    linhas = []
    for p, c, ls in cs:
        for l in ls:
            if leitura_feita(l):
                linhas.append(f'| `{p.split("/")[-1]}` | {cel(l.get("Leitura"))} | {cel(l.get("Data"))} | '
                              + ' | '.join(cel(l.get(k)) for k in COLUNAS_DE_NUMERO)
                              + f' | {cel(l.get("Fonte"))} | {cel(l.get("Leitura em 1 frase"))} |')
    if linhas:
        L += ['| Vídeo | Leitura | Data | ' + ' | '.join(COLUNAS_DE_NUMERO) + ' | Fonte | Leitura em 1 frase |',
              '|' + '---|' * (5 + len(COLUNAS_DE_NUMERO))] + linhas
    else:
        L.append('Nenhum número registrado ainda.')
    L.append('')

    destino = CANAIS / canal / 'validacao' / 'PAINEL.md'
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text('\n'.join(L), encoding='utf-8')
    return destino, len(cs), len(pend)


def main():
    hoje = dt.date.today()
    if '--hoje' in sys.argv:
        hoje = dt.date.fromisoformat(sys.argv[sys.argv.index('--hoje') + 1])
    for canal, cfg in canais().items():
        destino, n, pend = gerar(canal, cfg, hoje)
        print(f'{destino.relative_to(RAIZ).as_posix()}: {n} cartões, {pend} leituras a fazer')


if __name__ == '__main__':
    main()
