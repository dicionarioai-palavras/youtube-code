# -*- coding: utf-8 -*-
"""Confere a pasta: canais, cartões, links dos arquivos de regra, regra repetida, aviso empilhado no topo e Git do code/.
Uso (da raiz): python code/ciclo/conferir.py [--tudo] [--midia] [--hoje AAAA-MM-DD]
  --tudo   confere links também nos documentos de dentro dos episódios (mais ruído histórico)
  --midia  soma a mídia que ainda está nos episódios já no ar (fora de final/)"""
import datetime as dt
import os
import re
import subprocess
import sys
from collections import defaultdict

from comum import RAIZ, CANAIS, canais, cartoes, pastas_sem_cartao, vazio, leitura_feita, primeira_data

FORA = {'_historico', '_to_delete', '_credenciais', 'node_modules', '.git', 'out', 'public', 'vox-director',
        'scrcpy', 'bin', 'tarefas', 'direcao-video', 'dados'}
RAIZES_ANTIGAS = {'palavras', 'canal-the-mind-behind', 'validacao', 'midias-compartilhadas', 'estudo-envelopamento',
                  'processos', 'automacao', 'luiz', 'cursos'}
CAMPOS = ['Canal', 'Tipo', 'Vídeo', 'Estado', 'No ar em', 'Herdou de', 'Hipótese', 'O que mudou (1 ou 2)',
          'Métrica principal', 'Critério de decisão', 'Resultado', 'Aprendizado (1 frase)', 'Decisão para o próximo vídeo']
ESTADOS = {'em produção', 'agendado', 'no ar', 'parado', 'fechado'}
MIDIA = {'.mp4', '.mov', '.mkv', '.avi', '.webm', '.wav', '.mp3', '.aac', '.m4a', '.flac', '.png', '.jpg', '.jpeg',
         '.webp', '.psd', '.prproj', '.aep', '.zip', '.tif', '.tiff', '.gif'}
# registros que não se alteram e arquivos gerados: ficam fora do teste de links
REGISTROS = {'_governanca/PROPOSTA-REESTRUTURACAO.md', '_governanca/REGISTRO-DE-PARAMETROS-POR-VIDEO.md',
             'audios/CATALOGO-ACUSTICO.md', 'cronograma/REGISTRO-DIARIO.md'}
GERADOS = ('cronograma/CRONOGRAMA-', 'cronograma/AGENDA', 'cronograma/PROMPT-')
erros, avisos, infos = [], [], []


def rel(p):
    return p.relative_to(RAIZ).as_posix()


def mds(base, fundo=True):
    """arquivos .md sob base, pulando pastas de FORA"""
    if base.is_file():
        return [base] if base.suffix == '.md' else []
    out = []
    for dp, dn, fn in os.walk(base):
        dn[:] = [d for d in dn if d not in FORA] if fundo else []
        out += [RAIZ.__class__(dp) / f for f in fn if f.endswith('.md')]
    return out


def arquivos_de_regra(tudo):
    out = [p for p in RAIZ.glob('*.md')]
    for c in sorted(p for p in CANAIS.iterdir() if p.is_dir()):
        out += [c / 'AGENTS.md'] if (c / 'AGENTS.md').is_file() else []
        out += mds(c / 'guias') + mds(c / 'validacao')
        if tudo:
            out += mds(c)
    for sub in ('_governanca', '_esteiras', '.agents', 'estudos', 'cronograma', 'identidade-visual', 'audios'):
        out += mds(RAIZ / sub, fundo=sub in ('_esteiras', '.agents') or tudo)
    out += [p for p in [RAIZ / 'code' / 'AGENTS.md', RAIZ / '_skills-redes' / 'LEIA-ME.md'] if p.is_file()]
    return sorted(p for p in set(out) if rel(p) not in REGISTROS and not rel(p).startswith(GERADOS))


def conferir_canais(hoje):
    cfgs = canais()
    for d in sorted(p for p in CANAIS.iterdir() if p.is_dir() and not p.name.startswith('_')):
        if d.name not in cfgs:
            erros.append(f'canal sem canal.json: canais/{d.name}')
            continue
        cfg = cfgs[d.name]
        for k in ('canal', 'nome', 'horarios', 'leituras', 'episodio'):
            if k not in cfg:
                erros.append(f'canais/{d.name}/canal.json sem a chave "{k}"')
        if cfg.get('canal') != d.name:
            erros.append(f'canais/{d.name}/canal.json: "canal" diferente do nome da pasta')
        if not (d / 'AGENTS.md').is_file():
            erros.append(f'canal sem AGENTS.md: canais/{d.name}')
        for s in pastas_sem_cartao(d.name):
            erros.append(f'pasta sem cartão EXPERIMENTO.md: {s}')
        abertos = 0
        for pasta, campos, leituras in cartoes(d.name):
            for k in CAMPOS:
                if k not in campos:
                    erros.append(f'{pasta}/EXPERIMENTO.md sem o campo "{k}"')
            abertos += sum(1 for k in CAMPOS if vazio(campos.get(k, '?')))
            estado = campos.get('Estado', '').strip().lower()
            if estado not in ESTADOS and not estado.startswith('?'):
                avisos.append(f'{pasta}: estado fora da lista ("{campos.get("Estado")}")')
            if estado in ('no ar', 'agendado', 'em produção') and vazio(campos.get('Hipótese')):
                avisos.append(f'{pasta}: sem hipótese registrada')
            if estado != 'parado':
                for l in leituras:
                    d0 = primeira_data(l.get('Data'))
                    fim = primeira_data((l.get('Data') or '').split(' a ', 1)[-1]) or d0
                    if d0 and fim < hoje and not leitura_feita(l):
                        avisos.append(f'{pasta}: leitura "{l.get("Leitura")}" atrasada (era {l.get("Data")})')
        infos.append(f'canais/{d.name}: {len(cartoes(d.name))} cartões, {abertos} campos em aberto ("?")')
    return cfgs


TOKEN = re.compile(r'`([^`\n]+)`|\]\(([^)\s]+)\)')
PULA = re.compile(r'[<>*{}\[\]…|]|AAAA|NN-|-NN|https?:|^[A-Za-z]:|^@|^/|^~|^(python3?|node|npm|git|npx|cd) |\s--')


def conferir_links(arquivos):
    entradas = {p.name for p in RAIZ.iterdir()}
    n = 0
    quebrados = defaultdict(list)
    for a in arquivos:
        try:
            texto = a.read_text(encoding='utf-8')
        except Exception:
            continue
        for m in TOKEN.finditer(texto):
            tok = (m.group(1) or m.group(2)).strip().replace('\\', '/')
            tok = tok.split('#')[0].rstrip('.,;:')
            if '/' not in tok or PULA.search(tok) or (' ' in tok and not (RAIZ / tok).exists()):
                continue
            relativo = tok.startswith(('./', '../'))
            primeiro = tok.split('/')[0]
            if not relativo and primeiro not in entradas and primeiro not in RAIZES_ANTIGAS:
                continue
            n += 1
            alvo1, alvo2 = RAIZ / tok, (a.parent / tok)
            if alvo1.exists() or alvo2.exists():
                continue
            quebrados[rel(a)].append(tok)
    for a, toks in sorted(quebrados.items()):
        erros.append(f'{a}: {len(toks)} caminho(s) que não existem → ' + ' · '.join(sorted(set(toks))[:6])
                     + (' …' if len(set(toks)) > 6 else ''))
    return n


def conferir_repeticao_e_avisos(arquivos):
    donos = [a for a in arquivos if a.name in ('DECISOES-VIGENTES.md', 'AGENTS.md', 'VALIDACAO-E-METAS.md')
             or a.parent.name == 'guias']
    onde = defaultdict(set)
    for a in donos:
        linhas = a.read_text(encoding='utf-8').splitlines()
        for ln in linhas:
            base = re.sub(r'\s+', ' ', re.sub(r'^\s*(?:[-*>]|\d+\.)\s*', '', ln)).strip()
            if len(base) >= 160 and not base.startswith('|'):
                onde[base].add(rel(a))
        for i, ln in enumerate(linhas[:12]):
            if ln.lstrip().startswith('>') and re.search(r'vigente|prevalece|substitui|atualizad[oa] em|desatualizad', ln, re.I):
                avisos.append(f'{rel(a)}: aviso empilhado no topo (linha {i + 1}) — editar a regra no lugar e arquivar a antiga')
                break
    for base, arqs in sorted(onde.items()):
        if len(arqs) > 1:
            avisos.append('regra repetida em ' + ' + '.join(sorted(arqs)) + f': "{base[:70]}…"')


def conferir_git():
    code = RAIZ / 'code'
    if (code / '_credenciais').exists():
        erros.append('há uma pasta _credenciais dentro de code/')
    if not (code / '.git').exists():
        avisos.append('code/ não é um repositório Git')
        return
    try:
        lista = subprocess.run(['git', '-C', str(code), 'ls-files'], capture_output=True, text=True, timeout=60).stdout.splitlines()
    except Exception as e:
        avisos.append(f'não deu para listar o Git do code/ ({e.__class__.__name__})')
        return
    ruins = [f for f in lista if re.search(r'(^|/)\.env($|\.(?!example))|backup.?code|credenc|\.pem$|\.key$|node_modules/', f, re.I)]
    for f in ruins:
        erros.append(f'arquivo sensível ou pesado no Git do code/: {f}')
    infos.append(f'Git do code/: {len(lista)} arquivos versionados')


def midia_dos_no_ar():
    for canal in canais():
        for pasta, campos, _ in cartoes(canal):
            if campos.get('Estado', '').strip().lower() not in ('no ar', 'fechado'):
                continue
            total = 0
            for dp, dn, fn in os.walk(RAIZ / pasta):
                dn[:] = [d for d in dn if d != 'final']
                total += sum(os.path.getsize(os.path.join(dp, f)) for f in fn if os.path.splitext(f)[1].lower() in MIDIA)
            if total > 50 * 1024 * 1024:
                infos.append(f'{pasta}: {total / 1024 ** 3:.2f} GB de mídia fora de final/ (vídeo já no ar)')


def main():
    hoje = dt.date.today()
    if '--hoje' in sys.argv:
        hoje = dt.date.fromisoformat(sys.argv[sys.argv.index('--hoje') + 1])
    tudo = '--tudo' in sys.argv
    conferir_canais(hoje)
    arquivos = arquivos_de_regra(tudo)
    n = conferir_links(arquivos)
    conferir_repeticao_e_avisos(arquivos)
    conferir_git()
    if '--midia' in sys.argv:
        midia_dos_no_ar()
    print(f'== Conferência da pasta — {hoje.isoformat()} ==')
    print(f'{len(arquivos)} documentos conferidos, {n} caminhos testados')
    for titulo, lista in (('ERROS', erros), ('AVISOS', avisos), ('INFORMAÇÕES', infos)):
        print(f'\n{titulo} ({len(lista)})')
        for m in lista:
            print('  - ' + m)
    sys.exit(1 if erros else 0)


if __name__ == '__main__':
    main()
