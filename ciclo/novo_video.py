# -*- coding: utf-8 -*-
"""Cria a pasta e o cartão de um vídeo novo (ou de um lote de Shorts).
Uso (da raiz): python code/ciclo/novo_video.py <canal> <tema> [--tipo longo|shorts] [--data AAAA-MM-DD] [--simular]
Exemplo: python code/ciclo/novo_video.py palavras "preguiça" --data 2026-12-02"""
import datetime as dt
import re
import shutil
import sys

from comum import RAIZ, CANAIS, canais, cartoes, slug, vazio, datas_de_leitura

MODELO = CANAIS / '_modelo' / 'episodio'


def proximo(base, prefixo):
    nums = [int(m.group(1)) for d in base.iterdir() if d.is_dir()
            for m in [re.match(rf'{prefixo}(\d+)', d.name)] if m] if base.is_dir() else []
    return max(nums, default=-1 if prefixo == 'lote-' else 0) + 1


def herdado(canal):
    apr = [(c.get('No ar em', ''), p.split('/')[-1], c) for p, c, _ in cartoes(canal)
           if not vazio(c.get('Aprendizado (1 frase)'))]
    if not apr:
        return f'? (nenhum vídeo fechou a leitura que decide; ler `canais/{canal}/validacao/PAINEL.md` e anotar aqui)'
    return ' · '.join(f'{nome}: {c["Aprendizado (1 frase)"]} → {c.get("Decisão para o próximo vídeo", "?")}'
                      for _, nome, c in sorted(apr, key=lambda x: x[0], reverse=True)[:3])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opc = sys.argv[1:]
    if len(args) < 2:
        sys.exit(__doc__)
    canal, tema = args[0], args[1]
    cfgs = canais()
    if canal not in cfgs:
        sys.exit(f'Canal desconhecido: {canal}. Canais: {", ".join(cfgs)}')
    cfg = cfgs[canal]
    tipo = opc[opc.index('--tipo') + 1] if '--tipo' in opc else 'longo'
    data = dt.date.fromisoformat(opc[opc.index('--data') + 1]) if '--data' in opc else None
    simular = '--simular' in opc

    if tipo == 'shorts':
        base = CANAIS / canal / 'shorts'
        nome = f'lote-{proximo(base, "lote-"):02d}' + ('' if slug(tema) in ('', 'lote') else f'-{slug(tema)}')
    else:
        base = CANAIS / canal / 'episodios'
        nome = f'ep{proximo(base, "ep"):02d}-{slug(tema)}'
    pasta = base / nome
    if pasta.exists():
        sys.exit(f'Já existe: {pasta.relative_to(RAIZ).as_posix()}')

    if data:
        linhas = '\n'.join(f'| {n} | {d} | | | | | | | |' for n, d in datas_de_leitura(cfg, data))
    else:
        linhas = '\n'.join(f'| {l["nome"]}{" (decide)" if l.get("decide") else ""} | ? | | | | | | | |'
                           for l in cfg.get('leituras', []))
    if not linhas:
        linhas = '| ? | ? | | | | | | | |'
    troca = {'{{canal_nome}}': cfg['nome'], '{{canal}}': canal, '{{pasta}}': nome, '{{tipo}}': tipo,
             '{{data}}': data.isoformat() if data else '?', '{{herdou}}': herdado(canal), '{{linhas_leituras}}': linhas}

    def preencher(texto):
        for a, b in troca.items():
            texto = texto.replace(a, b)
        return texto

    ep = cfg.get('episodio', {})
    estado = ep.get('arquivo_de_estado', 'ESTADO.md')
    modelo_estado = RAIZ / ep['modelo_de_estado'] if ep.get('modelo_de_estado') else MODELO / 'ESTADO.md'
    plano = [f'{pasta.relative_to(RAIZ).as_posix()}/', '  EXPERIMENTO.md', f'  {estado}', '  final/', '  midia/']
    plano += [f'  {e}' for e in ep.get('extras', []) if e.endswith('/')]
    print('\n'.join(plano))
    if simular:
        print('(simulação: nada foi criado)')
        return

    pasta.mkdir(parents=True)
    for sub in ('final', 'midia'):
        (pasta / sub).mkdir()
        aviso = MODELO / sub / 'LEIA-ME.txt'
        if aviso.is_file():
            shutil.copy(aviso, pasta / sub / 'LEIA-ME.txt')
    for e in ep.get('extras', []):
        if e.endswith('/'):
            (pasta / e).mkdir(parents=True, exist_ok=True)
    (pasta / 'EXPERIMENTO.md').write_text(preencher((MODELO / 'EXPERIMENTO.md').read_text(encoding='utf-8')), encoding='utf-8')
    (pasta / estado).write_text(preencher(modelo_estado.read_text(encoding='utf-8')), encoding='utf-8')

    arquivos = [e for e in ep.get('extras', []) if not e.endswith('/')]
    print('\nPróximos passos:')
    print(f'1. Ler canais/{canal}/validacao/PAINEL.md e preencher "Antes do roteiro" no cartão (hipótese, 1 ou 2 mudanças, métrica, critério).')
    print(f'2. Seguir a ordem de canais/{canal}/AGENTS.md: métricas anteriores → pesquisa do viral → título e thumb prontos → roteiro → resto.')
    if arquivos:
        print('3. Arquivos que este canal espera na pasta: ' + ', '.join(arquivos) + '.')
    print('Depois: python code/ciclo/painel.py')


if __name__ == '__main__':
    main()
